const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgWidth:0,imgHeight:0,
    choseTap:0,
    nowPage:1,//文章列表的加载页码
    articleList:[]
  },
  onshow(options){

  },
  onLoad(options){
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let scene = decodeURIComponent(options.scene)
    this.setData({
      isIpx:app.globalData.isIpx
    })
    this.getIndexSet()
    this.getCategoryList()
    this.getShareInfo()
  },
  changeTap(e){ //头部导航栏点击事件
    let _this = this
    let choseTap = e.currentTarget.dataset.idx
    console.log(choseTap)
    let nowCategorayId = e.currentTarget.dataset.id
    this.setData({
      choseTap:choseTap,
      nowCategorayId:nowCategorayId,
      nowPge:1,
      articleList:[]
    },function(){
      _this.getArticleList()
    })
  },
  //跳转到首页
  hrefIndex: function(){
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },
  //跳转到购物金
  hrefToGold: function(){
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    else {
      wx.redirectTo({
        url: '/pages/shopping-gold/index'
      })
    }
  },
  //跳转到个人中心
  hrefToMine: function(){
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    else {
      wx.redirectTo({
        url: '/pages/mine/index'
      })
    }
  },
  // 获取首页相关配置
  getIndexSet: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=HomePage&method=GetHomeSet',
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
            let homeSet = res.data.homeSet
            for (var i = 0; i < homeSet.length; i++) {
              let key = homeSet[i].keyword
              let visible = homeSet[i].visible
              if (key == 'adv') {
                _this.setData({
                  showAdv:visible
                })
              }
              else if (key == 'banner') {
                // 用于新人福利模块
                _this.setData({
                  showNewUser:visible
                })
              }
              else if (key == 'search') {
                _this.setData({
                  showSearch:visible
                })
              }
              else if (key == 'nav') {
                _this.setData({
                  showNav:visible
                })
              }
              else if (key == 'seckill') {
                _this.setData({
                  showSeckill:visible
                })
              }
              else if (key == 'goods') {
                _this.setData({
                  showGoods:visible
                })
              }
              else if (key == 'cube') {
                _this.setData({
                  showCube:visible
                })
              }
              else if (key == 'notice') {
                // 用于团购模块
                _this.setData({
                  showGroup:visible
                })
              }else if (key == 'zero'){
                //用于0元抢购模块
                _this.setData({
                  showZero:visible
                })
              }
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
        }
        else {
        }
      },
      fail: (res) => {
      }
    })
  },
  //获取文章分类
  getCategoryList:function(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst('Article','GetCategoryList',data,function(res){
      let catagoryList = res.data.categoryList
      let nowCategorayId = -1
      if(catagoryList.length>0){
        nowCategorayId = catagoryList[0].id
      }

      _this.setData({
        catagoryList:catagoryList,
        nowCategorayId:nowCategorayId//默认选取第一个文章分类id进行文章列表加载
      },function(){
        if(nowCategorayId!=-1){
          _this.getArticleList()
        }
      })
    })
  },
  //获取文章列表
  getArticleList:function(){
    let _this = this
    let nowCategorayId = _this.data.nowCategorayId
    let nowPage = _this.data.nowPage
    wx.showLoading({
      title:'正在加载中...',
      icon:'loading'
    })
    let data =JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      categoryId:nowCategorayId,
      page:nowPage,
      pageLength:10
    })
    _this.setHttpRequst("Article",'GetArticleList',data,function(res){
      wx.hideLoading()
      let pageCount  = res.data.pageCount //总页数
      let articleList  = res.data.articleList //文章列表
      for(let i in articleList){
        let url = articleList[i].firstImg
        let avatar  = articleList[i].avatar
        let img = url.slice(0,4)
        let aImg = avatar.slice(0,4)
        if(img != 'http'){
          articleList[i].firstImg = app.globalData.imageUrl + url
        }
        if(aImg != 'http'){
          articleList[i].avatar = app.globalData.imageUrl + avatar
        }
      }
      _this.setData({
        pageCount:pageCount,
        articleList: _this.data.articleList.concat(articleList)
      })
      console.log(_this.data.articleList);
    },function(){
      wx.hideLoading()
    })
  },
  // 获取小程序分享
  getShareInfo(){
    let _this = this
    let data =JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
    })
    _this.setHttpRequst("Share",'GetShareInfo',data,function(res){
      let info =res.data
      let img = info.image
      let url = img.substring(0,4)
      if (url != 'http') {
        info.image = app.globalData.imageUrl + img
      }
      _this.setData({
        shareInfo:info
      })
    },function(){
      wx.hideLoading()
    })
  },
  //跳转到文章详情页
  hrefToDetail:function(e){
    let articleId = e.currentTarget.dataset.id //文章id
    console.log(articleId)
    wx.navigateTo({
      url: '/pages/article-info/index?id=' + articleId,
    })
  },
  onReachBottom(){
    let nowPage = this.data.nowPage
    let _this = this
    if(nowPage < _this.data.pageCount){
      _this.setData({
        nowPage:nowPage + 1
      },function(){
        _this.getArticleList()
      })
    }else{
      _this.setData({
        hasnone:true
      })
      // wx.showModal({
      //   content:'没有更多内容了~',
      //   showCancel:false,
      // })
    }
  },
  //发送http请求
  setHttpRequst(Class,Method,Data,Succ,Fail){
    let _this = this
    wx.request({
      url: `https://${app.globalData.productUrl}/api?resprotocol=json&reqprotocol=json&class=${Class}&method=${Method}`,
      method: 'post',
      data: Data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          Succ(res)
        }
        else {
          Fail(res)
        }
      },
      fail: (res) => {
      }
    })
  },
  //分享
  onShareAppMessage: function(res) {
    let _this = this
    let shareInfo = _this.data.shareInfo
    return {
      title: shareInfo.title,
      path: '/pages/index/index',
      imageUrl:shareInfo.image
    }
  },
})
