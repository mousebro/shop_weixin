// pages/search/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputVal:"",
    isSuccess:true,
    isNoCatchData:false,
    productList: [

    ]
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
    return ;                  //暂时先将搜索请求关闭
    wx.showLoading({
      title: '正在加载中',
    })
    let _this = this
    this.setData({
      inputVal:e.detail.value
    })
    /*判断是否请求数据完成，只有在请求完成的时候才能再根据输入的值再次发送请求*/
    if (!_this.data.isSuccess)return;
    let kWord = this.data.inputVal
    _this.setData({
      isSuccess:false //还未请求成功，防止再次输入而向服务器发送请求
    })
    wx.request({
      url: 'https://'+_this.$parent.globalData.productUrl+'api?resprotocol=json&reqprotocol=json&class=?&method=？',
      header:{
        'Content-Type':'application/x-www-form-urlencoded'
      },
      method:'POST',
      data:JSON.stringify({
        baseClientInfo:{
          longitude: 0,
          latitude: 0,
        },
        keyword: kWord,
        mobile: mobile
      }),
      success:(res)=>{
        wx.hideLoading()
        if(res.statusCode ==200){
          _this.setData({
            productList:res.proList, /*暂定返回的搜索产品为一个数组*/
            isSuccess:true
          })
          /*如果返回的搜索数据为空，则提示提示没有搜索到相关产品，否则展示产品列表*/
          if(!_this.data.productList){
            _this.setData({
              isNoCatchData:true
            })
          }
        }
      }
    })

  }
})