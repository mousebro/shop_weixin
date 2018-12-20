//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    buyNumber:1,
    buyNumMin:1,
    buyNumMax:10,
    shopCarInfo:{},
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
  onLoad: function(){
    let testObj = {id:1,name:'53°茅台王子酒53°',price:88812,bfPrice:112211,picUrl:'/pic/banner1.png',}
    let id = testObj.id
    let name = testObj.name
    let price = testObj.price
    let countPrice = testObj.price.toString()
    let intPrice = countPrice.substr(0,countPrice.length-2)
    let floatPrice = countPrice.substr(-2,2)
    let delPrice = testObj.bfPrice/100
    let picture = testObj.picUrl
    this.setData({
      id:id,
      name:name,
      price:price,
      intPrice:intPrice,
      floatPrice:floatPrice,
      delPrice:delPrice,
      countPrice:price,
      picture:picture
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
  // 加入购物车
  addShopCar: function() {
    console.log(this.data.id);
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
    this.closeModal1();
    wx.showToast({
      title: '加入购物车成功',
      icon: 'success',
      duration: 2000
    })
  },
  // 构建购物车信息
  bulidShopCarInfo: function () {
    let shopCarMap = {};
    shopCarMap.goodsId = this.data.id;
    shopCarMap.pic = this.data.picture
    shopCarMap.name = this.data.name
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.price = this.data.countPrice/100;
    let shopCarInfo = this.data.shopCarInfo;
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
})
