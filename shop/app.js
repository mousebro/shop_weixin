//app.js
App({
  onLaunch: function () {
    var _this = this
    wx.getSystemInfo({
      success: function (res) {
        _this.globalData.deviceHeight = res.screenHeight
        if (res.model == 'iPhone X') {
          _this.globalData.isIpx= true;
        }
      }
    })
    wx.request({
      url: 'https://shopapidev.91uda.com/api?resprotocol=json&reqprotocol=json&class=Shop&method=GetBaseSet',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: 'wx708226e5d691c69f'}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let customerMobile = res.data.customerMobile // 获取客服电话
            console.log(customerMobile);
            _this.globalData.customerMobile = customerMobile
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
  globalData: {
    userInfo: null,
    appId: 'wx708226e5d691c69f',
    productUrl: 'shopapidev.91uda.com',
    imageUrl: 'https://allnet-shop-cdn.91uda.com/',
    isIpx: false, // iphoneX适配
    customerMobile: '',
    deviceHeight:0
  }
})
