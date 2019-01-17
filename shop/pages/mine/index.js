//index.js
//获取应用实例
const app = getApp()
import formatTime from '../../utils/util.js'

Page({
  data: {
    nickname: '',
    avatar: '',
    isSupper:true
  },
  onLoad: function () {
    this.setData({
      isIpx:app.globalData.isIpx
    })
  },
  onShow:function(){
    this.getUserInfo()
  },
  // 获取用户信息
  getUserInfo: function(e) {
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return false;
    }
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
        console.log(res);
        if (code == 1) {
          let userId = res.data.userInfo.userId
          let nickname = res.data.userInfo.nickname
          let avatar = res.data.userInfo.avatar
          let superstatus = res.data.userInfo.superstatus // 获取用户会员情况（1是会员，2是非会员）
          let countBeginTime = new Date(res.data.userInfo.superstarttime*1000)
          let countEndTime = new Date(res.data.userInfo.superendtime*1000)
          let beginTime = formatTime.formatDate(countBeginTime)  // 会员开始时间
          let endTime = formatTime.formatDate(countEndTime)  // 会员开始时间
          console.log(superstatus);
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
          wx.setStorageSync('isLogin', false)
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
    wx.navigateTo({
      url: '/pages/my-order/index?',
    })
  },
  //点击查看待付款订单进行跳转
  hrefToWaitPay:function(){
    wx.navigateTo({
      url: '/pages/my-order/index?status=0',
    })
  },
  //点击查看待发货订单进行跳转
  hrefToWaitSend:function(){
    wx.navigateTo({
      url: '/pages/my-order/index?status=1',
    })
  },
  //点击查看待收货订单进行跳转
  hrefToWaitAccept:function(){
    wx.navigateTo({
      url: '/pages/my-order/index?status=2',
    })
  },
  //点击查看待评价订单进行跳转
  hrefToWaitCommit:function(){
    wx.navigateTo({
      url: '/pages/my-order/index?status=3',
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
      url: '/pages/sort/index'
    })
  },
  //跳转到购物车
  hrefToCart: function(){
    wx.redirectTo({
      url: '/pages/shop-cart/index'
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
})
