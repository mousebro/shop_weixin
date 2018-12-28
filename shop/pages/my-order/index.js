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
  handleChose: function (e) {
    let idx = e.currentTarget.dataset.idx
    idx = idx==0?idx-2:idx-1
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      nowStatus: idx
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
    console.log(_this.data.nowStatus)
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
        console.log(res)
        if (code == 1) {
          let list = res.data.orderList
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
  /*待发货-取消订单*/
  cancleOrder(e){
    let orderId = e.currentTarget.dataset.orderid //获取订单Id
    
    
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
})

