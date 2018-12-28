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
    freightMsg:'您的订单已有本人签收，感谢您在名庄商城购物，欢迎再次光临',
    time:{},
    actionSheetHidden:true //是否隐藏客服窗口

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
      //获取订单的ID
      if(options.Id){
        this.setData({
          orderId:options.Id
        })
        
      }
    this.getOrderList(options.Id)
    clearInterval(this.data.timer);
    this.getSystemTime()//获取系统时间 并设置倒计时
  
    
  },
  /*点击去评价按钮，进行页面跳转*/
  hrefCommit(){
    wx.navigateTo({
      url: '/pages/commit/index?Id=' + this.data.orderId
    })
  },
  /*点击联系客服*/
  hrefCService(){
    wx.showActionSheet({
      itemList: ['拨打客服热线', '客服消息入口'],
      success(res) {
        console.log(res.tapIndex)
      },
      fail(res) {
        console.log(res.errMsg)
      }
    })
  },
  /*点击按钮，进行支付*/
  hrefToPay(e){
    let orderId = e.currentTarget.dataset.orderid
    console.log(orderId)

  },
  /*点击按钮，取消订单*/
  hrefCancel(e){
    let orderId = e.currentTarget.dataset.orderid
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
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=CancelOrder',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        id: orderId
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
    console.log(_this.data.orderId)
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=GetOrderDetail',
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
        console.log(res)
        if (code == 1) {
          let obj = res.data.orderInfo
          let date01 = new Date(obj.createtime*1000)//进行时间
          obj.newcreatetime = formatTime.formatTime(date01)
          let date02 = new Date(obj.paytime*1000)
          obj.newpaytime = formatTime.formatTime(date02) //支付时间
          let date03 = new Date(obj.finishtime * 1000)
          obj.newfinishtime = formatTime.formatTime(date03) //完成时间
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
          _this.countDown(res.data.serverTimeStamp * 1000, _this.data.orderInfo.createtime * 1000+24*3600*1000)
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
      _this.setData({
        time: {
          hours: hours,
          minutes: minutes
        }
      })
    }, 1000)
  }
})