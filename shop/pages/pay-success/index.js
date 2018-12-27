//index.js
//获取应用实例
const app = getApp()

Page({
  data: {

  },
  onShow: function(){

  },
  onLoad: function(options){
    let orderId = options.Id
    this.setData({
      orderId:orderId
    })
    console.log(orderId);
  },
  // 跳转到订单详情
  hrefToOrderDetail: function(){
    let orderId = this.data.orderId
    wx.navigateTo({
      url: '/pages/my-order-detail/index?Id='+orderId+''
    })
  },
  // 跳转回首页
  hrefToIndex: function(){
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  // hrefToSearch: function(){
  //   wx.navigateTo({
  //     url: '/pages/search/index'
  //   })
  // },
})
