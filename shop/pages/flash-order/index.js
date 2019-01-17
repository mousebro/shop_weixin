//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    totalPrice:0,
    addressId:0,
    realname:'点击添加地址',
    mobile:'',
    address:'',
    showModal:false,
    pageFrom:'goods',
    timer:null
  },
  onShow: function(){
    console.log('我是秒拍商品订单')
    let _this = this
    _this.setData({
      addressId:_this.data.addressId,
      realname:_this.data.realname,
      mobile:_this.data.mobile,
      address:_this.data.address,
      imageUrl: app.globalData.imageUrl
    })
  },
  onUnload:function(){
    console.log('隐藏页面')
    clearInterval(this.data.timer)
  },
  onLoad: function(options){
    let _this = this
    if(options.from=='secKill'){ //判断是否从商品秒杀页进入
      _this.setData({
        pageFrom:'secKill'
      })
    }else{
      _this.getCouponList() //秒杀无优惠卷
    }
    _this.getAddress()
    // let aaa = 'sdjio'
    // wx.setNavigationBarTitle({
    //   title: aaa
    // })
    let goodsList = wx.getStorageSync('orderShopList');
    console.log(goodsList,'商品')
    let submitGoodsList = []  // 提交订单用商品对象列表
    let goodsIdList = [] // 获取运费用商品id列表
    let fare = 0
    if(_this.data.pageFrom == 'secKill'){ //判断是否是从秒杀页面进入
      fare = parseInt(goodsList[0].freight)
    }
    let isVip = true
    let vipPrice = 0
    let totalPrice = _this.data.totalPrice
    for (let i = 0; i < goodsList.length; i++) {
      let goodsId = goodsList[i].goodsId
      let price = parseFloat(goodsList[i].price)*100
      let count = goodsList[i].number
      let countPrice = price*count
      submitGoodsList.push({id:goodsId,total:count})
      goodsIdList.push(goodsId)
      _this.data.totalPrice = _this.data.totalPrice+countPrice
    }
    _this.setData({
      goodsList:goodsList,
      submitGoodsList:submitGoodsList,
      totalPrice:_this.data.totalPrice,
      fare:fare,
      // couponList:couponList,
      isVip:isVip,
      vipPrice:vipPrice
    })
    if (isVip) {
      let payPrice = _this.data.totalPrice + _this.data.fare - _this.data.vipPrice
      _this.setData({
        payPrice:payPrice,
        showPayPrice:payPrice
      })
    }
    else {
      let payPrice = _this.data.totalPrice + _this.data.fare
      _this.setData({
        payPrice:payPrice,
        showPayPrice:payPrice
      })
    }
  },
  // 获取用户地址
  getAddress: function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      wx.setStorageSync('isLogin', false)
      return false;
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Address&method=GetAddressList',
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
          let addressList = res.data.addressList // 获取用户地址列表
          if (addressList.length == 0) {
            console.log('需要新建地址');
          }
          else {
            let addressInfo = addressList[0]
            let realname = addressInfo.realname
            let mobile = addressInfo.mobile
            let province = addressInfo.province
            let city = addressInfo.city
            let area = addressInfo.area
            let addressDetail = addressInfo.address
            let addressId = addressInfo.id
            let showAddress = province+city+area+addressDetail
            _this.setData({
              addressId:addressId,
              realname:realname,
              mobile:mobile,
              address:showAddress
            })
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
  },
  changeAddress:function(){
    wx.navigateTo({
      url: '/pages/address/index?url=order'
    })
  },
  // 获取优惠券列表
  getCouponList:function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopCoupon&method=UserCouponList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        page:1,
        pageLength:10,
        status:1,
        isPage:false
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        wx.hideLoading()
        if (code == 1) {
          let couponList = res.data.couponList
          _this.setData({
            choseCoupon:false,
            couponList:couponList
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
    // let couponList = [{id:1,couponname:'满减50优惠券',deduct:'50',enough:'1000',backtype:0,timelimit:1,timestart:'2019.1.1',timeend:'2019.1.10'},{id:2,couponname:'95折折扣券',discount:'9.5',enough:'0',backtype:1,beginTime:'2019.1.1',endTime:'2019.1.10'}]
  },
  // 点击打开优惠券列表
  choseCoupon:function(){
    let _this = this
    wx.navigateTo({
      url: '/pages/usecoupon/index?totalPrice='+_this.data.payPrice+''
    })
  },
  // 提交生成订单
  submit: function(){
    let _this = this
    let addressId = _this.data.addressId
    let submitGoodsList = _this.data.submitGoodsList
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }

   //秒杀商品发送订单
   if(_this.data.pageFrom == 'secKill'){
     let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      taskgoodsid:_this.data.goodsList[0].goodsId,
      addressid:addressId,
      taskid:_this.data.goodsList[0].taskid,
      roomid:_this.data.goodsList[0].roomid,
      total:_this.data.goodsList[0].number
    })
    _this.setHttpRequst('Seckill','CreateOrder',data,(res)=>{
     let timeSign = res.data.timeSign
      data = JSON.parse(data)
      data.timeSign = timeSign
      data = JSON.stringify(data)
     _this.data.timer = setInterval(function(){
        _this.setHttpRequst('Seckill','CheckOrderPop',data,function(res){
          clearInterval(_this.data.timer)
          let orderId = res.data.orderId
          _this.payfor(orderId)
        },function(res){
          wx.showModal({
            title:'提示',
            content:res.data.baseServerInfo.msg,
            showCancel:false,
            success:function(res){
              
            }
          })
        })
      },3000)
    },function(res){
      console.log('createOrder')
      wx.showModal({
        title:'提示',
        content:res.data.baseServerInfo.msg,
        showCancel:false,
        success:function(res){}
      })
    },function(res){
      let time = Math.random()*4000 + 3000
      // if(_this.data.secKillTimer){
      //    setTimeout(() => {
      //     _this.submit()
      //   },time)
      // }
    })
   }else{
    //普通商品发送订单请求
    wx.showLoading({
      mask:true,
      title: '订单生成中...'
    })
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      obj:submitGoodsList,
      addressid:addressId,
      couponid:_this.data.couponId
    })
   _this.setHttpRequst('Order','CreateOrder',data,function(res){ //成功回调
    let orderId = res.data.id
    _this.payfor(orderId)
   },function(res){
      wx.showModal({
        title:'提示',
        content:res.data.baseServerInfo.msg,
        showCancel:false,
        success:function(res){}
      })
   },function(res){  //失败回调
      wx.showModal({
        title:'提示',
        content: res.data.baseServerInfo.msg,
        showCancel:false,
        success:function(res){
          wx.navigateBack({
            delta:1
          })
        }
      })
    })
   }
   
  },
  //发送http请求
  setHttpRequst(Class,Method,Data,Succ,Fail,resFail){
    let _this = this
    wx.request({
      url: `https://${app.globalData.productUrl}/api?resprotocol=json&reqprotocol=json&class=${Class}&method=${Method}`,
      method: 'post',
      data: Data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            Succ(res)
          }else if (code == 1019) {
            wx.navigateTo({
              url: '/pages/login/index'
            })
          }
          else {
            Fail(res)
          }
      },
      fail: (res) => {
        resFail(res)
      }
    })
  },
  // 提交生成订单
  payfor: function(orderId){
    let _this = this
    wx.showLoading({
      mask:true,
      title: '订单支付中...'
    })
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Payment&method=WechatPayOrder',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        orderId:orderId,
        orderType:1
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        let payInfo = res.data
        wx.hideLoading()
        if (code == 1) {
              let appId = payInfo.appId
              let timeStamp = payInfo.timeStamp
              let nonceStr  = payInfo.nonceStr
              let prepayId  = payInfo.prepayId
              let sign      = payInfo.sign
              let orderSn   = payInfo.orderSn
              wx.requestPayment({
                'timeStamp': ''+timeStamp+'',
                'nonceStr': nonceStr,
                'package': 'prepay_id='+prepayId,
                'signType': 'MD5',
                'paySign': sign,
                'success':function(res){
                  _this.paySuccess(orderSn,prepayId,orderId)
                },
                'fail':function(res){
                  _this.cancelOrder(orderId)
                },
                'complete':function(res){
                }
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
  // 支付成功回调
  paySuccess: function(orderSn,prepayId,orderId){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Payment&method=WechatPaySuccess',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 },
        orderSn: orderSn,
        prepayId:prepayId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: function(res) {
        wx.reLaunch({
          url: '/pages/pay-success/index?Id='+orderId+''
        });
      },
      fail: function(res) {
      }
    })
  },
  // 支付失败回调
  cancelOrder: function(orderId){
    console.log(orderId);
    wx.navigateTo({
      url: '/pages/my-order-detail/index?Id='+orderId+''
    });
  },

})
