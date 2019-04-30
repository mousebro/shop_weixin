// pages/sign-in-center/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    discountImg:'/images/sign-in-center/discount.png',
    couponImg:'/images/sign-in-center/coupon.png',
    rulesImg:'/images/sign-in-center/rules.png',
    isSignIn:true,
    isDiscount:false,
    hasGet:false,
    // couponList:[{isDiscount:false,hasGet:true},{isDiscount:true,hasGet:false},{isDiscount:true,hasGet:true}],
    showModal:false,
    modal1:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    let discountImg = wx.getFileSystemManager().readFileSync(this.data.discountImg,'base64')
    let couponImg = wx.getFileSystemManager().readFileSync(this.data.couponImg,'base64')
    let rulesImg = wx.getFileSystemManager().readFileSync(this.data.rulesImg,'base64')
    this.setData({
      discountImg:'data:image/jpg;base64,' + discountImg,
      couponImg:'data:image/jpg;base64,' + couponImg,
      rulesImg:'data:image/jpg;base64,' + rulesImg,
    })
    _this.getUserInfo()
    _this.getCouponList()
    _this.GetIntegralSetting()
  },
  //获取用户信息
  getUserInfo(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst("MiniAppUser",'GetInfo',data,function(res){
      let superstatus = res.data.userInfo.superstatus
      let issign = res.data.userInfo.issign
      let credit1 = res.data.userInfo.credit1
      console.log(res)
      _this.setData({
        superstatus:superstatus,
        issign:issign,
        credit1:credit1
      })
    })
  },
  //签到
  signIn(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst('Integral','SignIntegral',data,function(res){
      _this.getUserInfo()
      wx.showModal({
        title:'提示',
        content:res.data.baseServerInfo.msg,
        showCancel:false,
        success:function(res){
          _this.setData({
            issign:2
          })
        }
      })
    },function(res){
      _this.getUserInfo()
      _this.isSignIn
      wx.showModal({
        title:'提示',
        content:res.data.baseServerInfo.msg,
        showCancel:false,
        success:function(res){}
      })
    })
  },
  //获取积分优惠券列表
  getCouponList(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      page:1,
      pagelength:10
    })
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Integral&method=GetCoupon',
      method: 'post',
      data: data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (res.statusCode == 200) {
          if (code == 1) {
            let couponList = res.data.couponList
          console.log('优惠券列表提示',couponList)
          for(var i in couponList){
            couponList[i].discount = couponList[i].discount.slice(0,3)
            couponList[i].enough = (couponList[i].enough.split("."))[0]
            couponList[i].deduct = (couponList[i].deduct.split("."))[0]
          }
          console.log(res.data)
            _this.setData({
              couponList:res.data.couponList,
              cLength:res.data.couponList.length
            })
                }
          else {
            
          }
        }else if(code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else {

        }
      },
      fail: (res) => {
      }
    })
    // _this.setHttpRequst('Integral','GetCoupon',data,function(res){
    
    // })
  },
  //发起Http请求
  setHttpRequst(Class,Method,Data,Succ,Fail){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      // wx.setStorageSync('isLogin', false)
      return false;
    }
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
        if (res.statusCode == 200) {
          if (code == 1) {
            Succ(res)
          }
          else {
            Fail(res)
          }
        }else if(code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else {
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
  //领取积分优惠券
  GetIntegeralCoupon(e){
    let _this = this
    let couponid = e.currentTarget.dataset.id
    wx.showModal({
      title:'提示',
      content:'是否兑换',
      success:function(res){
        console.log(res)
        if(res.confirm){
          let data = JSON.stringify({
            baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
            couponid:couponid
          })
          _this.setHttpRequst('Integral','GetIntegeralCoupon',data,function(res){
            console.log(res)
            wx.showModal({
              title:'提示',
              content:res.data.baseServerInfo.msg,
              showCancel:false,
              success:function(res){
                _this.getUserInfo()
              }
            })
          },function(res){
            console.log(res)
            wx.showModal({
              title:'提示',
              content:res.data.baseServerInfo.msg,
              showCancel:false,
              success:function(res){
                _this.getUserInfo()
              }
            })
          })
        }else{

        }
      }
    })

  },
  //跳转到super会员页
  gotoSuper(){
    wx.navigateTo({
      url: '/pages/supermember-buy/index',
    })
  },
  //获取签到规则
  GetIntegralSetting(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      type:1
    })
    _this.setHttpRequst('Credit','GetCreditStrategy',data,function(res){
    
      let introductioncontent  = res.data.content
      _this.setData({
        introductioncontent:introductioncontent
      })
    })
  },
  // 规则弹出层
  showModal(){
    let _this = this
    _this.setData({
      showModal:true,
      modal1:true
    })
  },
  hideModal(){
    let _this = this
    _this.setData({
      showModal:false,
      modal1:false
    })
  },
})
