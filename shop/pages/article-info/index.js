//index.js
//获取应用实例
const app = getApp()
let WxParse = require('../../wxParse/wxParse.js');

Page({
  data: {
    articleId:0,
    isLike:false,
    isCollect:false,
    showContent1:'',
    showContent2:'',
    showContent3:'',
    showContent4:'',
    showContent5:'',
    showContent6:'',
    recommendAPageNow:1,//推荐文章当前页码
    articlePictureVar:'?x-oss-process=image/resize,w_344,limit_1', //对图片进行压缩  推荐文章首图
    avatarPictureVar:'?x-oss-process=image/resize,w_80,limit_1' //对图片进行压缩 推荐文章头像
  },
  onShow: function(){
    let startShare = this.data.startShare
    
    if(startShare == 2){
      this.recordShareLog()
    }
    this.setData({
      startShare:0
    })
  },
  onLoad: function(options){
    let _this = this
    let articleId = options.id
    _this.data.articleId = articleId
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      _this.getArticleInfoNoLogin()
    }
    else {
      _this.getArticleInfo()
    }
    app.userView('RecordExposurenum') //统计平台曝光度记录
    _this.getRecommendArticleList() //获取文章推荐文章
  },
  // 未登录用户在展示界面
  getArticleInfoNoLogin: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Article&method=GetArticleInfo',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        articleId: _this.data.articleId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let isLike = res.data.isLike // 获取当前用户是否点赞
            let isCollect = res.data.isCollect // 获取当前用户是否收藏
            let info = res.data.info // 获取文章详情
            let articleType = info.articleType // 获取多媒体类型（1为图文，2为视频）
            let nickname = info.nickname // 获取发布人昵称
            let avatar = info.avatar // 获取发布人头像
            let likeCount = info.likeCount // 获取文章点赞数
            let title = info.title // 获取文章标题
            let media = info.media // 获取文章多媒体内容（视频或者轮播图）
            let firstImg = info.firstImg // 获取首图路径
            let content = info.content // 获取文章编辑内容
            let content1 = content.content1 // 获取文章第一部分（富文本）
            let content2 = content.content2 // 获取文章第一部分（卡片）
            let content3 = content.content3 // 获取文章第一部分（富文本）
            let content4 = content.content4 // 获取文章第一部分（卡片）
            let content5 = content.content5 // 获取文章第一部分（富文本）
            let content6 = content.content6 // 获取文章第一部分（卡片）
            // 处理新旧版本图片路径兼容
            for (let i = 0; i < media.length; i++) {
              let img = media[i]
              let url = img.slice(0,4)
              if (url != 'http') {
                media[i] = app.globalData.imageUrl+img
              }
            }
            if (content2 != '') {
              _this.getCouponInfo2(content2)
            }
            if (content4 != '') {
              _this.getCouponInfo4(content4)
            }
            if (content6 != '') {
              _this.getCouponInfo6(content6)
            }
            WxParse.wxParse('content1', 'html', content1, _this, 5);
            WxParse.wxParse('content3', 'html', content3, _this, 5);
            WxParse.wxParse('content5', 'html', content5, _this, 5);
            _this.setData({
              isLike:isLike,
              isCollect:isCollect,
              articleType:articleType,
              nickname:nickname,
              avatar:avatar,
              likeCount:likeCount,
              title:title,
              media:media,
              firstImg:firstImg,
              showContent1:content1,
              showContent2:content2,
              showContent3:content3,
              showContent4:content4,
              showContent5:content5,
              showContent6:content6
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
  // 登录用户展示界面
  getArticleInfo: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Article&method=GetArticleInfo',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        articleId: _this.data.articleId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let isLike = res.data.isLike // 获取当前用户是否点赞
            let isCollect = res.data.isCollect // 获取当前用户是否收藏
            let info = res.data.info // 获取文章详情
            let articleType = info.articleType // 获取多媒体类型（1为图文，2为视频）
            let nickname = info.nickname // 获取发布人昵称
            let avatar = info.avatar // 获取发布人头像
            let likeCount = info.likeCount // 获取文章点赞数
            let title = info.title // 获取文章标题
            let media = info.media // 获取文章多媒体内容（视频或者轮播图）
            let firstImg = info.firstImg // 获取首图路径
            // 处理新旧版本图片路径兼容
            for (let i = 0; i < media.length; i++) {
              let img = media[i]
              let url = img.slice(0,4)
              if (url != 'http') {
                media[i] = app.globalData.imageUrl+img
              }
            }
            let content = info.content // 获取文章编辑内容
            let content1 = content.content1 // 获取文章第一部分（富文本）
            let content2 = content.content2 // 获取文章第一部分（卡片）
            let content3 = content.content3 // 获取文章第一部分（富文本）
            let content4 = content.content4 // 获取文章第一部分（卡片）
            let content5 = content.content5 // 获取文章第一部分（富文本）
            let content6 = content.content6 // 获取文章第一部分（卡片）
            if (content2 != '') {
              _this.getCouponInfo2(content2)
            }
            if (content4 != '') {
              _this.getCouponInfo4(content4)
            }
            if (content6 != '') {
              _this.getCouponInfo6(content6)
            }
            WxParse.wxParse('content1', 'html', content1, _this, 5);
            WxParse.wxParse('content3', 'html', content3, _this, 5);
            WxParse.wxParse('content5', 'html', content5, _this, 5);
            if(avatar.substr(0,4) != 'http'){
              avatar =  app.globalData.imageUrl+avatar
            }
            _this.setData({
              isLike:isLike,
              isCollect:isCollect,
              articleType:articleType,
              nickname:nickname,
              avatar:avatar,
              likeCount:likeCount,
              title:title,
              media:media,
              firstImg:firstImg,
              showContent1:content1,
              showContent2:content2,
              showContent3:content3,
              showContent4:content4,
              showContent5:content5,
              showContent6:content6
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
  // 新增点赞
  addLike: function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return false;
    }
    else {
      wx.request({
        url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Article&method=AddLike',
        method: 'post',
        data: JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
          articleId: _this.data.articleId
        }),
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode == 200) {
            let code = res.data.baseServerInfo.code
            let msg = res.data.baseServerInfo.msg
            if (code == 1) {
              wx.showToast({
                title: '点赞成功',
                icon: 'none', // (success,laoding,none)
                duration: 2000
              })
              _this.setData({
                isLike:true,
                likeCount:_this.data.likeCount +1
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
    }
  },
  // 新增收藏
  addCollect: function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return false;
    }
    else {
      wx.request({
        url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Article&method=AddCollect',
        method: 'post',
        data: JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
          articleId: _this.data.articleId
        }),
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
        },
        success: (res) => {
          if (res.statusCode == 200) {
            let code = res.data.baseServerInfo.code
            let msg = res.data.baseServerInfo.msg
            if (code == 1) {
              wx.showToast({
                title: '成功收藏',
                icon: 'none', // (success,laoding,none)
                duration: 2000
              })
              _this.setData({
                isCollect:true
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
    }
  },
  // 取消点赞
  cancelLike: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Article&method=CancelLike',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        articleId: _this.data.articleId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            console.log('取消点赞');
            _this.setData({
              isLike:false,
              likeCount:_this.data.likeCount -1
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
  // 取消收藏
  cancelCollect: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Article&method=CancelCollect',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        articleId: _this.data.articleId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            console.log('取消收藏');
            _this.setData({
              isCollect:false
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
  // 获取商品信息
  getCouponInfo2: function(couponId){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Article&method=GetGoodsCard',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id: couponId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let goodsCard = res.data.goodsCard // 获取商品卡片
            let id = goodsCard.id //获取商品id
            let title = goodsCard.title // 获取卡券标题
            let productprice = goodsCard.productprice // 获取原价
            let marketprice = goodsCard.marketprice // 获取现价
            let labels = goodsCard.labels // 获取标签
            let thumb = goodsCard.thumb // 获取首图
            _this.setData({
              title2:title,
              productprice2:productprice,
              marketprice2:marketprice,
              labels2:labels,
              thumb2:app.globalData.imageUrl+thumb,
              shopId2:id
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
  getCouponInfo4: function(couponId){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Article&method=GetGoodsCard',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id: couponId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let goodsCard = res.data.goodsCard // 获取商品卡片
            let id = goodsCard.id //获取商品id
            let title = goodsCard.title // 获取卡券标题
            let productprice = goodsCard.productprice // 获取原价
            let marketprice = goodsCard.marketprice // 获取现价
            let labels = goodsCard.labels // 获取标签
            let thumb = goodsCard.thumb // 获取首图
            _this.setData({
              title4:title,
              productprice4:productprice,
              marketprice4:marketprice,
              labels4:labels,
              thumb4:app.globalData.imageUrl+thumb,
              shopId4:id
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
  getCouponInfo6: function(couponId){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Article&method=GetGoodsCard',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id: couponId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let goodsCard = res.data.goodsCard // 获取商品卡片
            let id = goodsCard.id //获取商品id
            let title = goodsCard.title // 获取卡券标题
            let productprice = goodsCard.productprice // 获取原价
            let marketprice = goodsCard.marketprice // 获取现价
            let labels = goodsCard.labels // 获取标签
            let thumb = goodsCard.thumb // 获取首图
            _this.setData({
              title6:title,
              productprice6:productprice,
              marketprice6:marketprice,
              labels6:labels,
              thumb6:app.globalData.imageUrl+thumb,
              shopId6:id
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
  // 分享
  onShareAppMessage: function(res) {
    let _this = this
    _this.setData({
      startShare:1
    })
    return {
      title: _this.data.title,
      path: '/pages/article-info/index?id='+_this.data.articleId+'',
      imageUrl:app.globalData.imageUrl+_this.data.firstImg
    }
  },
  onHide(){
    let _this = this
    this.setData({
      startShare:_this.data.startShare + 1
    })
  },
  // 跳转到商品详情
  hrefToShopDetail: function(e) {
    let _this = this
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/shop-detail/index?Id='+id+''
    })
  },
  //统计首页访客记录
  recordContentView(articleid){
    let _this = this
    let cookie = ' '
    if(wx.getStorageSync('token')){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=RecordContentView',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        articleid:articleid
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
        },
      fail: (res) => {
      }
    })
  },
  //统计添加分享记录记录
  recordShareLog(){
    let _this = this
    let cookie = ' '
    if(wx.getStorageSync('token')){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Share&method=AddShareLog',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        shareType:4,
        businessid:_this.data.articleId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
        },
      fail: (res) => {
      }
    })
  },
  //获取文章详情推荐文章
  getRecommendArticleList(){
    let _this = this
    let cookie = ' '
    if(wx.getStorageSync('token')){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Article&method=GetRecommendArticleList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        articleId:_this.data.articleId,
        pageLength:8,
        page:_this.data.recommendAPageNow
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
        let pageCount  = res.data.pageCount //总页数
        let articleList  = res.data.articleList || [] //文章列表
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
        if(_this.data.articleList){
          articleList = res.data.articleList.concat(_this.data.articleList)
        }
        _this.setData({
          pageCount:pageCount,
          articleList: articleList
        })
        },
      fail: (res) => {
      }
    })
  },
  onReachBottom(){
   let pageCount = this.data.pageCount
   let nowPage = this.data.recommendAPageNow
   let _this = this
   if(nowPage >= pageCount){
      _this.setData({
        showBottomLine:true
      })
   }else{
    this.setData({
      recommendAPageNow:nowPage + 1
     },function(){
      _this.getRecommendArticleList()
     })
   }

  },
  //跳转到文章详情页
  hrefToDetail:function(e){
    let articleId = e.currentTarget.dataset.id //文章id
    console.log(articleId)
    wx.navigateTo({
      url: '/pages/article-info/index?id=' + articleId,
    })
  },
})
