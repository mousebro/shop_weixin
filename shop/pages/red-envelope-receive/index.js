// pages/red-envelope-receive/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btnImg:'/images/gold/button.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let btnImg = wx.getFileSystemManager().readFileSync(this.data.btnImg,'base64')
    this.setData({btnImg:'data:image/jpg;base64,' + btnImg,})
    this.getRemomendGoods()
    this.getAwardUser()
    this.getRedPacketRule()
    // 红包邀请进入该页面
    if (wx.getStorageSync('askType') == 1) {
      this.getSharerInfo()
    }
    // 新用户分享邀请
    else if (wx.getStorageSync('askType') == 2) {
      this.getSharerInfo2()
    }
  },
  // 隐藏弹出窗
  hideModal(){
    this.setData({
      showMask:false,
      showToast:false
    })
  },
  // 获取分享红包者信息
  getSharerInfo(){
    let _this = this
    let userId = wx.getStorageSync('userId')
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      userId:userId
    })
    _this.setHttpRequst('MiniAppUser','GetInfo',data,function(res){
      let code = res.data.baseServerInfo.code
      let msg = res.data.baseServerInfo.msg
      let userInfo = res.data.userInfo // 获取用户相关信息
      let nickname = userInfo.nickname // 获取分享者昵称
      let avatar = userInfo.avatar // 获取分享者头像
      if(avatar.substr(0,4) != 'http'){
        avatar = app.globalData.imageUrl + avatar
      }
      _this.setData({
        nickname:nickname,
        avatar:avatar
      })
    })
  },
  // 获取邀请者信息
  getSharerInfo2(){
    let _this = this
    let userId = wx.getStorageSync('askParam')
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      userId:userId
    })
    _this.setHttpRequst('MiniAppUser','GetInfo',data,function(res){
      let code = res.data.baseServerInfo.code
      let msg = res.data.baseServerInfo.msg
      let userInfo = res.data.userInfo // 获取用户相关信息
      let nickname = userInfo.nickname // 获取分享者昵称
      let avatar = userInfo.avatar // 获取分享者头像
      if(avatar.substr(0,4) != 'http'){
        avatar = app.globalData.imageUrl + avatar
      }
      _this.setData({
        nickname:nickname,
        avatar:avatar
      })
    })
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
      for (var i = 0; i < showAwardList.length; i++) {
        let img =  showAwardList[i].avatar
        let nickname = showAwardList[i].nickname
        let url = img.substring(0,4)
        if (url != 'http') {
          showAwardList[i].avatar = app.globalData.imageUrl+img
        }
        showAwardList[i].newNickname = nickname.substr(0,1) + "***" + nickname.substr(-1,1)
      }
      _this.setData({
        showAwardList:showAwardList
      })
    },function(){})
  },
  // 获取推荐商品
  getRemomendGoods(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      limit:10
    })
    _this.setHttpRequst('Goods','GetRecommendGoods',data,function(res){
      let code = res.data.baseServerInfo.code
      let msg = res.data.baseServerInfo.msg
      let goodsList = res.data.goodsList
      console.log(goodsList)
      for(let i in goodsList){
        let url = goodsList[i].thumb
        let img = url.slice(0,4)
        if(url != 'http'){
          goodsList[i].thumb = app.globalData.imageUrl + url
        }
      }
      _this.setData({
        goodsList:goodsList
      })
    })
  },
  // 获取红包文案
  getRedPacketRule(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' }
    })
    _this.setHttpRequst('RedPacket','GetAskuserRule',data,function(res){
      let code = res.data.baseServerInfo.code
      let msg = res.data.baseServerInfo.msg
      let showNewUserAward = res.data.newUserAward // 获取奖励购物金
      let content = res.data.content // 获取红包文案
      _this.setData({
        showNewUserAward:showNewUserAward,
        content:content
      })
    })
  },
  // 领取新人红包
  getRedPacket(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (isLogin) {
      _this.setData({
        showToast:true,
        showFail:true,
        showSuccess:false,
        showMask:true
      })
    }
    else {
      wx.navigateTo({
        url: '/pages/login/index?url=newUserByRedPacket'
      })
    }
  },
  // 发起Http请求
  setHttpRequst(Class,Method,Data,Succ,Fail){
    let _this = this
    wx.request({
      url: `https://${app.globalData.productUrl}/api?resprotocol=json&reqprotocol=json&class=${Class}&method=${Method}`,
      method: 'post',
      data: Data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (res.statusCode == 200) {
          if (code == 1) {
            Succ(res)
          }
          else {
            Fail(res)
          }
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
      }
    })
  },
  // 跳转到商品详情
  hrefToDetail(e){//跳转到普通商品详情页 关闭所有页面
    let goodsid = e.currentTarget.dataset.id
    wx.reLaunch({
      url:'/pages/shop-detail/index?Id='+goodsid+''
    })
  },
  // 跳转到首页
  hrefToNewIndex(){
    wx.reLaunch({
      url:'/pages/index/index'
    })
  },
  // 跳转到购物金页
  hrefToGold(){
    wx.reLaunch({
      url:'/pages/shopping-gold/index'
    })
  },
})
