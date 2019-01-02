//index.js
//获取应用实例
const app = getApp()
let WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    buyNumber:1,
    buyNumMin:1,
    buyNumMax:9999,
    shopCarInfo:{},
    showActive:'a1',
    actionSheetHidden:true,
    imgUrl:''
  },
  onShow: function(){
    let _this = this
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function(res) {
        _this.setData({
          shopCarInfo:res.data,
          shopNum:res.data.shopNum
        });
      }
    })
  },
  onLoad: function(options){
    let shopId = options.Id
    let _this = this
    this.setData({
      shopId:shopId,
      imageUrl: app.globalData.imageUrl
    })
    _this.getGoodsInfo()
  },
  // 点击商品以及点击详情定位
  scrollPosition: function(e){
    let _this = this
    let showId = e.currentTarget.dataset.id
    _this.setData({
      showActive:showId,
      toView:showId
    })
  },
  // 展示加入购物车
  showBuyCar: function(){
    this.setData({
      showModal:true,
      modal1:true
    })
  },
  // 关闭购物车弹窗
  closeModal1: function(){
    this.setData({
      showModal:false,
      modal1:false
    })
  },
  // 展示立即购买
  showBuy: function(){
    this.setData({
      showModal:true,
      modal2:true
    })
  },
  // 关闭立即购买弹窗
  closeModal2: function(){
    this.setData({
      showModal:false,
      modal2:false
    })
  },
  // 跳转到购物车
  hrefToShopCart: function(){
    wx.switchTab({
      url: "/pages/shop-cart/index"
    });
  },
  // 跳转到订单支付
  hrefToPay: function(){
    let _this = this
    let shopList = []
    let id = 0
    let goodsId = _this.data.id;
    let pic = _this.data.goodsPicture
    let name = _this.data.title
    let number = _this.data.buyNumber;
    let price = _this.data.countPrice;
    shopList.push({id:id,goodsId:goodsId,pic:pic,name:name,number:number,price:price})
    wx.setStorage({
      key:"orderShopList",
      data:shopList
    })
    wx.navigateTo({
      url: "/pages/pay/index"
    });
  },
  // 商品数量增减
  lessTap: function() {
     if(this.data.buyNumber > this.data.buyNumMin){
        let currentNum = this.data.buyNumber;
        currentNum--;
        let price = this.data.countPrice
        let showPrice = currentNum*price
        this.setData({
            buyNumber: currentNum,
            price:showPrice
        })
     }
  },
  plusTap: function() {
     if(this.data.buyNumber < this.data.buyNumMax){
        var currentNum = this.data.buyNumber;
        currentNum++ ;
        let price = this.data.countPrice
        let showPrice = currentNum*price
        this.setData({
            buyNumber: currentNum,
            price:showPrice
        })
     }
  },
  // 加入本地购物车
  addShopCar: function() {
    let shopCarInfo = this.bulidShopCarInfo();
    this.setData({
      shopCarInfo:shopCarInfo,
      shopNum:shopCarInfo.shopNum
    });
    // 写入本地存储
    wx.setStorage({
      key:"shopCarInfo",
      data:shopCarInfo
    })
  },
  // 构建购物车信息
  bulidShopCarInfo: function () {
    let shopCarMap = {};
    shopCarMap.goodsId = this.data.id;
    shopCarMap.pic = this.data.goodsPicture
    shopCarMap.name = this.data.title
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.price = this.data.countPrice;
    let shopCarInfo = this.data.shopCarInfo;
    this.addGoods()
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    // 判断是否有相同项，合并相同项
    let hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      let tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }
    // 购物车数量增加
    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    return shopCarInfo;
  },
  // 获取商品详情
  getGoodsInfo: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsInfo',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id: _this.data.shopId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let goodsInfo = res.data.goodsInfo
            let id = goodsInfo.id
            let title = goodsInfo.title
            let productprice = goodsInfo.productprice
            let marketprice = goodsInfo.marketprice
            let thumbUrl = goodsInfo.thumbUrl
            for (var i = 0; i < thumbUrl.length; i++) {
              let img = thumbUrl[i]
              let url = img.substring(0,4)
              if (url != 'http') {
                thumbUrl[i] = app.globalData.imageUrl+img
              }
            }
            let goodsPicture = goodsInfo.thumbUrl[0]
            let description = goodsInfo.content
            let countPrice = parseFloat(marketprice)
            WxParse.wxParse('content', 'html', description, _this, 5);
            _this.setData({
              id:id,
              title:title,
              productprice:productprice,
              marketprice:marketprice,
              thumbList:thumbUrl,
              countPrice:countPrice,
              price:marketprice,
              goodsPicture:goodsPicture
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

        }
      },
      fail: (res) => {
      }
    })
  },
  // 增加商品到服务器购物车
  addGoods: function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return false;
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShoppingCart&method=AddGoods',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        goodsId: _this.data.id,
        total: _this.data.buyNumber
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        _this.closeModal1();
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
          })
        }
        else if (code == 1019) {
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
  //分享
  onShareAppMessage: function(res) {
    let _this = this
    return {
      title: ''+_this.data.title+'',
      path: '/pages/shop-detail/index?Id='+_this.data.id+'',
      imageUrl:this.data.goodsPicture
    }
  },
})
