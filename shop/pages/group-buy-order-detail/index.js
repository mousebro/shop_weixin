//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    totalPrice:0,
    addressId:0,
    realname:'点击添加地址',
    mobile:'',
    address:''
    // choseCoupon:true,
    // couponPrice:0
  },
  onShow: function(){
    let _this = this
    _this.setData({
      addressId:_this.data.addressId,
      realname:_this.data.realname,
      mobile:_this.data.mobile,
      address:_this.data.address,
      imageUrl: app.globalData.imageUrl
    })
  },
  onLoad: function(options){
    let _this = this
    _this.getAddress()
    let goodsList = wx.getStorageSync('orderShopList');
    let goodDetail = JSON.parse(options.detail)
    let buyNumber = 1
    let isCommon = 0
    let singleprice =0
    singleprice = goodDetail.groupsprice
    if(goodDetail.buyNumber){
      buyNumber = goodDetail.buyNumber
    }
  
    if(goodDetail.isCommon){ //判断是不是普通团购商品下单 1为否
      isCommon = 1
      singleprice = goodDetail.singleprice
      goodDetail.totalPrice = (parseFloat(singleprice)*(buyNumber) + parseFloat(goodDetail.freight)).toFixed(2)
    }else{
      goodDetail.totalPrice = (parseFloat(goodDetail.groupsprice) + parseFloat(goodDetail.freight)).toFixed(2)
    }
    _this.setData({
      goodDetail:goodDetail,
      buyNumber:buyNumber,
      isCommon:isCommon,
      singleprice:singleprice
    })
    let submitGoodsList = []  // 提交订单用商品对象列表
    let goodsIdList = [] // 获取运费用商品id列表
    // _this.getAddress() // 获取用户地址簿
    // let couponList = [{id:1,name:'满减50优惠券',price:5000,usePrice:100000}]
    let fare = 0
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
        }else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }else{
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
  // 提交生成订单
  submit: function(){
    let _this = this
    let addressId = _this.data.addressId
    let teamid = _this.data.goodDetail.teamid 
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    if(_this.data.goodDetail.isTeamLeader != 1 && !_this.data.isCommon){ //判断是否是以团长身份开团
      console.log('参团')
      var  Data = JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        addressid:addressId,
        teamid:teamid
      })
      _this.setHttpRequst('ShopGroups','JoinGroups',Data,function(res){ //加入团购
        console.log(res)
        _this.setData({
          teamid:res.data.teamid
        })
        let orderId = res.data.id
         _this.payfor(orderId)
      },function(res){
        console.log(res)
        wx.hideLoading()
      })
    }else{
      if(!_this.data.isCommon){
        console.log('开团')
        var  Data = JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
          addressid:addressId,
          id:_this.data.goodDetail.id
        })
        _this.setHttpRequst('ShopGroups','AddOrder',Data,function(res){ //加入团购
          let orderId = res.data.id
          _this.setData({
            teamid:res.data.teamid
          })
           _this.payfor(orderId)
        },function(res){
          wx.hideLoading()
        })
      }else{
        console.log('普通购买')
        console.log(addressId,_this.data.goodDetail.id,_this.data.buyNumber)
        var  Data = JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
          addressid:addressId,
          id:_this.data.goodDetail.id,
          total:_this.data.buyNumber
        })
        _this.setHttpRequst('ShopGroups','GroupCreateOrder',Data,function(res){ //加入团购
          console.log(res)
          let orderId = res.data.id
           _this.payfor(orderId)
        },function(res){
          wx.hideLoading()
        })
      }
    }

    // wx.showLoading({
    //   mask:true,
    //   title: '订单生成中...'
    // })
 

    // setTimeout(function(){
    //   wx.navigateTo({
    //     url: "/pages/pay-success/index"
    //   });
    // },1000)
  },
  //发起Http请求
  setHttpRequst(Class,Method,Data,Succ,Fail){
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
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            Succ(res)
          }
          else {
            Fail(res)
          }
        }else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else {
          wx.showModal({
            title:'提示',
            content:msg,
            showCancel:false,
            success:function(res){
              wx.navigateBack({
                delta:1
              })
            }
          })
        }
      },
      fail: (res) => {
      }
    })
  },
  // 提交生成订单 -去支付
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
        orderType:2
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        let payInfo = res.data
        if (code == 1) {
          wx.hideLoading()
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
        }else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }else{
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
        if(_this.data.isCommon == 1){
          wx.navigateBack({
            delta: 1 // 回退前 delta(默认为1) 页面
          })
        }else{
          wx.redirectTo({
            url: '/pages/group-buy-success/index?goodid='+_this.data.goodDetail.id+'&teamid='+_this.data.teamid
          })
        }

      },
      fail: function(res) {
      }
    })
  },
  // 支付失败回调
  cancelOrder: function(orderId){
    let _this = this
    wx.showModal({
      title:'提示',
      content:'支付失败',
      showCancel:false,
      success:function(){
        wx.navigateBack({
          delta: 1, // 回退前 delta(默认为1) 页面
        })
        // wx.redirectTo({
        //   url: '/pages/group-buy-detail/index?Id='+_this.data.goodDetail.id
        // })
      }
    })
  },
})
