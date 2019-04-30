//index.js
//获取应用实例
const app = getApp()

Page({
  data: {

  },
  onShow: function(){

  },
  onLoad: function(options){
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let orderId = options.Id
    let pageFrom = options.pageFrom || ''
    this.setData({
      orderId:orderId,
      pageFrom:pageFrom
    })
    
  },
  // 跳转到订单详情
  hrefToOrderDetail: function(){
    let orderId = this.data.orderId
    let pageFrom = this.data.pageFrom
    wx.navigateTo({
      url: '/pages/my-order-detail/index?Id='+orderId+'&pageFrom='+pageFrom
    })
  },
  // 跳转回首页
  hrefToIndex: function(){
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  // hrefToSearch: function(){
  //   wx.navigateTo({
  //     url: '/pages/search/index'
  //   })
  // },
})
