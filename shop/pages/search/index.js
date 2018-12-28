// pages/search/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputVal:"",
    isSuccess:true,
    isNoCatchData:false,
    productList: []
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
    console.log(wx.login)
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
  /*用户搜索框输入操作*/
  bindKeyInput:function(e){
    // wx.showLoading({
    //   title: '正在加载中',
    // })
    let _this = this
    this.setData({
      inputVal:e.detail.value
    })
    /*判断是否请求数据完成，只有在请求完成的时候才能再根据输入的值再次发送请求*/
    let kWord = this.data.inputVal
    _this.setData({
      isSuccess:false //还未请求成功，防止再次输入而向服务器发送请求
    })
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page: _this.data.currentPage,
        pageLength: 10,
        obField: 0,
        obType: 0,
        keyword: kWord
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        console.log(res)
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let productList = res.data.goodsList
            if (productList.length == 0) {
              _this.setData({
                isNoCatchData:true,
              })
            }
            else {
              _this.setData({
                isNoCatchData:false,
                productList: productList
              })
            }
          }
          else {

          }
        }
        else {
          console.log(res.statusCode);
        }
      },
      fail: (res) => {
      }
    })

  },
  /*用户点击商品进行详情页跳转*/
  hrefToDetail(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/shop-detail/index?Id=' + id + ''
    })
  }
})
