// pages/red-envelope/index.js
const app = getApp()
import formatTime from '../../utils/util.js'
const timer = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timeProgress:'/images/gold/time_progress.png',
    enveReceive:'/images/gold/receive.png',
    enveNoReceive:'/images/gold/no-receive.png',
    btnImg:'/images/gold/button.png',
    withoutTask:true,
    fail:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let timeProgress = wx.getFileSystemManager().readFileSync(this.data.timeProgress,'base64')
    let enveReceive = wx.getFileSystemManager().readFileSync(this.data.enveReceive,'base64')
    let enveNoReceive = wx.getFileSystemManager().readFileSync(this.data.enveNoReceive,'base64')
    let btnImg = wx.getFileSystemManager().readFileSync(this.data.btnImg,'base64')
    this.setData({
      timeProgress:'data:image/jpg;base64,' + timeProgress,
      enveReceive:'data:image/jpg;base64,' + enveReceive,
      enveNoReceive:'data:image/jpg;base64,' + enveNoReceive,
      btnImg:'data:image/jpg;base64,' + btnImg,
    })
    this.getUserRedPacketInfo()
    this.getCreditStrategy()
    this.getAwardUser()
  },
  onUnload: function (options) {
    clearInterval(timer[0])
  },
  hideModal(){//隐藏弹出框
    this.setData({
      showMask:false,
      showSuccess:false,
      failToast:false,
      modal1:false,
      startTask:false
    })
  },
  // 展示规则弹窗
  showRule(){
    console.log('fdshfjd')
    this.setData({
      showMask:true,
      modal1:true
    })
  },
  // 获取用户信息
  getUserRedPacketInfo(){
      let _this = this
      let data = JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      })
      _this.setHttpRequst("RedPacket",'GetUserRedPacketInfo',data,function(res){
        let redPacket = res.data.redPacket // 获取用户红包详情
        let userList = res.data.userList // 获取领取用户列表
        let redPacketId = redPacket.id // 获取红包id
        let needAskCount = redPacket.needAskCount // 获取邀请人数
        let consumeScore = redPacket.consumeScore // 获取消耗购物金
        let createTime = redPacket.createTime // 获取发起时间
        let endTime  = redPacket.endTime // 获取结束时间
        let isAward = redPacket.isAward // 是否已领取奖励
        let type = redPacket.type // 获取红包分配方式
        let award = redPacket.award // 获取奖励购物金
        if (userList.length >= needAskCount) {
          if (!isAward) {
            _this.setData({
              showSuccess:true,
              showMask:true,
              isAward:false
            })
          }
          else {
            _this.setData({
              isAward:true
            })
            _this.getBaseTaskData()
          }
        }
        else {
          _this.getSysTime(endTime)
        }
        _this.setData({
          redPacketId:redPacketId,
          userList:userList,
          withoutTask:false,
          needAskCount:needAskCount,
          consumeScore:consumeScore,
          type:type,
          award:award,
        },function(){
        })
      })
    },
  // 获取系统时间
  getSysTime(endTime){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst("System",'GetBaseInfo',data,function(res){
      let serverTimeStamp = res.data.serverTimeStamp  // 获取服务器时间
      if (serverTimeStamp > endTime) {
        _this.setData({
          failToast:true,
          failTask:true,
          showMask:true,
          fail:true
        })
        _this.getBaseTaskData()
      }
      else {
        _this.countDown(serverTimeStamp,endTime)
      }
    })
  },
  // 获取活动基础数值(用户未发布红包任务时)
  getBaseTaskData(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst('RedPacket','GetRule',data,function(res){
      let userList = []
      let needAskCount = res.data.needAskCount // 获取邀请人数
      let consumeScore = res.data.consumeScore // 获取消耗购物金
      let limitHour = res.data.limitHour // 获取限时多少小时
      let type = res.data.type // 获取红包分配方式
      let award = res.data.award // 获取奖励购物金
      _this.setData({
        userList:userList,
        withoutTask:true,
        needAskCount:needAskCount,
        consumeScore:consumeScore,
        limitHour:limitHour,
        type:type,
        award:award
      })
    },function(){})
  },
  // 获取活动规则
  getCreditStrategy(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      type:4
    })
    _this.setHttpRequst('Credit','GetCreditStrategy',data,function(res){
      let content = res.data.content // 获取推荐文案
      _this.setData({
        content:content
      })
    },function(){})
  },
  // 发红包
  provideRedPacket(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst('RedPacket','ProvideRedPacket',data,function(res){
      let redPacketId = res.data.redPacketId // 获取红包参数
      _this.setData({
        redPacketId:redPacketId,
        showMask:true,
        startTask:true
      })
    },function(){})
  },
  // 用户领取完成红包
  getUserAward(){
    let _this = this
    console.log(_this.data.redPacketId);
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      id:_this.data.redPacketId
    })
    _this.setHttpRequst('RedPacket','GetUserAward',data,function(res){
      let redPacketId = res.data.redPacketId // 获取红包参数
      wx.showToast({
        title: '成功领取红包奖励',
        icon: 'none',
        duration: 2000
      })
      _this.setData({
        isAward:true
      })
      _this.getUserAward()
    },function(){})
  },
  // 获取红包获奖列表
  getAwardUser(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      page:1,
      pageLength:10
    })
    _this.setHttpRequst('RedPacket','GetAwardUser',data,function(res){
      let showAwardList = res.data.userList // 获取红包参数
      for(let i in showAwardList){
        let url = showAwardList[i].avatar
        let img = url.substr(0,4)
        if(img != 'http'){
          showAwardList[i].avatar = app.globalData.imageUrl + url
        }
        let nickname = showAwardList[i].nickname
        showAwardList[i].newNickName = nickname.substr(0,1) + "***" +nickname.substr(-1,1)
      }
      _this.setData({
        showAwardList:showAwardList
      })
    },function(){})
  },
  // 发送http请求
  setHttpRequst(Class,Method,Data,Succ,Fail,resFail){
      let _this = this
      let cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      wx.request({
        url: `https://${app.globalData.productUrl}/api?resprotocol=json&reqprotocol=json&class=${Class}&method=${Method}`,
        method: 'post',
        data: Data,
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': cookie
        },
        success: (res) => {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
            if (code == 1) {
              Succ(res)
            }else if (code == 1019) {
              wx.navigateTo({
                url: '/pages/login/index'
              })
            }else if (code == 17003) {
              _this.getBaseTaskData()
            }
            else {
              wx.showModal({
                title:'提示',
                content:msg,
                showCancel:false,
                success:function(res){}
              })
            }
        },
        fail: (res) => {
          resFail(res)
        }
      })
    },
  /*倒计时*/
  countDown(start,end) {
    let _this = this

    timer[0] = setInterval(() => {
      start += 1
      let count = end - start
      let hours = formatTime.formatNumber(parseInt(count / 3600))
      let minutes = formatTime.formatNumber(parseInt((count - parseInt(hours) * 3600)/ 60))
      let secondeds = formatTime.formatNumber(parseInt((count - parseInt(hours) * 3600-parseInt(minutes)*60)))
      let showTime = hours+':'+minutes+':'+secondeds
      _this.setData({
        showTime:showTime,
      })
    }, 1000)
    return timer[0]
  },
  // 分享文案
  onShareAppMessage(res){
    let _this = this
    _this.setData({
      showMask:false,
      startTask:false
    })
    let userInfo = wx.getStorageSync('userInfo')
    let nickname = userInfo.nickname
    let userId = userInfo.userId
    return{
      title:nickname+'@你！新人快来领红包啦!',
      imageUrl:'https://allnet-shop-cdn.91uda.com/images/1/2019/03/jRNrm2fzZm2wwHU4liZg4ziWZGumGG.jpg',
      path:'/pages/red-envelope-receive/index?askType=1&askParam='+_this.data.redPacketId+'&userId='+userId+''
    }
  }
})
