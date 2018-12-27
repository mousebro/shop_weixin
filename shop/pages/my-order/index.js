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
    currentTab: 0
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
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
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
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=GetOrderList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page:1,
        pageLength:20,
        status:-2
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('sessionId')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let list = res.data.orderList
          _this.getTimes(list)
          _this.setData({
            orderList:list
          })
          console.log(_this.data.orderList)
         
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
      list[i].createtime = formatTime.formatTime(date)
      list[i].orderPList
    }
  }
})

