//index.js
//获取应用实例
const app = getApp()
import formatTime from '../../utils/util.js'

Page({
  data: {
    realyearprice:'',
    yearprice:'',
    monthprice:'',
    superstatus:2
  },
  onShow: function(){
  },
  onLoad: function(){
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    _this.getMemberBase()
    _this.getUserInfo()
  },
  // 获取当前用户是否是超级会员
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
        wx.hideLoading()
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let superstatus = res.data.userInfo.superstatus // 获取用户超级会员状态（1是会员，2是非会员）
          let nickname = res.data.userInfo.nickname // 用户昵称
          let avatar = res.data.userInfo.avatar // 用户头像
          let countBeginTime = new Date(res.data.userInfo.superstarttime*1000)
          let countEndTime = new Date(res.data.userInfo.superendtime*1000)
          let beginTime = formatTime.formatDate(countBeginTime)  // 会员开始时间
          let endTime = formatTime.formatDate(countEndTime)  // 会员开始时间
          console.log(beginTime);
          _this.setData({
            superstatus:superstatus,
            nickname:nickname,
            avatar:avatar,
            beginTime:beginTime,
            endTime:endTime
          })
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
  // 获取会员相关信息
  getMemberBase: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Supermember&method=GetMemberbase',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let baseinfo  = res.data.baseinfo
            let realyearprice = baseinfo.realyearprice/100 // 获取真实会员年价
            let yearprice = baseinfo.yearprice/100 // 获取划线会员年价
            let monthprice = baseinfo.monthprice/100 // 获取真实会员月价
            _this.setData({
              realyearprice:realyearprice,
              yearprice:yearprice,
              monthprice:monthprice
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
        }
        else {
          console.log(res.statusCode);
        }
      },
      fail: (res) => {
      }
    })
  },
  // 购买超级会员
  buySupermember: function(e){
    let _this = this
    let type = e.currentTarget.dataset.type
    wx.showLoading({
      mask:true,
      title: '订单支付中...'
    })
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Supermember&method=SuperWechatPayOrder',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        type:type
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        let payInfo = res.data
        wx.hideLoading()
        if (code == 1) {
              let appId = payInfo.appId
              let timeStamp = payInfo.timeStamp
              let nonceStr  = payInfo.nonceStr
              let prepayId  = payInfo.prepayId
              let sign      = payInfo.sign
              let orderSn   = payInfo.orderSn
              wx.requestPayment({
                'timeStamp': ''+timeStamp+'',
                'nonceStr': nonceStr,
                'package': 'prepay_id='+prepayId,
                'signType': 'MD5',
                'paySign': sign,
                'success':function(res){
                  _this.paySuccess(orderSn)
                },
                'fail':function(res){
                  console.log('取消订单');
                },
                'complete':function(res){
                }
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
  },
  // 支付成功回调
  paySuccess: function(orderSn){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Supermember&method=WechatPaySuccess',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 },
        orderSn: orderSn
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: function(res) {
        wx.reLaunch({
          url: '/pages/mine/index'
        });
      },
      fail: function(res) {
      }
    })
  },
})
