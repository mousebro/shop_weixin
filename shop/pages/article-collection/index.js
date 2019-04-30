const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imgWidth:0,imgHeight:0,
    nowPge:1,//文章列表的加载页码
  },
  onLoad(options){
    let scene = decodeURIComponent(options.scene)
    app.userView('RecordExposurenum') //统计平台曝光度记录
  },
  onShow(){
    this.getGoodsList()
    this.getArticleList()
  },
  //获取文章列表
  getArticleList:function(){
    let _this = this
    let nowCategorayId = _this.data.nowCategorayId
    let nowPage = _this.data.nowPage || 1
    wx.showLoading({
      title:'正在加载中...',
      icon:'loading'
    })
    let data =JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      page:nowPage,
      pageLength:10
    })
    _this.setHttpRequst("Article",'GetCollectList',data,function(res){
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
        articleList:articleList
      })
     
     
    },function(res){
      wx.hideLoading()
      let code = res.data.baseServerInfo.code
      if(code==1019){
        wx.navigateTo({
          url: '/pages/login/index',
        })
      }
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
       // _this.getArticleList()
       _this.getGoodsList()
      })
    }else{
      wx.showModal({
        content:'没有更多内容了~',
        showCancel:false,
      })
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
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
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
  //获取收藏商品列表
  getGoodsList(){
    let _this = this
    let nowPage = _this.data.nowPage || 1
    let data =JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      page:nowPage,
      pageLength:10,
      goodsType:1
    })
    _this.setHttpRequst('Collect','GetGoodsList',data,function(res){
     let productList = res.data.goodsList
     console.log(productList)
     
     for(let i in productList){
       if(productList[i].thumb.substr(0,4) != 'http'){
         productList[i].thumb = app.globalData.imageUrl + productList[i].thumb 
       }
      let marketprice = productList[i].marketprice
      productList[i].marckPArr = marketprice.split('.')  
     }
     _this.setData({
      productList:productList,
      pageCount:res.data.pageCount
     })
    },function(){})
  },
  //点击头部tabbar转换
  changeTabBarA(){
    let _this = this
    this.setData({
      getTabBar:true,
      currentPage:1
    },function(){
      
    })
  },
  changeTabBarB(){
    let _this = this
    this.setData({
      getTabBar:false,
      currentPage:1
    },function(){
      
    })
  },
  //点击收藏的商品跳转到商品详情页
  hreftoShopDetail(e){
    let id = e.currentTarget.dataset.idx
    console.log(e)
    wx.navigateTo({
      url: '/pages/shop-detail/index?Id=' + id,
    })
  }
})