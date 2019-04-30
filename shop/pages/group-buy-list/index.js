// pages/group-buy-list/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPage:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    this.setHttpRequest()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let nowPage = this.data.currentPage + 1
    if(nowPage > this.data.pageCount) return;
    this.setData({
      currentPage : nowPage
    })
    this.setHttpRequest()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //发送网络请求获取拼团列表页
  setHttpRequest(){
    let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=ShopGroups&method=GetList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page:_this.data.currentPage,
        pageLength:10,
        isindex:false
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        console.log(res)
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        let goodsList = res.data.goodsList
        for(let item of goodsList){ //将价格做分割处理
          item.priceArr = item.groupsprice.split('.')
          let url = item.thumb.substring(0, 4)  //判断图片是否有带主机名
          if (url != 'http') {
            item.thumb = app.globalData.imageUrl + item.thumb
          }
        }
        if (code == 1) {
          _this.setData({
            goodsList:res.data.goodsList,
            pageCount:res.data.pageCount
          })
        }else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }else {
          wx.showModal({
            title:'提示',
            content:msg,
            showCancel:false,
            success:function(res){
              wx.navigateBack({
                delta:1
              })
            }
          })
        }

      },
      fail: (res) => {
      }
    })
  },
  //跳转到团购详情页
  hrefToGroupDetail(e){
    let goodId = e.currentTarget.dataset.goodsid
    wx.navigateTo({
      url: '/pages/group-buy-detail/index?Id='+goodId
    })
  }
})
