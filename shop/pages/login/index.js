//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    time:'获取验证码',
    currentTime:61,
    mobile:' ',
    verify:' ',
    hrefUrl:' '
  },
  onShow: function () {

  },
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    let drpCode = wx.getStorageSync('drpCode')
    wx.setStorageSync('isLogin', false)
    wx.setStorageSync('userInfo', ' ')
    wx.setStorageSync('sessionId', ' ')
    wx.setStorageSync('token', ' ')
    let RecordQR = app.globalData.RecordQR || 0 //小程序识别码 无传0
    let qroid = wx.getStorageSync('sceceQroid') //公众号二维码标识id 无传0
    console.log(qroid)
    let qroidCode = 0
    if(qroid !=0 ){
      qroidCode = qroid
    }
    let hrefUrl = options.url
    _this.setData({
      hrefUrl:hrefUrl,
      drpCode:drpCode,
      RecordQR:RecordQR,
      qroid:qroidCode
    })
    this.askForAuthorize()
  },
  // 获取用户是否授权,未授权显示授权弹窗
  askForAuthorize: function(){
    let _this = this
    wx.getSetting({
      success: res =>{
        let allow = res.authSetting['scope.userInfo']
        if (allow) {
          _this.setData({
            showModal:false,
            modal1:false
          })
          _this.getUserInfo()
        }
        else {
          _this.setData({
            showModal:true,
            modal1:true
          })
        }
      }
    })
  },
  // 获取用户头像昵称
  getUserInfo: function(){
    let _this = this
    wx.login({
      success: res => {
        let code = res.code
        _this.data.code = code
        wx.getUserInfo({
          success:res =>{
            let nickname = res.userInfo.nickName
            let avatar = res.userInfo.avatarUrl
            _this.setData({
              nickname:nickname,
              avatar:avatar
            })
          },
          fail:res =>{
          }
        })
      }
    })
  },
  // 授权按钮
  bindGetUserInfo: function(res) {
    let _this = this
    if(res.detail.userInfo) {
      _this.setData({
        showModal:false,
        modal1:false
      })
      _this.getUserInfo()
    }
    else {

    }
  },
  // 关闭授权弹窗
  hideModal1: function(e){
    let _this = this
    _this.setData({
      showModal:false,
      modal1:false
    })
  },
  // 手机号码输入绑定
  mobileInput: function(e){
    let _this = this
    _this.data.mobile = e.detail.value
  },
  // 验证码输入绑定
  verifyInput: function(e){
    let _this = this
    _this.data.verify = e.detail.value
  },
  // 获取验证码
  getVerificationCode: function(){
    let _this = this
    let myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/
    let mobile = _this.data.mobile
    if (mobile == '') {
        wx.showModal({
          title: '提示',
          content: '手机号码不能为空',
          showCancel:false,
          success: function(res) {
          }
        })
      }
    else if (!myreg.test(mobile)) {
      wx.showModal({
        title: '提示',
        content: '手机号格式有误',
        showCancel:false,
        success: function(res) {
        }
      })
    }
    else {
      wx.showLoading({
        mask:true,
        title: '验证码已发送...'
      })
      // setTimeout(function(){
      //   wx.hideLoading()
      //   _this.getCode();
      //   _this.setData({
      //     disabled:true,
      //     buttonClass:'disButton'
      //   })
      // },1000)
        wx.request({
          url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=SendLoginVerifyCode',
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          method: 'POST',
          data: JSON.stringify({
            baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
            mobile: mobile
          }),
          success: function(res) {
            wx.hideLoading()
            if (res.statusCode === 200) {
              _this.getCode();
              wx.setStorageSync('countDown', true)
              _this.setData({
                disabled:true,
                buttonClass:'disButton'
              })
            }
            else {
              wx.showModal({
          			title: '提示',
          			content: res.data.baseServerInfo.msg,
                showCancel:false,
          			success: function(res) {
          				if (res.confirm) {
          				} else if (res.cancel) {
          				}
          			}
          		})
            }
          },
          fail:function(res){
          }
        })
    }
  },
  // 验证码倒计时
  getCode: function(){
    let _this = this;
      let currentTime = _this.data.currentTime
      let interval = setInterval(function () {
        currentTime--;
        _this.setData({
          time: currentTime+'秒'
        })
        if (currentTime <= 0) {
          clearInterval(interval)
          _this.setData({
            time: '重新发送',
            currentTime:61,
            disabled: false,
            buttonClass:'Button'
          })
        }
      }, 1000)
  },
  // 登录注册
  login: function(){
    let _this = this
    // let RecordQR = wx.getStorageInfoSync('RecordQR')
    // console.log(RecordQR,'本地存储')
    // return
    let myreg = /^(((13[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1})|(19[0-9]{1}))+\d{8})$/
    let mobile = _this.data.mobile
    if (mobile == '') {
        wx.showModal({
          title: '提示',
          content: '手机号码不能为空',
          showCancel:false,
          success: function(res) {
          }
        })
    }
    else if (!myreg.test(mobile)) {
      wx.showModal({
        title: '提示',
        content: '手机号格式有误',
        showCancel:false,
        success: function(res) {
        }
      })
    }
    else if (_this.data.verify == '')  {
        wx.showModal({
          title:'提示',
          content:'验证码不能为空',
          showCancel:false,
          success:function(res){}
        })
    }
    else {
      wx.showLoading({
          mask:true,
          title: '登录中...'
      })
      wx.login({
        success: res => {
          let code = res.code
          let askType = wx.getStorageSync('askType')
          let askParam = wx.getStorageSync('askParam')
          _this.data.code = code
          wx.getUserInfo({
            success:res => {
              let nickname = res.userInfo.nickName
              let avatar = res.userInfo.avatarUrl
              let encryptedData = res.encryptedData
              let iv = res.iv
              wx.request({
                url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=Login',
                method: 'post',
                data: JSON.stringify({
                  baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
                  mobile:_this.data.mobile,
                  verifyCode:_this.data.verify,
                  code:code,
                  nickname:nickname,
                  avatarUrl:avatar,
                  encryptedData:encryptedData,
                  iv:iv,
                  drpCode:_this.data.drpCode,
                  qrid:_this.data.RecordQR,
                  qroid:_this.data.qroid,
                  askType:askType,
                  askParam:askParam
                }),
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: (res) => {
                  wx.setStorageSync('sceceQroid',0) //清除公众号小卡片分享码
                  wx.hideLoading()
                  let code = res.data.baseServerInfo.code
                  let msg = res.data.baseServerInfo.msg
                  if (code == 1) {
                    wx.setStorageSync('isLogin', true)
                    wx.setStorageSync('userInfo', res.data.userInfo)
                    wx.setStorageSync('sessionId', res.data.sessionId)
                    wx.setStorageSync('token', res.data.token)
                    let newUser = res.data.newUser // 判断该用户是登录还是注册（防止老用户微信机制掉本地login记录）
                    if (_this.data.hrefUrl == 'newuser') {
                      wx.redirectTo({
                        url: '/pages/new-personal/index'
                      })
                    }
                    else if (_this.data.hrefUrl == 'newUserByRedPacket' & newUser) {
                      if (askType == 2) {
                        let pages = getCurrentPages()
                        let prevPage = pages[pages.length - 2];//上一页面
                        prevPage.setData({//直接给上移页面赋值
                          showToast:true,
                          showSuccess:true,
                          showMask:true
                        })
                        wx.navigateBack()
                      }
                      else if (askType == 1) {
                        _this.setNewAward(askParam)
                      }
                    }
                    else {
                      wx.navigateBack()
                    }
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
                  wx.setStorageSync('sceceQroid','')
                }
              })
              // wx.hideLoading()
              // console.log(encryptedData);
            },
            fail:res => {
            }
          })
        }
      })
    }
  },
  // 跳转回首页
  hrefToIndex: function(){
    wx.reLaunch({
      url: '/pages/index/index'
    })
  },
  // 获取新人用户领取到的红包
  setNewAward: function(askParam) {
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=RedPacket&method=GetUserDrawLog',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id:askParam
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let score = res.data.score // 获取单个用户的购物金
          let pages = getCurrentPages()
          let prevPage = pages[pages.length - 2];//上一页面
          prevPage.setData({//直接给上移页面赋值
            showToast:true,
            showSuccess:true,
            showMask:true,
            showNewUserAward:score
          })
          wx.navigateBack()
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
})
