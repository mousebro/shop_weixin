//index.js
//获取应用实例
const app = getApp()
const flashTimer = []
Page({
  data: {
    totalPrice:0,
    addressId:0,
    realname:'点击添加地址',
    mobile:'',
    address:'',
    showModal:false,
    pageFrom:'goods',
    timer:null,
    integral:0,
    remark:''
  },
  onShow: function(){
    app.userView('RecordExposurenum') //统计平台曝光度记录
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
    clearInterval(flashTimer[0])
  },
  onLoad: function(options){
    let _this = this
    if(options.from=='secKill'){ //判断是否从商品秒杀页进入
      _this.setData({
        pageFrom:'secKill'
      })
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
    for (let i = 0; i < goodsList.length; i++) {
      let goodsId = goodsList[i].goodsId
      let price = parseFloat(goodsList[i].price)
      let count = goodsList[i].number
      var countPrice = price*count
      submitGoodsList.push({id:goodsId,total:count})
      goodsIdList.push(goodsId)
    }
    let payPrice = parseFloat(countPrice) + parseFloat(fare)
    let totalPrice = goodsList[0].number * goodsList[0].price
    _this.setData({
      goodsList:goodsList,
      submitGoodsList:submitGoodsList,
      fare:fare,
      countPrice:countPrice,
      payPrice:payPrice,
      showPayPrice:payPrice,
      totalPrice:totalPrice
      // couponList:couponList,
    },()=>{
      _this.getUserInfo()
    })
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
  // 选择使用或不使用积分
  useIntegral:function(){
    let _this = this
    let useIntegral = _this.data.integral // 获取用户是否使用积分
    let integralPrice = _this.data.showIntegral // 用户积分数量
    let showPayPrice = _this.data.showPayPrice
    if (useIntegral == 0) {
      if(showPayPrice<integralPrice){
        let finalPrice = 0 // 积分计算结果价格
        _this.setData({
          integral:1,
          showPayPrice:finalPrice
        })
      }else{
        let finalPrice = (_this.data.countPrice - integralPrice).toFixed(2) // 积分计算结果价格
        _this.setData({
          integral:1,
          showPayPrice:finalPrice
        })
      }

    }
    else if (useIntegral == 1) {
      let finalPrice = _this.data.countPrice // 积分计算结果价格
      _this.setData({
        integral:0,
        showPayPrice:finalPrice
      })
    }
  },
  // 获取用户信息
  getUserInfo: function(e) {
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
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
          if(showIntegral>_this.data.showPayPrice){
            var newShowIntegral = _this.data.showPayPrice
          }else{
            
          }
          _this.setData({
            superstatus:superstatus,
            showIntegral:showIntegral,
            newShowIntegral:newShowIntegral
          })
        }
        else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
          // wx.setStorageSync('isLogin', false)
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
  // 提交生成订单
  submit: function(){
    let _this = this
    let addressId = _this.data.addressId
    let submitGoodsList = _this.data.submitGoodsList
    let formid = _this.data.formId
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
      total:_this.data.goodsList[0].number,
      integral:_this.data.integral,
      remark:_this.data.remark,
      formid:formid
    })
    _this.setHttpRequst('Seckill','CreateOrder',data,(res)=>{
     let timeSign = res.data.timeSign
      data = JSON.parse(data)
      data.timeSign = timeSign
      data = JSON.stringify(data)
      wx.showLoading({
        mask:true,
        title: '排队中...'
      })
      flashTimer[0] = setInterval(function(){
        console.log('fdsafd')
        _this.setHttpRequst('Seckill','CheckOrderPop',data,function(res){
          wx.hideLoading()
          clearInterval(flashTimer[0])
          let orderid = res.data.orderid
          console.log(res.data.orderstatus)
          if(res.data.orderstatus == 1){ //如果用积分抵扣掉付款金额
            _this.setRedPoint(1)
            wx.reLaunch({
              url: '/pages/pay-success/index?Id='+orderid+'&pageFrom=flash'
            });
          }else{
            clearInterval(flashTimer[0])
            _this.payfor(orderid)
          }
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
      clearInterval(flashTimer[0])
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
    //普通商品发送订单请求  无用
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
        console.log(res.code)
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
        orderType:3
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
        _this.setRedPoint(1)
        wx.reLaunch({
          url: '/pages/pay-success/index?Id='+orderId+'&pageFrom=flash'
        });
      },
      fail: function(res) {
      }
    })
  },
  // 支付失败回调
  cancelOrder: function(orderId){
    console.log(orderId);
    this.setRedPoint(0)
    wx.redirectTo({
      url: '/pages/my-order-detail/index?Id='+orderId+'&pageFrom=flash'
    });
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
  }
})
