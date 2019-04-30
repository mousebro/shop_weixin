//app.js
App({
  onLaunch: function (options) {
    let _this = this
    // if (options.scene != 1007 & options.scene != 1008 & options.scene != 1011 & options.scene != 1012 & options.scene != 1013 & options.scene != 1014 & options.scene != 1037 & options.scene != 1048 & options.scene != 1074) {
    //   // 跳转到新首页
    //   wx.redirectTo({
    //     url: '/pages/new-index/index'
    //   })
    // }
  
    wx.getSystemInfo({
      success: function (res) {
        _this.globalData.deviceHeight = res.screenHeight
        console.log(res.model)
        if (res.model == 'iPhone X') {
          _this.globalData.isIpx= true;
        }
      }

  
    })
    wx.request({
      url: 'https://'+_this.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Shop&method=GetBaseSet',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: _this.globalData.appId}
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
    _this.userView('RecordAllView') //统计平台访问记录
  },
  onShow:function(options){
    let _this = this
    if (options.scene == 1037) {
      let showShopId = options.referrerInfo.extraData.shopId
      wx.setStorageSync('showShopId', showShopId)
    }else if(options.scene == 1074){ //公众号小程序卡片
      let query = options.query
      let qroid = query.qroid
      let openid = query.openid || 0
      let urlQroid = options.path.split("?")
      if(urlQroid[1]){
        let queryArr = urlQroid[1].split("&")
        if(queryArr[0].slice(0,5)=='qroid'){
          qroid = queryArr[0].slice(5,)
        }
        if(queryArr[1].slice(0,6)=='openid'){
          openid = queryArr[1].slice(6,) || 0
        }
      }
      wx.setStorageSync('sceceQroid',qroid)
      wx.request({
        url: 'https://'+_this.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=AddPointnum',
        method: 'post',
        data: JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0 ,appId: _this.globalData.appId},
          openid:openid ,
          qroid:qroid
        }),
        header: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          if (res.statusCode == 200) {
            let code = res.data.baseServerInfo.code
            let msg = res.data.baseServerInfo.msg
          }
          else {
          }
        },
        fail: (res) => {
        }
      })
    }else if(options.scene == 1011 || options.scene == 1012|| options.scene == 1048 || options.scene==1013){
      let sceneRecordQR = options.query.scene
      wx.setStorageSync('sceneRecordQR', sceneRecordQR)
    }else if(options.scene == 1007 || options.scene == 1008) {
      // 用于购物金邀请新人以及邀请红包获取注册使用参数
      if (options.query.askType != '') {
        // 将参数置入本地
        wx.setStorageSync('askParam', options.query.askParam)
        wx.setStorageSync('askType', options.query.askType)
        wx.setStorageSync('userId', options.query.userId)
      }
    }
  
  },
  globalData: {
    userInfo: null,
    appId: 'wxef6bbdbd348523eb',//偶遇优选
    //appId: 'wxf6c1baa0d19c8098', //名庄名酒
    //appId: 'wx708226e5d691c69f', //烽火台测试
    productUrl: 'shopapidev.91uda.com',
    imageUrl: 'https://allnet-shop-cdn.91uda.com/',
    isIpx: false, // iphoneX适配
    customerMobile: '',
    deviceHeight:0
  },
  userView(Method){
    let _this = this
    let cookie = ''
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+_this.globalData.appId+''}
    })
    if(wx.getStorageSync('token')){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    wx.request({
      url: `https://${_this.globalData.productUrl}/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=${Method}`,
      method: 'post',
      data: Data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
      },
      fail: (res) => {
     
      }
    })
  }
})
