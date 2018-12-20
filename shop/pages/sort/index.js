//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    showActive:'a'
  },
  onShow: function(){

  },
  onLoad: function(){
    let _this = this
    let typeList = [{id:'a',name:'白酒'},{id:'b',name:'葡萄酒'},{id:'c',name:'啤酒'}]
    _this.setData({
      typeList:typeList
    })
  },
  // 点击左侧栏
  addActive: function(e){
    let _this = this
    let id = e.target.dataset.id
    _this.showActive = id
    _this.setData({
      toView: id,
      showActive: id
    })
  },
  // 跳转到商品详情(测试用)
  hrefToDetail: function(){
    wx.navigateTo({
      url: '/pages/shop-detail/index'
    })
  },
  // 跳转到商品列表
  hrefToShopList: function(){
    wx.navigateTo({
      url: '/pages/shop-list/index'
    })
  },
  // hrefToSearch: function(){
  //   wx.navigateTo({
  //     url: '/pages/search/index'
  //   })
  // },
})
