// pages/shopping-gold/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    leadDays:[{count:10,isLead:1},{count:20,isLead:1},{count:30,isLead:1},{count:40,isLead:0},{count:50,isLead:0},{count:100,isLead:0}],
    modal2:false,
    showCard1:'block',//初始卡片正面显示
    showCardBack1:'none',//初始卡片背面隐藏
    showCard2:'block',//初始卡片正面显示
    showCardBack2:'none',//初始卡片背面隐藏
    showCard3:'block',//初始卡片正面显示
    showCardBack3:'none',//初始卡片背面隐藏
    cardBlock1:'180deg',
    cardBlock2:'180deg',
    cardBlock3:'180deg',
  },

  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    this.setData({
      isIpx:app.globalData.isIpx
    })
    let isLogin = wx.getStorageSync('isLogin')

    _this.getUserInfo()//获取用户信息
    _this.getAskUserRule() //获取邀请新用户可得积分数
  },
  onShow(){
    let _this = this
    _this.getUserInfo(1,1)//获取用户信息
    this.getCreditStrategy()//获取活动规则
    this.getAwardRecord()
    this.getAwardUser()
    //判断是否已经经过分享
    let startShare = this.data.startShare
    if(startShare == 2){
      _this.recordShareLog(2)
    }
    _this.setData({
      startShare:0
    })
  },
  hrefToMine: function(){
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.redirectTo({
        url: '/pages/login/index'
      })
    }
    else {
      wx.redirectTo({
        url: '/pages/mine/index'
      })
    }
  },
  hrefToSort(){
    wx.redirectTo({
      url: '/pages/shop-list/index'
    })
  },
//跳转到首页
hrefToIndex: function(){
  wx.redirectTo({
    url: '/pages/index/index'
  })
},
//跳转到首页
hrefToNewIndex: function(){
  wx.redirectTo({
    url: '/pages/new-index/index'
  })
},
//跳转到排行榜
hrefToRankList(){
  wx.navigateTo({url: '/pages/ranking-list/index'})
},
// 翻转动画
cardturn: function (e) {
  let id = e.currentTarget.dataset.id;
  let _this = this;
  if(id == '1'){
    setTimeout(function () {
      _this.setData({showCard1: 'none'});
    }, 800);
    setTimeout(function () {
      _this.setData({showCardBack1: 'block'});
    }, 1000);
    setTimeout(function () {
      _this.signCredit()
      _this.setData({
        modal2:false,
      })
    }, 1500);
    _this.setData({
      cardBlock1: '0deg',
      tcard2:'none',
      tcard3:'none'
    })
  }
  else if(id == '2'){
    setTimeout(function () {
      _this.setData({showCard2: 'none'});
    }, 800);
    setTimeout(function () {
      _this.setData({showCardBack2: 'block'});
    }, 1000);
    setTimeout(function () {
      _this.signCredit()
      _this.setData({
        modal2:false,
      })
    }, 1500);
    _this.setData({
      cardBlock2: '0deg',
      tcard1:'none',
      tcard3:'none'
    })
  }
  else if(id == '3'){
    setTimeout(function () {
      _this.setData({showCard3: 'none'});
    }, 800);
    setTimeout(function () {
      _this.setData({showCardBack3: 'block'});
    }, 1000);
    setTimeout(function () {
      _this.signCredit()
      _this.setData({
        modal2:false,
      })
    }, 1500);
    _this.setData({
      cardBlock3: '0deg',
      tcard1:'none',
      tcard2:'none'
    })
  }
  _this.setData({
    isTurnCard:true
  })
},
  //显示活动规则
  showSignInRule(){
    this.setData({
      modal1:true,
      showMask:true
    })
  },
  //隐藏活动规则弹窗
  hideModal(){
    this.setData({
      modal1:false,
      showMask:false,
      showToast:false,
      modal2:false
    })
  },
  //展示翻牌弹窗
  showSuprise(){
    this.setData({
      showMask:true,
      modal2:true
    })
  },
  //获取每日签到信息
  getSignRule:function(gotoSign){ //gotoSign-》判断是否进行签到方式
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst(1,'Credit','GetSignRule',data,function(res){
      let signRuleList = res.data.data
      for(let i in signRuleList){
        let dayShowRecord  = (signRuleList[i].getgold).split(",") //如当天有惊喜，只显示首个积分奖励项
        signRuleList[i].getgold = dayShowRecord[0]
      }
      _this.setData({
        signRuleList:signRuleList
      },function(){
        let isendday = res.data.isendday //判断今天是否有惊喜弹窗
        let isalreadysign  = res.data.isalreadysign  //判断今天是否已经签到 
        _this.setData({
          isendday:isendday,
          isalreadysign:isalreadysign
        })
        if(isalreadysign !=1  && isendday == 1){
          _this.showSuprise()
        }else if(isalreadysign != 2 && isendday != 1){
          _this.signCredit() //获取签到列表成功后主动进行签到行为
        }
      })
    })
  },
  //签到
  signCredit(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst(1,'Credit','SignCredit',data,function(res){
      _this.setData({
        showMask:true,
        signcredit:res.data.signcredit,
        showToast:true,
        signInSuccess:true
      })
      _this.getSignRule(0)
      _this.getUserInfo(0)
    },function(res){
      _this.setData({
        showMask:false,
        showToast:true,
        signInSuccess:false,
        failMsg:res.data.baseServerInfo.msg
      })
    })
  },
  //获取活动规则
  getCreditStrategy(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      type:2
    })
    _this.setHttpRequst(0,'Credit','GetCreditStrategy',data,function(res){
      let introductioncontent = res.data.content
      _this.setData({
        introductioncontent:introductioncontent
      })
    },function(){})
  },
  //获取用户信息
  getUserInfo(gotoSign=1,loginTimes=0){ //loginTimes用于判断是否需要进行登录页跳转，1为需要
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin && loginTimes==1) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }else{
      let _this = this
      let data = JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      })
      _this.setHttpRequst(1,"MiniAppUser",'GetInfo',data,function(res){
        let superstatus = res.data.userInfo.superstatus
        let issign = res.data.userInfo.issign
        let credit1 = res.data.userInfo.credit1
        let nickname = res.data.userInfo.nickname
        let userId = res.data.userInfo.userId
        _this.setData({
          superstatus:superstatus,
          issign:issign,
          credit1:credit1,
          nickname:nickname,
          userId:userId
        },function(){
          if(gotoSign){
            _this.getSignRule(1)//获取签到规则
          }
        })
      })
    }
    
  },
  // 获取红包获奖列表
  getAwardUser(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      page:1,
      pageLength:10
    })
    _this.setHttpRequst(0,'Credit','GetCreditBannerList',data,function(res){
      let showAwardList = res.data.userList // 获取红包参数
      for(let i in showAwardList){
        let url = showAwardList[i].avatar
        let img = url.substr(0,4)
        if(img != 'http'){
          showAwardList[i].avatar = app.globalData.imageUrl + url
        }
        let nickname = showAwardList[i].nickname
        showAwardList[i].newNickname = nickname.substr(0,1) + "***" + nickname.substr(-1,1)
      }
      _this.setData({
        showAwardList:showAwardList
      })
    },function(){})
  },
  //隐藏红包任务成功弹窗
  hideRecord(){
    this.setData({
      showRecord:false
    })
  },
  //获取发红包得到购物金信息
  getAwardRecord(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst(1,'Credit','AskUserAlert',data,function(res){
      let awardRecord = res.data.totalCredit
      _this.setData({
        awardRecord:awardRecord,
        showRecord:true
      })
    },function(){})
  },
  //邀请新用户注册规则
  getAskUserRule(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst(1,'RedPacket','GetAskuserRule',data,function(res){
      let newUserAward  = res.data.award 
      _this.setData({
        newUserAward:newUserAward ,
      })
    },function(){})
  },
  //发送http请求
  setHttpRequst(needCookie,Class,Method,Data,Succ,Fail,resFail,logintimes=0){
    let _this = this
    let cookie = ''
    if(needCookie){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
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
          if (code == 1) {
            Succ(res)
          }else if (code == 1019) {
            
          }
          else {
            // Fail(res)
          }
      },
      fail: (res) => {
        resFail(res)
      }
    })
  },
  hrefToRedEnvelope(){
    wx.navigateTo({
      url: '/pages/red-envelope/index',
    })
  },
  onHide(){
    let _this = this
    this.setData({
      startShare:_this.data.startShare + 1
    })
  },
  onShareAppMessage(res){
    let nickname = this.data.nickname
    let _this = this
    _this.setData({
      startShare:1
    })
    return{
      title:nickname + '@你！新人快来领红包啦！',
      imageUrl:'https://allnet-shop-cdn.91uda.com/images/1/2019/03/jRNrm2fzZm2wwHU4liZg4ziWZGumGG.jpg',
      path:'/pages/red-envelope-receive/index?askType=2&askParam='+this.data.userId+'',
    }
  },
  //统计分享数据
  recordShareLog(shareType){
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      shareType:shareType
    })
    this.setHttpRequst(1,'Share','AddShareLog',data,function(){

    },function(){})
  },
  //跳转到购物金详情
  hrefToIntegralDetail(){
    wx.navigateTo({
      url: '/pages/integral-detail/index',
    })
  }
})
