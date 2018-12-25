//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    time:'获取验证码',
    currentTime:61,
    mobile:'',
    verify:''
  },
  onShow: function () {

  },
  onLoad: function () {
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
  // 跳转回首页
  hrefToIndex: function(){
    wx.switchTab({
      url: '/pages/index/index'
    })
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
      setTimeout(function(){
        wx.hideLoading()
        _this.getCode();
        _this.setData({
          disabled:true,
          buttonClass:'disButton'
        })
      },1000)
        // wx.request({
        //   url: 'https://'+_this.$parent.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=User&method=MobileLoginSendVerification',
        //   header: {
        //     'Content-Type': 'application/x-www-form-urlencoded'
        //   },
        //   method: 'POST',
        //   data: JSON.stringify({
        //     baseClientInfo: {
        //       longitude: 0,
        //       latitude: 0
        //     },
        //     mobile: mobile
        //   }),
        //   success: function(res) {
        //     wx.hideLoading()
        //     if (res.statusCode === 200) {
        //       _this.getCode();
        //       wx.setStorageSync('countDown', true)
        //       _this.setData({
        //         disabled:true,
        //         buttonClass:'disButton'
        //       })
        //     }
        //     else {
        //       wx.showModal({
        //   			title: '提示',
        //   			content: res.data.baseServerInfo.msg,
        //         showCancel:false,
        //   			success: function(res) {
        //   				if (res.confirm) {
        //   				} else if (res.cancel) {
        //   				}
        //   			}
        //   		})
        //     }
        //   },
        //   fail:function(res){
        //   }
        // })
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
          _this.data.code = code
          wx.getUserInfo({
            success:res => {
              let nickname = res.userInfo.nickName
              let avatar = res.userInfo.avatarUrl
              let encryptedData = res.encryptedData
              let iv = res.iv
              console.log(nickname,avatar,encryptedData,iv);
              wx.request({
                url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=Login',
                method: 'post',
                data: JSON.stringify({
                  baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
                  mobile:_this.data.mobile,
                  verifyCode:'',
                  code:code,
                  nickname:nickname,
                  avatarUrl:avatar,
                  encryptedData:encryptedData,
                  iv:iv
                }),
                header: {
                  'Content-Type': 'application/x-www-form-urlencoded'
                },
                success: (res) => {
                  wx.hideLoading()
                  if (res.statusCode == 200) {
                    let code = res.data.baseServerInfo.code
                    let msg = res.data.baseServerInfo.msg
                    console.log(res.data);
                    if (code == 1) {
                      wx.setStorageSync('isLogin', true)
                      wx.setStorageSync('userInfo', res.data.userInfo)
                      wx.setStorageSync('sessionId', res.data.sessionId)
                      wx.navigateBack()
                    }
                    else{
                      console.log(msg);
                    }
                  }
                  else {
                    console.log(res.statusCode);
                  }
                },
                fail: (res) => {
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
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
})
