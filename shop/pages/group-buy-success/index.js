// pages/group-buy-success/index.js
const app = getApp()
const groupSuccessTimer = []
import formatTime from '../../utils/util.js'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    isPay:false
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    this.setData({
      goodsid:options.goodid,
      teamid:options.teamid
    })
  },
  onShow:function(){
    this.getSystemTime()
    this.getGoodsDetail()
    this.getTeamDetail()
  },
  onHide:function(){
    clearInterval(groupSuccessTimer[0])
  },
  //获取团购订单商品详情
  getGoodsDetail(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      id:_this.data.goodsid
    })
    _this.setHttpRequst('ShopGroups','GetDetail',Data,function(res){
      console.log(res.data.goodsDetail)
      let goodsDetail = res.data.goodsDetail
      for (var i = 0; i < goodsDetail.thumbUrl.length; i++) {
        let img = goodsDetail.thumbUrl[i]
        let url = img.substring(0,4)
        if (url != 'http') {
          goodsDetail.thumbUrl[i] = app.globalData.imageUrl+img
        }
      }
      goodsDetail.groupspriceArr = goodsDetail.groupsprice.split('.')
      _this.setData({
        goodsDetail:res.data.goodsDetail
      })
    })
  },
  //获取拼团成员详情
  getTeamDetail(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      id:_this.data.teamid
    })
    _this.setHttpRequst('ShopGroups','GetTeamDetail',Data,function(res){
        console.log(res)
        let team = res.data.team
        let endtime = res.data.team.endtime
        groupSuccessTimer[0] = _this.countDown(endtime)
      _this.setData({
        team:team
      })
    })
  },
  //发起Http请求
  setHttpRequst(Class,Method,Data,Succ,Fail){
    let _this = this
    wx.request({
      url: `https://${app.globalData.productUrl}/api?resprotocol=json&reqprotocol=json&class=${Class}&method=${Method}`,
      method: 'post',
      data: Data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            Succ(res)
          }
          else {
            Fail(res)
          }
        }else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
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
  /*倒计时*/
  countDown(end) {
      let _this = this
      let start = this.data.startTime  //将系统时间替换为开始时间
      let timer = null
      timer = setInterval(() => {
      start += 1
      let count = end - start
      let hours = formatTime.formatNumber(parseInt(count / 3600))
      let minutes = formatTime.formatNumber(parseInt((count - parseInt(hours) * 3600)/ 60))
      let secondeds = formatTime.formatNumber(parseInt((count - parseInt(hours) * 3600-parseInt(minutes)*60)))
      let timeList = {hours,minutes,secondeds}
      _this.data.timeList = timeList
      _this.setData({
        timeList:_this.data.timeList
      })
    }, 1000)
    return timer
  },
  //获取系统时间
  getSystemTime(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
    })
    _this.setHttpRequst('System','GetBaseInfo',Data,function(res){
      _this.setData({
        startTime:res.data.serverTimeStamp
      })
    })
  },
  onShareAppMessage(){
    let _this = this
    return {
     title:_this.data.goodsDetail.title,
     path:'/pages/group-buy-detail/index?Id='+_this.data.goodsDetail.id+'&teamid='+_this.data.team.id,
     imageUrl:_this.data.goodsDetail.thumbUrl[0]
    }
  },
  getMore(){
    wx.reLaunch({
      url:'/pages/index/index'
    })
  }
})