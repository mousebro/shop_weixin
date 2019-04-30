//index.js
//获取应用实例
const app = getApp()
let WxParse = require('../../wxParse/wxParse.js');
Page({
  data: {
    buyNumber:1,
    buyNumMin:1,
    buyNumMax:1,
    shopCarInfo:{},
    showActive:'a1',
    actionSheetHidden:true,
    imgUrl:'',
    shopId:'',
    actionSort:true,
    //测试用户购买记录数据
    customerList:[{nickname:'喵**酱',bargainPrice:0,thumb:'https://allnet-shop-cdn.91uda.com/images/8/2018/12/Pd4cbttB0ctuUUytu9UT7UY49Z9Cc9.jpg'},{nickname:'喵**酱',bargainPrice:0,thumb:'https://allnet-shop-cdn.91uda.com/images/8/2018/12/Pd4cbttB0ctuUUytu9UT7UY49Z9Cc9.jpg'},{nickname:'喵**酱',bargainPrice:0,thumb:'https://allnet-shop-cdn.91uda.com/images/8/2018/12/Pd4cbttB0ctuUUytu9UT7UY49Z9Cc9.jpg'},{nickname:'喵**酱',bargainPrice:0,thumb:'https://allnet-shop-cdn.91uda.com/images/8/2018/12/Pd4cbttB0ctuUUytu9UT7UY49Z9Cc9.jpg'}]
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
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let shopId = options.Id
    // let issuper = options.issuper || 0//判断是否是从会员专属商品列表进入
    // this.setData({
    //   issuper:issuper
    // })
    // console.log(issuper,'会员专属')
    let _this = this
    let scene = decodeURIComponent(options.scene) // 判断是否是扫小程序码进入的用户
    if (scene == 'undefined') {
      let shopId = options.Id
      if (shopId == undefined) {
        let showShopId = wx.getStorageSync('showShopId') // 从其他小程序跳转到该小程序的读取id方式
        this.setData({
          shopId:showShopId,
          imageUrl: app.globalData.imageUrl,
          isIpx:app.globalData.isIpx
        })
      }
      else {
        this.setData({
          shopId:shopId,
          imageUrl: app.globalData.imageUrl,
          isIpx:app.globalData.isIpx
        })
      }
    }
    else {
      let shopId = 0
      if(scene.length<16){
        shopId = scene
      }else{
        var drpCode = scene.substr(0, 16)
        shopId = scene.substr(16)
        wx.setStorageSync('drpCode', drpCode)
      }
      this.setData({
        shopId:shopId,
        imageUrl: app.globalData.imageUrl,
        isIpx:app.globalData.isIpx
      })
    }
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

  // 跳转到全部评论
  hrefToCommentList: function(){
    let _this = this
    wx.navigateTo({
      url: '/pages/commit-list/index?id='+_this.data.shopId+'&type=1'
    });
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
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    else {
      wx.navigateTo({
        url: "/pages/shop-cart/index"
      });
    }
  },
  // 跳转到订单支付
  hrefToPay: function(){
    let _this = this
    _this.recordShopView(2) //统计商品的浏览记录
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    else {
      wx.request({
        url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Bargain&method=CheckBargainningType',
        method: 'post',
        data: JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
          id: _this.data.id,
        }),
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
        },
        success: (res) => {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let type = res.data.resType
            let hasOrderId = res.data.id ///正在砍价的订单id，没有则为0
            if(type==1){
              wx.showModal({
                content:'已有该商品订单，是否进入详情',
                success (res) {
                  if(res.confirm){
                    wx.navigateTo({
                      url:''+'/pages/bargain-comfirm/index?isBargain=1&shopId='+_this.data.id + '&orderId='+hasOrderId + '&zeroShopId='+_this.data.goodsInfo.goodsid + '&formid='+_this.data.formId,
                    })
                  }
                }
              })
            }else{
              let shopList = []
              let id = 0
              let goodsId = _this.data.id;
              let pic = _this.data.goodsPicture
              let name = _this.data.title
              let number = _this.data.buyNumber;
              let price = _this.data.countPrice;
              console.log('price',price)
              let cateTotal = _this.data.cateTotal
              let spec = _this.data.sortSize //商品规格分类
              let specTitle = _this.data.specTitle
              shopList.push({id:id,goodsId:goodsId,pic:pic,name:name,number:number,price:price,cateTotal:cateTotal,spec:spec,specTitle:specTitle})
              wx.setStorage({
                key:"orderShopList",
                data:shopList
              })
              wx.navigateTo({
                url: "/pages/pay/index?isBargain=1" + '&zeroShopId='+_this.data.goodsInfo.goodsid+ '&formid='+_this.data.formId
              });
            }
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

    }
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
    wx.showLoading({
      title:'正在加载中~',
      mask:true
    })
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Bargain&method=GetGoodsDetail',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id: _this.data.shopId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            console.log(res.data)
            let goodsInfo = res.data.goodsInfo
            let id = goodsInfo.id
            let title = goodsInfo.title
            let productprice = goodsInfo.productprice
            let marketprice = goodsInfo.marketprice
            let bargainprice = goodsInfo.bargainprice
            marketprice = bargainprice //砍价商品销售价以砍价商品价格计算
            let thumbUrl = goodsInfo.thumbUrl
            let subtitle = goodsInfo.subtitle
            let cateTotal = [] //商品分类
            cateTotal.push(goodsInfo.ccate)
            cateTotal.push(goodsInfo.pcate)
            cateTotal.push(goodsInfo.tcate)
            let carouselList = goodsInfo.carouselList
            let newCarouselList = []
            for(let j in carouselList){
              let url = carouselList[j].avatar.slice(0,4)
              if(url != 'http'){
                carouselList[j].thumb = app.globalData.imageUrl + carouselList[j].avatar
               
              }else{
                carouselList[j].thumb = carouselList[j].avatar
              }
              let name = carouselList[j].nickname
              let bargainprice = carouselList[j].bargainprice
               bargainprice = parseInt(bargainprice)
              let newName = name.slice(0,1) + '***' +name.slice(-1)
              let obj = {}
              
              obj.nickname = newName
              obj.bargainprice = bargainprice
              obj.avatar = carouselList[j].thumb
              newCarouselList.push(obj)
            }
            for (let i = 0; i < thumbUrl.length; i++) {
              let img = thumbUrl[i]
              let url = img.slice(0,4)
              if (url != 'http') {
                thumbUrl[i] = app.globalData.imageUrl+img
              }
            }
            //商品规格

            if(goodsInfo.hasoption!=0){
              let spec = goodsInfo.spec
              console.log(spec)
              for(let j = 0;j < spec.length;j++){
                let option = spec[j].option
                for(let k = 0;k < option.length;k++){
                  marketprice = option[0].marketprice
                  productprice = option[0].productprice
                 
                  _this.setData({
                    sortSize:option[0].id,
                    specTitle:option[0].title
                  })
                  let img = option[k].thumb
                  let url = img.slice(0,4)
                  if (url != 'http') {
                    goodsInfo.spec[j].option[k].thumb = app.globalData.imageUrl + img
                  }
                  thumbUrl[0] = goodsInfo.spec[0].option[0].thumb
                }
              }
            }
            // //会员价显示
            // if(_this.data.issuper == 1){
            //   marketprice = goodsInfo.superprice
            // }
            let spec = goodsInfo.spec
            let goodsPicture = goodsInfo.thumbUrl[0]
            let description = goodsInfo.content
            let countPrice = parseFloat(marketprice)
            console.log(countPrice,'countPrice')
            WxParse.wxParse('content', 'html', description, _this, 5);
            _this.setData({
              goodsInfo:goodsInfo,
              id:id,
              title:title,
              labels:goodsInfo.labels,
              productprice:productprice,
              marketprice:marketprice,
              thumbList:thumbUrl,
              countPrice:countPrice,
              price:marketprice,
              goodsPicture:goodsPicture,
              cateTotal:cateTotal,
              spec:spec,
              subtitle:subtitle,
              carouselList:newCarouselList //砍价商品下单成功轮播图
            },function(){
              _this.recordShopView(1)
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
        wx.hideLoading()
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
    let spec = _this.data.sortSize || 0 //商品规格id
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShoppingCart&method=AddGoods',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        goodsId: _this.data.id,
        total: _this.data.buyNumber,
        spec:spec
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
      phoneNumber: ''+app.globalData.customerMobile+'' // 仅为示例，并非真实的电话号码
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
      path: '/pages/bargain-details/index?Id='+_this.data.id+'',
      imageUrl: 'https://allnet-shop-cdn.91uda.com/images/1/2019/03/ai76Va1Az9N9VIu77ws2BBuVi2k4aK.jpg'
    }
  },
  shareShop(){
    let _this = this
    _this.setData({
      actionSort: false
    })
  },
  //关闭分享弹窗
  closeShare(){
    let _this = this
    _this.setData({
      actionSort: true
    })
  },
  //分享图片
  shareShopImg(){
    let _this = this
    _this.setData({
      actionSort: true
    })
    let product = {}
    product.title = _this.data.title
    product.productImg = _this.data.goodsPicture
    product.marketprice = _this.data.marketprice
    product.productprice = _this.data.productprice
    product.subtitle = _this.data.subtitle
    wx.setStorageSync('shareProduct',product)
    wx.navigateTo({
      url: '/pages/canvas-share/index?Id='+_this.data.goodsInfo.goodsid+'&pageFrom=bargain' //跳转到海报页
    });
  },
  shareShopLine(){
    let _this = this
    _this.setData({
      actionSort: true
    })
  },
  // 跳转回首页
  herfToIndex: function(){
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },
  //加入购物车、立即购买选择规格参数
  choseSortSize(e){
    let _this  = this
    let idx = e.currentTarget.dataset.idx
    let thumb = e.currentTarget.dataset.thumb
    let thumbList = _this.data.thumbList
    let marketprice = e.currentTarget.dataset.marketprice
    let productprice = e.currentTarget.dataset.productprice
    let specTitle = e.currentTarget.dataset.spectitle
    thumbList[0] = thumb
    _this.setData({
      sortSize:idx,
      thumbList:thumbList,
      marketprice:marketprice,
      productprice:productprice,
      countPrice:marketprice,
      price:marketprice,
      specTitle:specTitle,
      goodsPicture:thumb //将选中的规格图片设置为订单图片
    })
  },
  //统计进入砍价的流量
  recordShopView(type){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    let cookie = ''
    if (isLogin) {
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=RecordShopView',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        goodsid: _this.data.goodsInfo.goodsid,
        type:type
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            }
     
        }
        else {

        }
      },
      fail: (res) => {
      }
    })
  },
  //存储fomrmId
  formSubmit(e){
    let formId = e.detail.formId
    this.setData({
      formId:formId
    })
  },

})
