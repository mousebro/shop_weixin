//index.js
//获取应用实例
const app = getApp()

Page({
  data: {

  },
  onShow: function(){

  },
  onLoad: function(){

  },
  // // 跳转到订单详情
  // hrefToOrderDetail: function(){
  //   wx.navigateTo({
  //     url: '/pages/order-detail/index'
  //   })
  // },
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
