// pages/my-order/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbar: ['全部', '待付款', '待发货', '待收货', '项目1', '项目2', '项目3', '项目4'],
    currentTab: 0,
    waitPayData:{
      title:'待付款',
      times:'2018-12-13 16:45',
      totalCount:5,
      totalPrice:'888.00',
      goodsList:[
        { id: 1, imgUrl: '../../pic/product01.png', count: 1, subscrib:'53°茅台王子酒53°茅台王'},
        { id: 2, imgUrl: '../../pic/product01.png', count: 5, subscrib: '53°茅台王子酒53°茅台王'},
        { id: 3, imgUrl: '../../pic/product01.png', count: 1, subscrib: '53°茅台王子酒53°茅台王'}
      ]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  /*用户点击顶部导航进行选项卡切换,并请求对应的数据*/
  handleChose: function (e) {
    this.setData({
      currentTab: e.currentTarget.dataset.idx
    })
  }
})

