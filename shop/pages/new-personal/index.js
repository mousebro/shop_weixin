//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    couponImg:'/images/new-personal/coupon.png',
    buttonImg:'/images/new-personal/btn.png',
    buttonNoneImg:'/images/new-personal/btnused.png',
    isSendTicket: false
  },
  onLoad: function () {
    let _this = this
    _this.getUserInfo()
    _this.getShopList()
    _this.getNewUserList()
    //对本地背景图片编译
    let couponImg = wx.getFileSystemManager().readFileSync(_this.data.couponImg,'base64')
    let buttonImg = wx.getFileSystemManager().readFileSync(_this.data.buttonImg,'base64')
    let buttonNoneImg = wx.getFileSystemManager().readFileSync(_this.data.buttonNoneImg,'base64')
    this.setData({
      couponImg:'data:image/jpg;base64,' + couponImg,
      buttonImg:'data:image/jpg;base64,' + buttonImg,
      buttonNoneImg:'data:image/jpg;base64,' + buttonNoneImg,
    })
  },
  onShow:function(){

  },
  getUserInfo: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=GetInfo',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let isSendTicket = res.data.userInfo.isSendTicket
          console.log(isSendTicket);
          if (isSendTicket) {
            _this.setData({
              isSendTicket: true
            })
          }
        }
        else if (code == 1019){
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else{
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
  // 获取商品列表
  getShopList: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        page:1,
        pageLength:2
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
              goodsList:goodsList
            })
          }
          else{
            wx.showModal({
              title:'提示',
              content:msg,
              showCancel:false,
              success:function(res){}
            })
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
  // 获取新人优惠券列表
  getNewUserList: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopCoupon&method=GetSendCouponList',
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
            let couponList = res.data.couponList
            for (let i = 0; i < couponList.length; i++) {
              let deduct = parseInt(couponList[i].deduct)
              let enough = parseInt(couponList[i].enough)
              couponList[i].deduct = deduct
              couponList[i].enough = enough
            }
            _this.setData({
              couponList:couponList
            })
          }
          else{
            wx.showModal({
              title:'提示',
              content:msg,
              showCancel:false,
              success:function(res){}
            })
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
  // 领取新人福利
  getCoupon: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopCoupon&method=DrawSendCoupon',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          wx.showModal({
            title:'提示',
            content:'成功领取优惠券',
            showCancel:false,
            success:function(res){}
          })
          _this.setData({
            isSendTicket: true
          })
        }
        else if (code == 1019){
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else{
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
})
