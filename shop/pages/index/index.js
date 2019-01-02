//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    actionSheetHidden:true
  },
  onLoad: function () {
    wx.showShareMenu({
      withShareTicket: true
    })
  },
  onShow:function(){
    let _this = this
    _this.getBanner()
    _this.getShopList()
  },
  //唤起底部客服弹窗
  listenerButton: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: false
    })
  },
  //拨打客服热线
  call: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
    wx.makePhoneCall({
      phoneNumber: '0591-88325999' // 仅为示例，并非真实的电话号码
    })
  },
  //取消底部弹窗
  close: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
  },
  // 跳转到搜索页
  hrefToSearch: function(){
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },
  // 获取首页轮播图
  getBanner: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=HomePage&method=GetBanner',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let bannerList = res.data.bannerList
            for (var i = 0; i < bannerList.length; i++) {
              let img = bannerList[i].thumb
              let url = img.substring(0,4)
              if (url != 'http') {
                bannerList[i].thumb = app.globalData.imageUrl+img
              }
            }
            _this.setData({
              bannerList:bannerList,
              imageUrl:app.globalData.imageUrl
            })

          }
          else{

          }
        }
        else {
          console.log(res.statusCode);
        }
      },
      fail: (res) => {
      }
    })
  },
  // 获取商品列表
  getShopList: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        page:1,
        pageLength:10
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let goodsList  = res.data.goodsList
            for (var i = 0; i < goodsList.length; i++) {
              let img = goodsList[i].thumb
              let url = img.substring(0,4)
              if (url != 'http') {
                goodsList[i].thumb = app.globalData.imageUrl+img
              }
            }
            _this.setData({
              goodsList:goodsList,
              imageUrl:app.globalData.imageUrl
            })
          }
          else{

          }
        }
        else {
          console.log(res.statusCode);
        }
      },
      fail: (res) => {
      }
    })
  },
  // 跳转到商品详情
  hrefToDetail: function(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/shop-detail/index?Id='+id+''
    })
  },
  //分享
  onShareAppMessage: function(res) {
    let _this = this
    return {
      title: '名庄名酒',
      path: '/pages/index/index',
      imageUrl:this.bannerList[0]
    }
  },
})
