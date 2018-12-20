//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    totalPrice:0,
    // choseCoupon:true,
    // couponPrice:0
  },
  onShow: function(){

  },
  onLoad: function(){
    let _this = this
    let userInfo = {id:1,name:'张三',mobile:1565916556,address:'福建省福州市闽侯县软件园G区1#13'}
    let userName = userInfo.name
    let mobile = userInfo.mobile
    let address = userInfo.address
    let orderId = 1
    let shopList = [{id:1,name:'woshiadhuoqw',price:88823,count:2},{id:2,name:'51°汉酱酒',price:102234,count:7}]
    // let couponList = [{id:1,name:'满减50优惠券',price:5000,usePrice:100000}]
    let fare = 1000
    let isVip = true
    let vipPrice = 12000
    let totalPrice = _this.data.totalPrice
    for (var i = 0; i < shopList.length; i++) {
      let price = shopList[i].price
      let count = shopList[i].count
      let countPrice = price*count
      _this.data.totalPrice = _this.data.totalPrice+countPrice
    }
    _this.setData({
      userName:userName,
      mobile:mobile,
      address:address,
      shopList:shopList,
      totalPrice:_this.data.totalPrice,
      fare:fare,
      // couponList:couponList,
      isVip:isVip,
      vipPrice:vipPrice,
      orderId:orderId
    })
    if (isVip) {
      let payPrice = _this.data.totalPrice + _this.data.fare - _this.data.vipPrice
      _this.setData({
        payPrice:payPrice
      })
    }
    else {
      let payPrice = _this.data.totalPrice + _this.data.fare
      _this.setData({
        payPrice:payPrice
      })
    }
  },
  submit: function(){
    let _this = this
    let totalPrice = _this.data.totalPrice
    let payPrice = _this.data.payPrice
    let shopList = _this.data.shopList
    console.log(totalPrice);
    console.log(payPrice);
    console.log(shopList);
    console.log(_this.data.orderId);
    setTimeout(function(){
      wx.navigateTo({
        url: "/pages/pay-success/index"
      });
    },1000)
  },

})
