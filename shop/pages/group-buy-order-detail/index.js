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
    integral:0,
    remark:'',
    areaPlaceholder:'请输入订单备注信息'
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
    app.userView('RecordExposurenum') //统计平台曝光度记录
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
      goodDetail.totalPrice = +(parseFloat(singleprice)*(buyNumber) + parseFloat(goodDetail.freight)).toFixed(2)
    }else{
      goodDetail.totalPrice = +(parseFloat(goodDetail.groupsprice) + parseFloat(goodDetail.freight)).toFixed(2)
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

    _this.getUserInfo() // 获取用户信息判断是否是会员
  },
  // 获取用户地址
  getAddress: function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      // wx.setStorageSync('isLogin', false)
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
      url: '/pages/address/index?url=order-detail'
    })
  },
  // 提交生成订单
  submit: function(){
    let _this = this
    let addressId = _this.data.addressId
    let teamid = _this.data.goodDetail.teamid 
    let formid = _this.data.formId
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    if(_this.data.goodDetail.isTeamLeader != 1 && !_this.data.isCommon){ //判断是否是以团长身份开团
      var  Data = JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        addressid:addressId,
        teamid:teamid,
        integral:_this.data.integral,
        remark:_this.data.remark,
        formid:formid
      })
      _this.setHttpRequst('ShopGroups','JoinGroups',Data,function(res){ //加入团购
        _this.setData({
          teamid:res.data.teamid
        })
        let orderId = res.data.id
        if(res.data.orderstatus == 1){ //如果用积分抵扣掉付款金额
          _this.setRedPoint(1)
          wx.showModal({
            title:'提示',
            content:'已下单成功',
            showCancel:false,
            success:function(){
              wx.redirectTo({
                url: '/pages/group-buy-success/index?goodid='+_this.data.goodDetail.id+'&teamid='+_this.data.teamid
              })
            }
          })
        }else{
          _this.payfor(orderId)
        }
      },function(res){
        wx.hideLoading()
      })
    }else{
      if(!_this.data.isCommon){
        var  Data = JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
          addressid:addressId,
          id:_this.data.goodDetail.id,
          integral:_this.data.integral,
          remark:_this.data.remark,
          formid:formid
        })
        _this.setHttpRequst('ShopGroups','AddOrder',Data,function(res){ //加入团购
          let orderId = res.data.id
          _this.setData({
            teamid:res.data.teamid
          })
          if(res.data.orderstatus == 1){ //如果用积分抵扣掉付款金额
            _this.setRedPoint(1)
            wx.showModal({
              title:'提示',
              content:'已下单成功',
              showCancel:false,
              success:function(res){
                wx.redirectTo({
                  url: '/pages/group-buy-success/index?goodid='+_this.data.goodDetail.id+'&teamid='+_this.data.teamid
                })
              }
            })
          }else{
            _this.payfor(orderId)
          }
          
        },function(res){
          wx.hideLoading()
        })
      }else{
        var  Data = JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
          addressid:addressId,
          id:_this.data.goodDetail.id,
          total:_this.data.buyNumber,
          integral:_this.data.integral,
          remark:_this.data.remark,
          formid:formid
        })
        _this.setHttpRequst('ShopGroups','GroupCreateOrder',Data,function(res){ //加入团购
          let orderId = res.data.id
          if(res.data.orderstatus == 1){ //如果用积分抵扣掉付款金额
            _this.setRedPoint(1)
            wx.showModal({
              title:'提示',
              content:'已下单成功',
              showCancel:false,
              success:function(res){
                // wx.redirectTo({
                //   url: '/pages/pay-success/index?goodid='+_this.data.goodDetail.id+'&teamid='+_this.data.teamid+"&pageFrom=group"
                // })
                wx.navigateBack({
                  delta: 1
                })
              }
            })

          }else{
            _this.payfor(orderId)
          }
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
  //获取用户是否为会员
  getUserInfo(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return false;
    }
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
    })
    _this.setHttpRequst('MiniAppUser','GetInfo',Data,function(res){
      let showIntegral = res.data.userInfo.credit1 // 获取用户当前积分
      let superstatus = res.data.userInfo.superstatus // 获取用户会员情况（1是会员，2是非会员）
      _this.setData({
        superstatus:superstatus,
        showIntegral:showIntegral
      })
      _this.getCalculateCredit()
    })
  },
  // 选择使用或不使用积分
  useIntegral:function(){
    let _this = this
    let useIntegral = _this.data.integral // 获取用户是否使用积分
    let integralPrice = _this.data.newShowIntegral // 用户积分数量
    if (useIntegral == 0) {
      if(_this.data.newShowIntegral){
        _this.setData({
          integral:1,
          showPayPrice:(parseFloat(_this.data.showPayPrice) - parseFloat(_this.data.newShowIntegral)*parseFloat(_this.data.creditScale)/100).toFixed(2)
        })
      }else{
        let finalPrice = (_this.data.payPrice - integralPrice/100).toFixed(2) // 积分计算结果价格
        _this.setData({
          integral:1,
          showPayPrice:finalPrice
        })
      }
    }
    else if (useIntegral == 1) {
      let finalPrice = _this.data.payPrice // 积分计算结果价格
      _this.setData({
        integral:0,
        showPayPrice:(parseFloat(_this.data.showPayPrice) + parseFloat(_this.data.newShowIntegral)*parseFloat(_this.data.creditScale)/100).toFixed(2)
      })
    }
  },
  // 获取会员相关信息以及计算显示价格
  getSuperMemberPrice: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Supermember&method=GetMemberbase',
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
            let baseinfo  = res.data.baseinfo
            let discount  = baseinfo.discount/100 // 获取会员折扣
            if(_this.data.isCommon==0){ //判断是否是按团购价还是普通商品购买
              var goodsPrice = parseFloat(_this.data.goodDetail.groupsprice) 
            }else{
              var goodsPrice = parseFloat(_this.data.goodDetail.singleprice)
            }
            if (_this.data.superstatus == 1) {
              let countDiscount = goodsPrice*(1 - discount)
              let countDiscount2 = countDiscount.toFixed(2)
              let payPrice = goodsPrice + parseInt(_this.data.goodDetail.freight) - countDiscount2
              let showIntegral = parseInt(_this.data.showIntegral)
              if(payPrice*100<showIntegral){
                _this.setData({
                  newShowIntegral:(payPrice*100 * parseFloat(_this.data.creditScale)).toFixed(0)
                })
              }else{
                _this.setData({
                  newShowIntegral:(showIntegral * parseFloat(_this.data.creditScale)).toFixed(0)
                })
              } 
              _this.setData({
                payPrice:payPrice,
                showPayPrice:payPrice,
                discount:discount,
                showDiscountPrice:countDiscount2
              })
            }
            else {
              
              let payPrice = goodsPrice + parseInt(_this.data.goodDetail.freight)
              let showDiscountPrice = (_this.data.goodDetail.totalPrice*(1 - discount)).toFixed(2)
              let showIntegral = parseFloat(_this.data.showIntegral)
              if(payPrice*100<showIntegral){
                _this.setData({
                  newShowIntegral:(payPrice*100 * parseFloat(_this.data.creditScale)).toFixed(0)
                })
              }else{
                _this.setData({
                  newShowIntegral:(showIntegral * parseFloat(_this.data.creditScale)).toFixed(0)
                })
              } 
              _this.setData({
                payPrice:payPrice,
                showPayPrice:payPrice,
                discount:discount,
                showDiscountPrice:showDiscountPrice
              })
            }
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
        else if(code == 8001){
          _this.setData({
            showAddressMask:true,
            areaPlaceholder:''
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
        _this.setRedPoint(1)
        if(_this.data.isCommon == 1){
          wx.showModal({
            title:'提示',
            content:'已下单成功',
            showCancel:false,
            success:function(res){
              wx.navigateBack({
                delta: 1 // 回退前 delta(默认为1) 页面
              })
            }
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
    this.setRedPoint(0)
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
  // 绑定订单备注输入
  bindRemark:function(e){
    let _this = this
    let remark = e.detail.value
    _this.setData({
      remark:remark
    })
  },
   //添加红点
   setRedPoint(type){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=RedPoint&method=UpdateRedPoint',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        type:type,
        show:1
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
        }
        else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else{
        }
      },
      fail: (res) => {
      }
    })
  },
  formSubmit(e){ //获取formId用户模板消息
    let formId = e.detail.formId
    this.setData({
      formId:formId
    })
  },
  //隐藏地址提示弹出框
  hidenAddressMask(){
    this.setData({
      showAddressMask:false,
      areaPlaceholder:'请输入订单备注信息'
    })
  },
  //下单前返回购物金（积分信息）
getCalculateCredit(){
  let _this = this
  let url = 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=CalculateCreditBeforeCreateOrder'
  wx.request({
    url: url,
    method: 'post',
    data: JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      obj:_this.data.submitGoodsList
    }),
    header: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    },
    success: (res) => {
      let code = res.data.baseServerInfo.code
      let msg = res.data.baseServerInfo.msg
      if (code == 1) {
        _this.setData({
          introductioncontent:res.data.userule,
          creditScale:res.data.scale,
          canUserCredit:res.data.type,
          creditLimit:res.data.least 
        },function(){
          _this.getSuperMemberPrice()
        })
      }else if (code == 1019) {
        wx.navigateTo({
          url: '/pages/login/index'
        })
      }else {
        wx.showModal({
          title:'提示',
          content:res.data.baseServerInfo.msg,
          showCancel:false,
          success:function(res){
          }
        })
      }

    },
    fail: (res) => {
    }
  })
}
})
