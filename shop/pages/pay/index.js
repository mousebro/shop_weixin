//index.js
//获取应用实例
const app = getApp()
const loginTime = [{a:1}]
Page({
  data: {
    totalPrice:0,
    addressId:0,
    realname:'点击添加地址',
    mobile:'',
    address:'',
    showModal:false,
    integral:0,
    couponPrice:0,
    countPrice:0,
    limitIntegral:false,
    remark:'',
    isBargain:0, //判断是否从0元购页面进入 默认0 否
    formArr:[],
    areaPlaceholder:'请输入订单备注',
    isSumCouponPrice:true
  },
  onShow: function(){
    let _this = this
  
    let countPrice = _this.data.countPrice
    let limitIntegral = _this.data.limitIntegral
    if (limitIntegral) {
      _this.setData({
        canUseIntegral:parseFloat(countPrice) * parseFloat(_this.data.creditScale)
      })
    }
    _this.setData({
      addressId:_this.data.addressId,
      realname:_this.data.realname,
      mobile:_this.data.mobile,
      address:_this.data.address,
      imageUrl: app.globalData.imageUrl
    },function(){
      _this.getDispatchPrice(1) //点击地址后重新获取运费进行计算
    })
  },
  onLoad: function(options){
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    let isBargain = options.isBargain || 0
    let zeroShopId = options.zeroShopId
    if(zeroShopId){
      _this.setData({
        zeroShopId:zeroShopId,
        preformid:options.formid
      })
    }
   
    _this.getAddress()
    _this.getUserInfo()
    let goodsList = wx.getStorageSync('orderShopList');
    let submitGoodsList = []  // 提交订单用商品对象列表
    let goodsIdList = [] // 获取运费用商品id列表
    
    let totalPrice = _this.data.totalPrice
 
   
    for (let i = 0; i < goodsList.length; i++) {
      let goodsId = goodsList[i].goodsId
      let cateTotal = goodsList[i].cateTotal
      let price = parseFloat(goodsList[i].price)*100
      let count = goodsList[i].number
      let countPrice = price*count
      let spec = goodsList[i].spec || 0
      submitGoodsList.push({id:goodsId,total:count,cateTotal:cateTotal,price:price,spec:spec})
      goodsIdList.push(goodsId)
      totalPrice =( parseFloat(totalPrice) + parseFloat(countPrice)).toFixed(2)
    }
    _this.setData({
      goodsList:goodsList,
      submitGoodsList:submitGoodsList,
      totalPrice:totalPrice,
      isBargain:isBargain
    },function(){
      _this.getDispatchPrice() //获取运费
      _this.getCalculateCredit() //获取积分信息
    })

    if(isBargain == 1){
      _this.recordZeroShopView(zeroShopId,1) //0元购统计进入详情的全部用户
    }
  },
  onUnload(){
    let goodsList = this.data.goodsList
    let _this = this
    if(this.data.leaveStatus){
      _this.recordZeroShopView(_this.data.zeroShopId,3)
    }else{
      _this.recordZeroShopView(_this.data.zeroShopId,2)
    }
  },
  // 获取用户地址
  getAddress: function(){
    let _this = this
    let loginTime = loginTime
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.redirectTo({
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
            },function(){
              _this.getDispatchPrice() //获取运费价格
            })
          }
        }
        else if (code == 1019) {
          // wx.navigateTo({
          //   url: '/pages/login/index'
          // })
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
    this.setData({
      showAddressMask:false,
      areaPlaceholder:'请输入订单备注'
    },function(){
      wx.navigateTo({
        url: '/pages/address/index?url=order'
      })
    })
  },
  // 获取用户信息
  getUserInfo: function(e) {
    let _this = this
    let loginTime = loginTime
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.redirectTo({
        url: '/pages/login/index'
      })
      return false;
    }
    wx.showLoading({
      mask:true,
      title: '获取用户信息中...'
    })
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
        wx.hideLoading()
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let superstatus = res.data.userInfo.superstatus // 获取用户会员情况（1是会员，2是非会员）
          let showIntegral = res.data.userInfo.credit1 // 获取用户当前积分
          _this.setData({
            superstatus:superstatus,
            showIntegral:showIntegral
          })
         
        }
        else if (code == 1019) {
          wx.redirectTo({
            url: '/pages/login/index'
          })
          // // wx.setStorageSync('isLogin', false)
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
        status:4,
        isPage:false,
        obj:_this.data.submitGoodsList
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
          let couponItemId = res.data.couponItemId
          let couponBackType = res.data.backtype
          let deductprice = res.data.deductprice
          let discount = res.data.discount
          _this.setData({
            isSumCouponPrice:false,
            choseCoupon:false,
            couponList:couponList,
            couponId:couponItemId,
            couponBackType:couponBackType,
            couponPrice:deductprice,
            couponDiscount:discount,
          },function(){
            _this.getSuperMemberPrice()
          })
        }
        else if (code == 1019) {
          // wx.navigateTo({
          //   url: '/pages/login/index'
          // })
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
    let submitGoodsList = JSON.stringify(_this.data.submitGoodsList)
    let fare = _this.data.fare || 0
    let couponId = _this.data.couponId || 0 //默认选中的优惠券id
    let couponPrice = _this.data.couponPrice || 0
    console.log(_this.data.showPayPrice,'showPayPrice')
    wx.navigateTo({
      url: '/pages/usecoupon/index?totalPrice='+_this.data.showPayPrice+'&fare='+fare+'&submitGoodsList='+submitGoodsList + '&couponId='+couponId+'&couponPrice=' +couponPrice
    })
  },
  // 提交生成订单
  submit: function(e){
    let _this = this
    let addressId = _this.data.addressId
    let submitGoodsList = _this.data.submitGoodsList 
    let isLogin = wx.getStorageSync('isLogin')
    let formid = _this.data.formId
    let isBargain = _this.data.isBargain
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    wx.showLoading({
      mask:true,
      title: '订单生成中...'
    })
    let url = 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Order&method=CreateOrder'
    if(isBargain == 1){ //判断是否从0元购详情页进入
      url = 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Bargain&method=CreateOrder'
    }
    wx.request({
      url: url,
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        obj:submitGoodsList,
        addressid:addressId,
        couponid:_this.data.couponId,
        integral:_this.data.integral,
        remark:_this.data.remark,
        formid:formid,
        goodsid:submitGoodsList[0].id,
        spec:submitGoodsList[0].spec,
        btype:2
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
          let orderId = res.data.id

          let orderstatus = res.data.orderstatus // 获取订单状态（1为待发货，作为是否是全积分付款判断条件）
          if (orderstatus == 1) {
            _this.setRedPoint(1)
            wx.reLaunch({
              url: '/pages/pay-success/index?Id='+orderId+''
            });
          }
          else {
            if(isBargain){
              wx.request({
                url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Bargain&method=ConfirmPay',
                method: 'post',
                data: JSON.stringify({
                  baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
                  orderid:orderId,
                }),
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
                },
                success: (res) => {
                  let code = res.data.baseServerInfo.code
                  let msg = res.data.baseServerInfo.msg
                  if (code == 1) {
                    let flag = res.data.flag
                    if(flag==1){
                      _this.payfor(orderId)
                    }else{
                      wx.showModal({
                        title:'提示',
                        content:'购买成功',
                        showCancel:false,
                        success:function(){
                          _this.setRedPoint(1)
                          wx.redirectTo({
                            url: '/pages/bargain-pay-success/index?Id='+orderId+''
                          })
                        }
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
            }else{
              _this.payfor(orderId)
            }
           
          }
        }
        else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }else if(code == 8001){
          _this.setData({
            showAddressMask:true,
            areaPlaceholder:' '
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
        wx.hideLoading()
      }
    })
  },
  // 订单支付
  payfor: function(orderId){
    let _this = this
    wx.showLoading({
      mask:true,
      title: '订单支付中...'
    })
    let orderType = 1
    if(_this.data.isBargain == 1){
      orderType = 4
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Payment&method=WechatPayOrder',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        orderId:orderId,
        orderType:orderType
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
    let isBargain = _this.data.isBargain
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
        if(isBargain == 1){
          wx.reLaunch({
            url: '/pages/bargain-pay-success/index?Id='+orderId+''
          });
        }else{
          wx.reLaunch({
            url: '/pages/pay-success/index?Id='+orderId+''
          });
        }

      },
      fail: function(res) {
      }
    })
  },
  // 支付失败回调
  cancelOrder: function(orderId){
    this.setRedPoint(0)
    let _this = this
    let isBargain = _this.data.isBargain
    if(isBargain == 1){
      _this.cancleOrder(orderId)
    }else{
      wx.navigateBack()
    }
    
    // wx.redirectTo({
    //   url: '/pages/my-order-detail/index?Id='+orderId+''
    // });
  },
  // 跳转到购买会员页
  hrefToSupermember:function(){
    wx.navigateTo({
      url: '/pages/supermember-buy/index',
    })
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
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let baseinfo  = res.data.baseinfo
          let discount  = baseinfo.discount/100 // 获取会员折扣
          if (_this.data.superstatus == 1 ) {
            let countDiscount = _this.data.totalPrice*(1 - discount)
            let countDiscount2 = parseInt(countDiscount.toFixed())
            let payPrice = parseFloat(parseFloat(_this.data.totalPrice) + _this.data.fare*100 - countDiscount2).toFixed(2)
            let showDiscountPrice = parseInt(countDiscount2)
            if (_this.data.showIntegral >= payPrice) {
              _this.setData({
                limitIntegral:true,
                canUseIntegral:parseFloat(payPrice) * parseFloat(_this.data.creditScale)
              })
            }
            _this.setData({
              payPrice:payPrice,
              showPayPrice:payPrice,
              countPrice:payPrice,
              discount:discount,
              showDiscountPrice:showDiscountPrice
            })
          }
          else {
            console.log(_this.data.totalPrice,_this.data.fare,_this.data.couponPrice)
            let payPrice = parseFloat(parseFloat(_this.data.totalPrice) + _this.data.fare*100).toFixed(2) - parseFloat(_this.data.couponPrice*100)
            let countDiscount2 = _this.data.totalPrice*(1 - discount)
            let showDiscountPrice = parseInt(countDiscount2)
            if (_this.data.showIntegral >= parseFloat(payPrice)) {
              _this.setData({
                limitIntegral:true,
                canUseIntegral:parseFloat(payPrice) * parseFloat(_this.data.creditScale)
              })
            }else{
              _this.setData({
                limitIntegral:false,
                canUseIntegral:(parseFloat(_this.data.showIntegral) * parseFloat(_this.data.creditScale)).toFixed(0)
              })
            }
            _this.setData({
              payPrice:payPrice,
              showPayPrice:payPrice,
              countPrice:payPrice,
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
      },
      fail: (res) => {
      }
    })
  },
  // 选择使用或不使用积分
  useIntegral:function(){
    let _this = this
    let useIntegral = _this.data.integral // 获取用户是否使用积分
    let integralPrice = _this.data.showIntegral // 用户积分数量
    let limitIntegral = _this.data.limitIntegral // 获取用户积分是否已经超过订单金额上限
    let canUserCredit = _this.data.canUserCredit //判断是否可以使用积分
    if(!canUserCredit)return
    if (limitIntegral) {
      if (useIntegral == 0) {
        _this.setData({
          integral:1,
          showPayPrice:(parseFloat(_this.data.showPayPrice) - parseFloat(_this.data.countPrice) * parseFloat(_this.data.creditScale)).toFixed(2)
        })
      }
      else if (useIntegral == 1) {
        let finalPrice = (parseFloat(_this.data.showPayPrice) + parseFloat(_this.data.countPrice) * parseFloat(_this.data.creditScale)).toFixed(2) // 积分计算结果价格
        _this.setData({
          integral:0,
          showPayPrice:finalPrice
        })
      }
    }
    else {
      if (useIntegral == 0) {
        let finalPrice = (parseFloat(_this.data.showPayPrice) - parseFloat(_this.data.canUseIntegral) ).toFixed(2) // 积分计算结果价格
        _this.setData({
          integral:1,
          showPayPrice:finalPrice
        })
      }
      else if (useIntegral == 1) {
        let finalPrice = (parseFloat(_this.data.showPayPrice) + parseFloat(_this.data.canUseIntegral) ).toFixed(2) // 积分计算结果价格
        _this.setData({
          integral:0,
          showPayPrice:finalPrice
        })
      }
    }
  },
  // 绑定订单备注输入
  bindRemark:function(e){
    let _this = this
    let remark = e.detail.value
    _this.setData({
      remark:remark
    })
  },
  //获取运费
  getDispatchPrice(isNew=0){ 
    let _this = this
    let goodsList = wx.getStorageSync('orderShopList');
    let obj = []
    for(var i in goodsList){
      let goods = {}
      goods.id = goodsList[i].goodsId
      goods.total = goodsList[i].number
      goods.spec = goodsList[i].spec || 0 //商品规格分类
      obj.push(goods)
    }
    let url = ''
    if(_this.data.isBargain == 1){
      url = 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Order&method=GetDispatchPriceBargain'
    }else{
      url = 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Order&method=GetDispatchPrice'
    }
    wx.request({
      url: url,
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        obj:obj,
        addressid:_this.data.addressId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let oldfare = _this.data.fare || 0
          let fare = parseFloat(res.data.dispatchprice)
          let showPayPrice = _this.data.showPayPrice ||0
          _this.setData({
            fare:fare
          },function(){
            if(!isNew){
             _this.getCalculateCredit()
            
            }else{

              _this.setData({
                 showPayPrice:(parseFloat(showPayPrice) -oldfare*100 +fare*100).toFixed(2)
              })
            }
            
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
  formSubmit(e){
    let formId = e.detail.formId
    this.setData({
      formId:formId
    })
  },
  formSubmitB(e){ //获取formId用户模板消息
    let _this = this
    let formId = e.detail.formId 
    let formArr = _this.data.formArr 
    formArr.push(formId)
    formArr.push(_this.data.preformid)
    formArr = Array.from(new Set(formArr))
    this.setData({
      formId:formId,
      formArr:formArr
    },function(){
      if(_this.data.formArr.length>=2){
        _this.hrefToBargainShare()
        
      }
    })
  },
  hrefToBargainShare(){//跳转到0元购邮费帮砍页面
    let shopId = this.data.goodsList[0].goodsId
    let _this = this
    let addressId = _this.data.addressId
    let isLogin = wx.getStorageSync('isLogin')
    let formid = _this.data.formId
    let spec = _this.data.goodsList[0].spec
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    wx.showLoading({
      icon:'loading',
      title:'正在处理'
    })
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Bargain&method=CreateOrder',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        goodsid:shopId,
        addressid:addressId,
        remark:_this.data.remark,
        formid:formid,
        spec:spec,
        formarr:_this.data.formArr,
        btype:1
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let orderid = res.data.id
          _this.setRedPoint(4)
          wx.hideLoading({
            success:function(){
              wx.redirectTo({
                url: ''+'/pages/bargain-comfirm/index?isBargain=1&shopId='+shopId + '&orderId='+orderid + '',
              })
            }
          })
        }
        else if (code == 1019) {
          wx.hideLoading()
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }else if(code == 8001){
          wx.hideLoading()
          _this.setData({
            showAddressMask:true,
            areaPlaceholder:' '
          })
        }
        else{
          wx.hideLoading()
          wx.showModal({
            title:'提示',
            content:msg,
            showCancel:false,
            success:function(res){
             _this.setData({
               leaveStatus:1//因为点击提示无地址
             })
            }
          })
        }
      },
      fail: (res) => {
        wx.hideLoading()
      }
    })

  },
  //统计进入砍价的流量
  recordShopView(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=RecordShopView',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        goodsid: _this.data.shopId,
        type:1
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
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
  //取消订单
  cancleOrder(orderid){
    let _this = this
    let formid = _this.data.formId
    var url = 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=CancelOrder'
    let orderId = orderid //获取订单Id
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index',
      })
      wx.setStorage({
        key: 'isLogin',
        data: false
      })
    }
      wx.request({
        url: url,
        method: 'post',
        data: JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
          id:orderId,
          formid:formid
        }),
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
        },
        success: (res) => {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
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
    },
  recordZeroShopView(goodsid,type){
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=RecordZeroShopView',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        goodsid:goodsid,
        type:type
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
        }else {
        }

      },
      fail: (res) => {
      }
    })
  },
  //隐藏地址提示弹出框
  hidenAddressMask(){
    this.setData({
      showAddressMask:false,
      areaPlaceholder:'请输入订单备注'
    })
  },
  //展示购物金弹窗
  showRuleToast(){
    let _this = this
    this.setData({
      areaPlaceholder:' ',
      showRuleToast:true,
    })
  },
  //隐藏规则弹窗
  hideRuleToast(){
    this.setData({
      showRuleToast:false,
      areaPlaceholder:'请输入订单备注'
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
           if(_this.data.isBargain!=1){
            _this.getCouponList()
           }else{
             _this.getSuperMemberPrice()
           }
          })
        }else if (code == 1019) {
          // wx.navigateTo({
          //   url: '/pages/login/index'
          // })
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
