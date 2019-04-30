// pages/my-order-detail/index.js
import formatTime from '../../utils/util.js'
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderId:0,
    orderInfo:{},
    isSuper:true,
    serverTimeStamp:0,
    timer:null,
    freightMsg:'您的订单已由本人签收，感谢您在本商城购物，欢迎再次光临',
    time:{},
    actionSheetHidden:true, //是否隐藏客服窗口
    Class:'Order',
    Method:'GetOrderDetail',
    orderType:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
      //获取订单的ID
      this.setData({
        imageUrl: app.globalData.imageUrl
      })
      if(options.Id){
        this.setData({
          orderId:options.Id,
          orderType:options.type,
          isteam:options.isteam,
          isSuccess:options.isSuccess
        })
      }
      if(options.pageFrom=='flash'){ //如果是从秒杀页订单跳转过来的订单类型为3
        this.setData({
          orderType:3,
        })
      }else if(options.pageFrom=='group'){
        this.setData({
          orderType:2,
        })
      }
      if(options.type == 2 || options.pageFrom=='group'){ //根据不同的订单类型来请求不同的接口（订单详情）
        this.setData({
          Class:'ShopGroups',
          Method:'GetGroupOrderDetail'
        })
      }else if(options.type == 1 || options.type == 4){
        this.setData({
          Class:'Order',
          Method:'GetOrderDetail'
        })
      }else if(options.type == 3 || options.pageFrom=='flash'){
        this.setData({
          Class:'Seckill',
          Method:'GetOrderDetail'
        })
      }
      clearInterval(this.data.timer);
    this.getOrderList(options.Id)//普通商品获取订单详情
   
  },
  /*点击去评价按钮，进行页面跳转*/
  hrefCommit(e){
    let orderId = e.currentTarget.dataset.orderid
    let type = e.currentTarget.dataset.ordertype
    let Id = e.currentTarget.dataset.goodid
    let picture = e.currentTarget.dataset.picture
    wx.redirectTo({
      url: '/pages/commit/index?orderId=' + orderId+'&type='+type+'&Id='+Id+'&picture='+picture+''
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
      phoneNumber: app.globalData.customerMobile // 仅为示例，并非真实的电话号码
    })
  },
  //取消底部弹窗
  close: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
  },
  /*点击按钮，取消订单*/
  hrefCancel(e){
    let orderId = e.currentTarget.dataset.orderid
    let _this = this
    let formid = _this.data.formId
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
    wx.showModal({
      title: '提示',
      content: '确认取消订单',
      showCancel:true,
      success:(res)=>{
        if (res.confirm){
          wx.request({
            url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=CancelOrder',
            method: 'post',
            data: JSON.stringify({
              baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
              id: orderId,
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
                wx.navigateBack({
                  delta:1
                })
              } else {
                console.log(res.msg)
              }

            },
            fail: (res) => {
            }
          })
        }
      }
    })
  },
  /*获取订单详情*/
  getOrderList(Id) {
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if(!isLogin){
      wx.navigateTo({
        url: '/pages/login/index',
      })
      wx.setStorage({
        key: 'isLogin',
        data: false
      })
    }
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=' +_this.data.Class+ '&method='+_this.data.Method,
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        id: Id
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let obj = res.data.orderInfo || res.data.groupOrderDetail
          let orderGoodsList = obj.orderGoodsList
          let status = obj.status // 获取订单状态
          let Id = obj.id
          if (status == 2) {
            _this.getExpressInfo(Id)
          }
          if(obj.teamid){
            _this.setData({
              orderType:2
            })
          }else{
          }

          for (var i = 0; i < orderGoodsList.length; i++) {
            let img = orderGoodsList[i].thumb
            let url = img.substring(0,4)
            if (url != 'http') {
              orderGoodsList[i].thumb = app.globalData.imageUrl+img
            }
          }
          let date01 = new Date(obj.createtime*1000)//进行时间
          obj.newcreatetime = formatTime.formatTime(date01)
          let date02 = new Date(obj.paytime*1000)
          obj.newpaytime = formatTime.formatTime(date02) //支付时间
          let date03 = new Date(obj.finishtime * 1000)
          obj.newfinishtime = formatTime.formatTime(date03) //完成时间
          obj.discountprice = parseFloat(obj.discountprice)
          _this.setData({
            orderInfo:obj
          })
        } else {
          wx.showModal({
            title: '提示',
            content: msg,
            showCancel:false
          })
        }
        this.getSystemTime()//获取系统时间 并设置倒计时
      },
      fail: (res) => {

      }
    })
  },

  /*获取系统时间*/
  getSystemTime(){
    let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=System&method=GetBaseInfo',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        id: _this.data.orderId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          if(_this.data.orderType == 3){
            _this.countDown(res.data.serverTimeStamp * 1000, _this.data.orderInfo.createtime * 1000+600*1000)
          }else{
            _this.countDown(res.data.serverTimeStamp * 1000, _this.data.orderInfo.createtime * 1000+24*3600*1000*2) //普通订单两天后关闭
          }
        } else {
        }

      },
      fail: (res) => {
      }
    })
  },
  /*倒计时*/
  countDown(start, end) {
    let _this = this
    _this.data.timer = setInterval(() => {
      start += 1000
      let count = end - start
      let hours = formatTime.formatNumber(parseInt(count / 1000 / 3600))
      let minutes = formatTime.formatNumber(parseInt((count - parseInt(hours) * 1000 * 3600) / 1000 / 60))
      let seconds = formatTime.formatNumber(parseInt((count - parseInt(hours) * 1000 * 3600 - parseInt(minutes) * 1000 * 60) /1000))
      _this.setData({
        time: {
          hours: hours,
          minutes: minutes,
          seconds:seconds
        }
      })
    }, 1000)
  },
  // 提交生成订单 -去支付 -点击按钮
  payfor: function(e){
    let _this = this
    let orderId = e.currentTarget.dataset.orderid

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
        orderType:_this.data.orderType
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
        _this.setRedPoint(1,1)
        wx.navigateBack({
          delta: 1 // 回退前 delta(默认为1) 页面
        })
      },
      fail: function(res) {
      }
    })
  },
  // 支付失败回调
  cancelOrder: function(orderId){
    let _this = this
    _this.getOrderList(orderId)
  },
  //待分享
  //分享拼团商品
  onShareAppMessage: function(res) {
    let _this = this
    return {
      title: ''+_this.data.orderInfo.orderGoodsList[0].title+'',
      path:'/pages/group-buy-detail/index?Id='+_this.data.orderInfo.id+'&teamid='+_this.data.orderInfo.teamid,
      imageUrl:_this.data.orderInfo.orderGoodsList[0].thumb
    }
  },
  //确认收货
  comfirmHandle(e){
    let _this = this
    let formid = _this.data.formId
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
     if(_this.data.orderType == 2 ){//团购商品
      var url = 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopGroups&method=ConfirmReceipt'
     }else{
      var url = 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Order&method=ConfirmReceipt'
     }
    wx.request({
      url: url,
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id:_this.data.orderId,
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
          _this.setRedPoint(3,1)
          wx.showModal({
            title:'提示',
            content:msg,
            showCancel:false,
            success:function(res){
              wx.redirectTo({
                url: '/pages/my-order-detail/index?Id='+_this.data.orderId+'&type='+_this.data.orderType+'&isteam='+_this.data.isteam+'&isSuccess='+_this.data.isSuccess
              })
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
  //添加红点
  setRedPoint(type,show){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=RedPoint&method=UpdateRedPoint',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        type:type,
        show:show
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
  //打开平台回复下拉
  openResponse(e){
    let _this = this
    let openResponse = _this.data.openResponse || 0
    this.setData({
      openResponse:!openResponse
    })
  },
  //跳转到物流
  hrefToExpress: function(e) {
    let expresscom = e.currentTarget.dataset.expresscom
    let expresssn = e.currentTarget.dataset.expresssn
    let expressId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/express/index?expresscom='+expresscom+'&expresssn='+expresssn+'&expressId='+expressId+''
    })
  },
  //复制物流编号
  copy:function(e){
    let expresssn = e.currentTarget.dataset.expresssn
    wx.setClipboardData({
      data: expresssn,
      success(res) {
        console.log(res);
      }
    })
  },
  //跳转到商品详情
  hrefToShopDetail: function(e) {
    let shopId = e.currentTarget.dataset.id
    console.log(shopId);
    wx.navigateTo({
      url: '/pages/shop-detail/index?Id='+shopId+''
    })
  },
  getExpressInfo:function(expressId){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      orderId:expressId
    })
    _this.setHttpRequst('Order','GetOrderExpress',data,function(res){
      let express = res.data.express // 获取物流信息
      let showExpress = express.reverse() // 反转数组
      _this.setData({
        express:showExpress
      })
    })
  },
  // 发送http请求
  setHttpRequst: function(Class,Method,Data,Succ,Fail){
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
        }
        else {
          Fail(res)
        }
      },
      fail: (res) => {
      }
    })
  },
})
//path:'/pages/group-buy-detail/index?Id='+_this.data.goodsDetail.id+'&teamid='+_this.data.team.id
