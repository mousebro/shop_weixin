//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
  },
  onShow: function(){
  },
  onLoad: function(){
    let _this = this
    _this.setData({
      isIpx:app.globalData.isIpx,
      deviceHeight:app.globalData.deviceHeight
    })
  },
  hrefToDetail: function(e){
    let _this = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/shop-detail/index?Id='+id+''
    })
  },
})
