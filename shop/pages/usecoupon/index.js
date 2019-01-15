//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
  },
  onShow: function(){
  },
  onLoad: function(options){
    let _this = this
    let totalPrice = options.totalPrice
    _this.setData({
      totalPrice:totalPrice,
      payPrice:totalPrice
    })
    _this.getCouponList()
  },
  // 获取优惠券列表
  getCouponList:function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopCoupon&method=UserCouponList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        page:1,
        pageLength:100,
        status:1,
        isPage:false
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        wx.hideLoading()
        if (code == 1) {
          let couponList = res.data.couponList
          _this.setData({
            choseCoupon:false,
            couponList:couponList
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
    // let couponList = [{id:1,couponname:'满减50优惠券',deduct:'50',enough:'1000',backtype:0,timelimit:1,timestart:'2019.1.1',timeend:'2019.1.10'},{id:2,couponname:'95折折扣券',discount:'9.5',enough:'0',backtype:1,beginTime:'2019.1.1',endTime:'2019.1.10'}]
  },
  // 点击打开优惠券列表
  choseCoupon:function(){
    let _this = this
    let couponList = _this.data.couponList
    _this.setData({
      showModal:true
    })
  },
  // 使用现金券
  useCashCoupon:function(e){
    let _this = this
    let couponId = e.currentTarget.dataset.id
    let couponPrice = e.currentTarget.dataset.price
    let usePrice = parseFloat(e.currentTarget.dataset.useprice)
    let totalPrice = _this.data.totalPrice/100
    let payPrice = _this.data.payPrice - couponPrice*100
    console.log(totalPrice);
    console.log(usePrice);
    if (totalPrice < usePrice) {
      wx.showModal({
        title:'提示',
        content:'该券不满足满减条件',
        showCancel:false,
        success:function(res){}
      })
    }
    else {
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2];//上一页面
      prevPage.setData({//直接给上移页面赋值
        couponId:couponId,
        showModal:false,
        couponType:1,
        couponPrice:couponPrice,
        showPayPrice:payPrice,
        choseCoupon:true
      })
      wx.navigateBack()
    }
  },
  // 使用折扣券
  useDiscountCoupon:function(e){
    let _this = this
    let couponId = e.currentTarget.dataset.id
    let discount = e.currentTarget.dataset.discount
    let usePrice = parseFloat(e.currentTarget.dataset.useprice)
    let totalPrice = _this.data.totalPrice/100
    let couponPrice = (totalPrice - totalPrice*discount/10)
    let payPrice = _this.data.payPrice - couponPrice*100
    if (totalPrice < usePrice) {
      wx.showModal({
        title:'提示',
        content:'该券不满足满减条件',
        showCancel:false,
        success:function(res){}
      })
    }
    else {
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2];//上一页面
      prevPage.setData({//直接给上移页面赋值
        couponId:couponId,
        showModal:false,
        couponType:2,
        couponPrice:couponPrice,
        showPayPrice:payPrice,
        couponDiscount:discount,
        choseCoupon:true
      })
      wx.navigateBack()
    }
  },
  // 不使用优惠券
  useNoCoupon:function(e){
    let _this = this
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({//直接给上移页面赋值
      couponId:'',
      showModal:false,
      choseCoupon:false,
      showPayPrice:_this.data.payPrice
    })
    wx.navigateBack()
  },
})
