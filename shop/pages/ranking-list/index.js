const app = getApp()

Page({
  data: {
    monthTop:0
  },
  onLoad: function () {
    app.userView('RecordExposurenum') //统计平台曝光度记录
  },
  onShow:function(){
    let _this = this
    let year = wx.getStorageSync('year')
    let month = wx.getStorageSync('month')
    let day = wx.getStorageSync('day')
    if (month == 1 & day == 1) {
      let showYear = year - 1
      let showMonth = month - 1
      _this.setData({
        showYear:showYear,
        showMonth:showMonth
      })
    }
    else if (month != 1 & day == 1) {
      let showMonth = month - 1
      _this.setData({
        showYear:year,
        showMonth:showMonth
      })
    }
    else {
      _this.setData({
        showYear:year,
        showMonth:month
      })
    }
     _this.getUserInfo()
    _this.getTopList()
    _this.getCreditStrategy()
  },
  // 获取用户信息
  getUserInfo: function() {
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
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      method: 'POST',
      data: JSON.stringify({
        baseClientInfo: {
          longitude: 0,
          latitude: 0,
          appId: ''+app.globalData.appId+''
        }
      }),
      success: function(res) {
        wx.hideLoading()
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let userInfo = res.data.userInfo // 获取用户信息
          let nickname = userInfo.nickname // 获取用户昵称
          let avatar = userInfo.avatar // 获取用户头像
          // let monthTop    = userInfo.monthTop  // 获取用户月排名
          _this.setData({
            nickname:nickname,
            avatar:avatar,
          })
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
  // 跳转到推广页面
  hrefToSpread: function() {
    wx.switchTab({
      url: '/pages/spread/index'
    })
  },
  // 获取排行榜列表
  getTopList: function() {
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
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Credit&method=GetCreditRank',
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      method: 'POST',
      data: JSON.stringify({
        baseClientInfo: {
          longitude: 0,
          latitude: 0,
          appId: ''+app.globalData.appId+''
        },
      }),
      success: function(res) {
        wx.hideLoading()
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let topList = res.data.rankList // 获取排行榜列表
          let myRank = res.data.myRank
          for(let i in topList){
            let url = topList[i].avatar
            let img = url.substr(0,4)
            if(img != 'http'){
              topList[i].avatar = app.globalData.imageUrl + url
            }
          } 
          _this.setData({
            topList:topList,
            myRank:myRank
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
  //获取活动规则
  getCreditStrategy(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      type:1
    })
    _this.setHttpRequst('Credit','GetCreditStrategy',data,function(res){
      let introductioncontent = res.data.content
      _this.setData({
        introductioncontent:introductioncontent
      })
    },function(){})
  },
      //发送http请求
  setHttpRequst(Class,Method,Data,Succ,Fail,resFail){
    let _this = this
    let cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    wx.request({
      url: `https://${app.globalData.productUrl}/api?resprotocol=json&reqprotocol=json&class=${Class}&method=${Method}`,
      method: 'post',
      data: Data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        console.log(res.code)
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
        resFail(res)
      }
    })
  },
  //打开攻略弹窗
  showToast(){
    this.setData({
      modal1:true,
      showMask:true
    })
  },
  //关闭攻略弹窗
  hideModal(){
    this.setData({
      modal1:false,
      showMask:false
    })
  }
})
