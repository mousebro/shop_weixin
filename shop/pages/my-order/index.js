// pages/my-order/index.js
var app = getApp()
import formatTime from '../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList:[],
    navbar: ['全部', '待付款', '待发货', '待收货', '完成'],
    currentTab: 0,
    nowStatus:-2,
    page:1,
    pageCount:0
   },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow:function(options){
    this.getOrderList()
  },
  /*用户点击顶部导航进行选项卡切换,并请求对应的数据*/
  handleChose: function (e){
    let idx = e.currentTarget.dataset.idx
    let nowStatus = 0
    if(idx == 0 ){
        nowStatus = -2
    }else if(idx == 1){
      nowStatus = 0
    }else if(idx ==2){
      nowStatus = 1
    }else if(idx == 3){
      nowStatus = 2
    }else if(idx == 4){
      nowStatus = 3
    }
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      nowStatus: nowStatus
    })
    this.getOrderList()
  },
  /*点击更多*/
  handleClick(e){
    let orderId = e.currentTarget.dataset.orderid //获取订单Id
    wx.navigateTo({
      url: '/pages/my-order-detail/index?Id='+orderId
    })
  },
  /*加载订单列表*/
  getOrderList(){
    let _this = this
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
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=GetOrderList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page:_this.data.page,
        pageLength:10,
        status: _this.data.nowStatus
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let list = []
          list = res.data.orderList
          for(var i in list){
            list[i].totalCount = 0
            let orderGoodsList = list[i].orderGoodsList
            console.log(orderGoodsList);
            let img = orderGoodsList[0].thumb
            let url = img.substring(0,4)
            if (url != 'http') {
              orderGoodsList[0].thumb = app.globalData.imageUrl+img
            }
            for(let len=0 ;len< list[i].orderGoodsList.length ; len++){
              list[i].totalCount += parseInt(list[i].orderGoodsList[len].total)
            }
          }
          _this.getTimes(list)
          _this.setData({
            orderList:list,
            pageCount:res.data.pageCount
          })

        } else {
          console.log(res.msg)
        }

      },
      fail: (res) => {
      }
    })
  },
  /*待发货-去付款*/
  gotoPay(e) {
    let orderId = e.currentTarget.dataset.orderid //获取订单Id
    wx.navigateTo({
      url: '/pages/pay/index?Id='+orderId
    })
  },
  //进行时间戳转换
  getTimes(list){
    if(list.length == 0)return
    for(var i in list){
      let date = new Date(list[i].createtime*1000)
      list[i].newCreatetime = formatTime.formatTime(date)
      list[i].orderPList
    }
  },
  onReachBottom(){
    this.setData({
        page: ++this.data.page
    })
    this.getOrderList()
  },
  /*取消订单*/
  cancleOrder(e){
    let _this = this
    let orderId = e.currentTarget.dataset.orderid //获取订单Id
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
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=CancelOrder',
            method: 'post',
            data: JSON.stringify({
              baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
              id:orderId
            }),
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
            },
            success: (res) => {
              let code = res.data.baseServerInfo.code
              let msg = res.data.baseServerInfo.msg
              if (code == 1) {
                _this.getOrderList()
              } else {
                console.log(res.msg)
              }

            },
            fail: (res) => {
            }
          })
        }
        else if (res.cancel) {

        }
      }
    })
  },
  // 提交生成订单 -去支付
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
        _this.getOrderList()
      },
      fail: function(res) {
      }
    })
  },
  // 支付失败回调
  cancelOrder: function(orderId){
    let _this = this
    _this.getOrderList()
  },
  //确认收货
  comfiremFn(e){
    let _this = this
    let orderId = e.currentTarget.dataset.orderid //获取订单Id
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
      content: '确认收货',
      showCancel:true,
      success:function(res){
        if(res.confirm){
          wx.request({
            url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=ConfirmReceipt',
            method: 'post',
            data: JSON.stringify({
              baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
              id:orderId
            }),
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
            },
            success: (res) => {
              let code = res.data.baseServerInfo.code
              let msg = res.data.baseServerInfo.msg
              if (code == 1) {
                _this.getOrderList()
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

  }
})
