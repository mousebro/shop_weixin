// pages/receive-coupon-center/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    usedBgImg:'/images/receive-coupon-center/received.png',
    doneBgImg:'/images/receive-coupon-center/done.png',
    status:1,
    currentPage:1,
    couponList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    this.getCouponList()
    let usedBgImg = wx.getFileSystemManager().readFileSync(this.data.usedBgImg,'base64')
    let doneBgImg = wx.getFileSystemManager().readFileSync(this.data.doneBgImg,'base64')
    this.setData({
      usedBgImg:'data:image/jpg;base64,' + usedBgImg,
      doneBgImg:'data:image/jpg;base64,' + doneBgImg,
    })
   //this.setSheet()
  },
  getCouponList(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      // wx.setStorageSync('isLogin', false)
      return false;
    }
      // 显示加载图标
      wx.showLoading({
        title: '玩命加载中',
      })
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      page: _this.data.currentPage,
      pagelength:10
    })
    _this.setHttpRequst('Supermember','GetCenterCouponList',data,function(res){
      let couponList = res.data.couponlist
      wx.hideLoading()
      for(let i in couponList){
        couponList[i].deduct = parseInt(couponList[i].deduct)
        couponList[i].discount = + parseFloat(couponList[i].discount).toFixed(1)
        couponList[i].enough = parseInt(couponList[i].enough)
        if(couponList[i].alreadyget == couponList[i].total && couponList[i].total!=0 && couponList[i].total!=-1){
          couponList[i].getStatus = 1 //判断是否已经领取完 1已经领取完 0未领取完
          couponList[i].percent = 100
        }else{
          couponList[i].getStatus = 0
          if(couponList[i].alreadyget != 0 && couponList[i].total!=0 && couponList[i].total!=-1){
            couponList[i].percent = ((parseInt(couponList[i].alreadyget)/parseInt(couponList[i].total))*100).toFixed(0)
          }else{
            couponList[i].percent = 0
          }
        }
      }
      _this.setData({
        couponList:couponList
      })
    },function(){
      wx.hideLoading()
    })
  },
  //发送http请求
  setHttpRequst(Class,Method,Data,Succ,Fail){
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
        wx.showModal({
          title:'提示',
          content:res.data.errMsg,
          showCancel:false,
          success:()=>{}
        })
      }
    })
  },
  getCoupon(e){ //用户点击获取优惠券
    let couponid = e.currentTarget.dataset.couponid
    let isget = e.currentTarget.dataset.isget
    console.log(isget)
    if(isget==1)return
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      // wx.setStorageSync('isLogin', false)
      return false;
    }
    wx.showLoading({
      title:'正在获取中'
    })
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      couponid:couponid
    })
    _this.setHttpRequst('Supermember','GetCenterCoupon',data,function(res){
      wx.hideLoading()
      _this.getCouponList()
      wx.showToast({
        title:'领劵成功',
        icon:"success"
      })
    },function(res){
      wx.hideLoading()
      wx.showModal({
        title:'提示',
        content:res.data.baseServerInfo.msg,
        showCancel:false,
        success:function(){}
      })
    })
  },
  gotoUse(e){
    let cate = e.currentTarget.dataset.cate
    let goodsid =e.currentTarget.dataset.goodsid
    console.log(cate,goodsid)
    if(goodsid){
      wx.navigateTo({
        url: '/pages/shop-detail/index?Id='+goodsid
      })
    }else if(cate){
      wx.navigateTo({
        url: '/pages/sort/index?'
      })
    }
  },

   // 页面上拉触底事件的处理函数
   
  onReachBottom: function () {
    var _this = this;

    let page = _this.data.currentPage
    page = page + 1;
    _this.getCouponList()
  },


})