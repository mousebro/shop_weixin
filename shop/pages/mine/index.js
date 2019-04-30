//index.js
//获取应用实例
const app = getApp()
import formatTime from '../../utils/util.js'

Page({
  data: {
    nickname: '',
    avatar: '',
    isSupper:true,
    allstatus:1, //判断所有红点是否都显示，根据此进行样式改变
    actionSheetHidden:true
  },
  onLoad: function () {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    this.setData({
      isIpx:app.globalData.isIpx
    })
  },
  onShow:function(){
    this.getUserInfo()
    this.GetRedPointOfUser()
  },
  // 获取用户信息
  getUserInfo: function(e) {
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    // if (!isLogin) {
    //   wx.navigateTo({
    //     url: '/pages/login/index'
    //   })
    //   return false;
    // }
    wx.showLoading({
      mask:true,
      title: '获取用户信息中...'
    })
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=GetInfo',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let userId = res.data.userInfo.userId
          let nickname = res.data.userInfo.nickname
          let avatar = res.data.userInfo.avatar
          let superstatus = res.data.userInfo.superstatus // 获取用户会员情况（1是会员，2是非会员）
          let countBeginTime = new Date(res.data.userInfo.superstarttime*1000)
          let countEndTime = new Date(res.data.userInfo.superendtime*1000)
          let beginTime = formatTime.formatDate(countBeginTime)  // 会员开始时间
          let endTime = formatTime.formatDate(countEndTime)  // 会员开始时间
          _this.setData({
            nickname:nickname,
            avatar:avatar,
            superstatus:superstatus,
            beginTime:beginTime,
            endTime:endTime
          })
          wx.hideLoading()
        }
        else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
          // wx.setStorageSync('isLogin', false)
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
  },
  //点击查看全部进行跳转
  readMore:function(){
    this.UpdateRedPoint(-1,function(){
      wx.navigateTo({
        url: '/pages/my-order/index?'
      })
    })
  },
  //点击查看待付款订单进行跳转
  hrefToWaitPay:function(e){
    let _this = this
    let type = e.currentTarget.dataset.type
    _this.UpdateRedPoint(type,function(){
      wx.navigateTo({
        url: '/pages/my-order/index?status=0',
      })
    })
  },
  //点击查看待发货订单进行跳转
  hrefToWaitSend:function(e){
    let _this = this
    let type = e.currentTarget.dataset.type
    _this.UpdateRedPoint(type,function(){
      wx.navigateTo({
        url: '/pages/my-order/index?status=1',
      })
    })

  },
  //点击查看待收货订单进行跳转
  hrefToWaitAccept:function(e){
    let _this = this
    let type = e.currentTarget.dataset.type
    _this.UpdateRedPoint(type,function(){
      wx.navigateTo({
        url: '/pages/my-order/index?status=2',
      })
    })
  },
  //点击查看待评价订单进行跳转
  hrefToWaitCommit:function(e){
    let _this = this
    let type = e.currentTarget.dataset.type
    _this.UpdateRedPoint(type,function(){
      wx.navigateTo({
        url: '/pages/my-order/index?status=3',
      })
    })
  },
  //点击查看待评价订单进行跳转
  hrefToShare:function(e){
    let _this = this
    let type = e.currentTarget.dataset.type
    _this.UpdateRedPoint(type,function(){
      wx.navigateTo({
        url: '/pages/my-order/index?status=4',
      })
    })
  },
  // 跳转到我的优惠券
  hrefToDiscount:function(){
    wx.navigateTo({
      url: '/pages/discount/index',
    })
  },
  //跳转地址管理
  hrefToAddress:function(){
    wx.navigateTo({
      url: '/pages/address/index',
    })
  },
  //跳转到分类
  hrefToSort: function(){
    wx.redirectTo({
      url: '/pages/shop-list/index'
    })
  },
  //跳转到购物金
  hrefToGold(){
    wx.redirectTo({
      url: '/pages/shopping-gold/index'
    })
  },
  //跳转到首页
  hrefToIndex: function(){
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },
  // 跳转到购买会员页
  hrefToSupermember:function(){
    wx.navigateTo({
      url: '/pages/supermember-buy/index',
    })
  },
  //跳转到签到中心
  hrefToSignIn(){
    wx.navigateTo({
      url: '/pages/sign-in-center/index',
    })
  },
  //跳转到领劵中心
  hreftoReceive(){
    wx.navigateTo({
      url: '/pages/receive-coupon-center/index',
    })
  },
  //获取用户红点信息
  GetRedPointOfUser:function(e) {
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      // wx.navigateTo({
      //   url: '/pages/login/index'
      // })
      return false;
    }
    wx.showLoading({
      mask:true,
      title: '获取用户信息中...'
    })
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=RedPoint&method=GetRedPointOfUser',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          console.log(res,'红点')
          let redpointArr = res.data.redpoint
          let allstatus = 1
          for(let i in redpointArr){
            allstatus = parseInt(redpointArr[i].show) && allstatus
          }
          _this.setData({
            allstatus:allstatus,
            redpoint:res.data.redpoint
          })
          wx.hideLoading()
        }
        else if (code == 1019) {
          // wx.navigateTo({
          //   url: '/pages/login/index'
          // })
          // wx.setStorageSync('isLogin', false)
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
  },
  //更改用户红点信息
  UpdateRedPoint:function(type,Succ) {
    console.log('type',type)
    let _this = this
    // let isLogin = wx.getStorageSync('isLogin')
    // if (!isLogin) {
    //   wx.navigateTo({
    //     url: '/pages/login/index'
    //   })
    //   return false;
    // }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=RedPoint&method=UpdateRedPoint',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        type:type,
        show:0
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          console.log(res)
          Succ()
        }
        else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
          // wx.setStorageSync('isLogin', false)
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
  },
  //跳转到会员专属商品
  hreftoSupermember(){
    wx.navigateTo({
      url: '/pages/supermember-exclusive/index',

    })
  },
  //跳转到我的收藏页
  hrefToCollection(){
    wx.navigateTo({
      url: '/pages/article-collection/index',
    })
  },
  //跳转到新首页
  hrefToNewIndex: function(){
    wx.redirectTo({
      url: '/pages/new-index/index'
    })
  },
  //唤起底部客服弹窗
  listenerButton: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: false
    })
  },
  //拨打客服热线
  call: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
    wx.makePhoneCall({
      phoneNumber: ''+app.globalData.customerMobile+'' // 仅为示例，并非真实的电话号码
    })
  },
  //跳转到礼品兑换页
  hrefToPresident(){
    wx.navigateTo({
      url: '/pages/present-card/index',
    })
  },
  //取消底部弹窗
  close: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
  },
  hrefToAdvice(){
    wx.navigateTo({
      url: '/pages/advice/index',
    })
  }
})
