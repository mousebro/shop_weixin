// pages/my-order-detail/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let expresscom = options.expresscom // 获取物流公司名称
    let expressId = options.expressId // 获取订单ID
    let expresssn = options.expresssn // 获取订单编号
    _this.setData({
      expresscom:expresscom,
      expresssn:expresssn
    })
    _this.getExpressInfo(expressId)
  },

  getExpressInfo:function(expressId){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      orderId:expressId
    })
    _this.setHttpRequst('Order','GetOrderExpress',data,function(res){
      let express = res.data.express // 获取物流信息
      let showExpress = express.reverse() // 反转数组
      _this.setData({
        express:showExpress
      })
    })
  },
  // 发送http请求
  setHttpRequst: function(Class,Method,Data,Succ,Fail){
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
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          Succ(res)
        }
        else {
          Fail(res)
        }
      },
      fail: (res) => {
      }
    })
  },
})
//path:'/pages/group-buy-detail/index?Id='+_this.data.goodsDetail.id+'&teamid='+_this.data.team.id
