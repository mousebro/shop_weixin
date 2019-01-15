//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    actionSheetHidden:true,
    couponList:[],
    showCouponTotal:0
  },
  onLoad: function () {
    let _this = this
    // 获取是否是新用户
    wx.showShareMenu({
      withShareTicket: true
    })
    _this.setData({
      isIpx:app.globalData.isIpx
    })
    _this.getBanner()
    _this.getShopList()
    _this.getShopGroupList()
    _this.getIndexSet()
    _this.getShopNav()
    _this.getShopCubes()
    _this.getNewUserList()
  },
  onShow:function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    _this.setData({
      isLogin:isLogin
    })
  },
  // 获取新人优惠券列表
  getNewUserList: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopCoupon&method=GetSendCouponList',
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
            let couponList = res.data.couponList
            let showCouponTotal = _this.data.showCouponTotal
            _this.setData({
              couponList:couponList
            })
            if (couponList.length != 0) {
              for (let i = 0; i < couponList.length; i++) {
                let deduct = parseInt(couponList[i].deduct)
                let enough = parseInt(couponList[i].enough)
                let type = couponList[i].backtype
                if (type == 0) {
                  _this.setData({
                    showCouponTotal: _this.data.showCouponTotal + deduct
                  })
                }
                couponList[i].deduct = deduct
                couponList[i].enough = enough
              }
              let couponType = couponList[0].backtype
              let couponDeduct = couponList[0].deduct
              let couponDiscount = couponList[0].discount
              let couponName = couponList[0].couponname
              let couponEnough = couponList[0].enough
              _this.setData({
                couponType:couponType,
                couponDeduct:couponDeduct,
                couponDiscount:couponDiscount,
                couponEnough:couponEnough,
                couponName:couponName
              })
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
          console.log(res.statusCode);
        }
      },
      fail: (res) => {
      }
    })
  },
  closeModal:function(){
    let _this = this
    _this.setData({
      isLogin:true
    })
  },
  //唤起底部客服弹窗
  listenerButton: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: false
    })
  },
  //拨打客服热线
  call: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
    wx.makePhoneCall({
      phoneNumber: ''+app.globalData.customerMobile+'' //
    })
  },
  //取消底部弹窗
  close: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
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
          console.log(res.statusCode);
        }
      },
      fail: (res) => {
      }
    })
  },
  // 跳转到搜索页
  hrefToSearch: function(){
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },
  // 跳转登录页
  hrefToLogin: function(){
    wx.navigateTo({
      url: '/pages/login/index'
    })
  },
  // 获取首页轮播图
  getBanner: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=HomePage&method=GetBanner',
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
            let bannerList = res.data.bannerList
            for (var i = 0; i < bannerList.length; i++) {
              let img = bannerList[i].thumb
              let rule = bannerList[i].urlRule
              let url = img.substring(0,4)
              if (url != 'http') {
                bannerList[i].thumb = app.globalData.imageUrl+img
              }
              for (var j = 0; j < rule.length; j++) {
                let name = rule[j].name
                let value = rule[j].nameValue
                if (name == 'r' & value == 'goods.detail') {
                  bannerList[i].hrefType = 'shopDetail'
                }
                else if (name == 'id') {
                  bannerList[i].hrefId = value
                }
                else if (name == 'inside') {
                  bannerList[i].hrefType = 'inside'
                }
              }
            }
            _this.setData({
              bannerList:bannerList
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
  // 首页轮播图跳转
  bannerHref: function(e){
    let type = e.currentTarget.dataset.type
    let id = e.currentTarget.dataset.hrefid
    if (type == 'shopDetail') {
      wx.navigateTo({
        url: '/pages/shop-detail/index?Id='+id+''
      })
    }
    else if (type == 'inside') {
      wx.navigateTo({
        url: '/pages/inside/index'
      })
    }
  },
  // 获取首页自定义入口
  getShopNav: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=HomePage&method=GetShopNav',
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
            let bannerList = res.data.navInfo
            for (var i = 0; i < bannerList.length; i++) {
              let img = bannerList[i].icon
              let rule = bannerList[i].urlRule
              let url = img.substring(0,4)
              if (url != 'http') {
                bannerList[i].icon = app.globalData.imageUrl+img
              }
              for (var j = 0; j < rule.length; j++) {
                let name = rule[j].name
                let value = rule[j].nameValue
                if (name == 'r' & value == 'goods.detail') {
                  bannerList[i].hrefType = 'shopDetail'
                }
                else if (name == 'r' & value == 'groups.category') {
                  bannerList[i].hrefType = 'groupList'
                }
                else if (name == 'r' & value == 'goods') {
                  bannerList[i].hrefType = 'cate'
                }
                else if (name == 'id') {
                  bannerList[i].hrefId = value
                }
                else if (name == 'cate') {
                  bannerList[i].hrefId = value
                }
              }
            }
            _this.setData({
              navInfoList:bannerList
            })
          }
          else{

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
  // 自定义入口跳转
  navHref: function(e){
    let type = e.currentTarget.dataset.type
    let id = e.currentTarget.dataset.hrefid
    if (type == 'shopDetail') {
      wx.navigateTo({
        url: '/pages/shop-detail/index?Id='+id+''
      })
    }
    else if (type == 'groupList') {
      wx.navigateTo({
        url: '/pages/group-buy-list/index'
      })
    }
    else if (type == 'cate') {
      wx.navigateTo({
        url: '/pages/shop-list/index?Id='+id+''
      })
    }
  },
  // 获取团购列表
  getShopGroupList: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopGroups&method=GetList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        page:1,
        pageLength:100,
        isindex:true
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let goodsList  = res.data.goodsList
            for (var i = 0; i < goodsList.length; i++) {
              let img = goodsList[i].thumb
              let url = img.substring(0,4)
              if (url != 'http') {
                goodsList[i].thumb = app.globalData.imageUrl+img
              }
            }
            _this.setData({
              groupGoodsList:goodsList
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
  // 跳转到团购列表
  hrefToGroupList: function(){
    wx.navigateTo({
      url: '/pages/group-buy-list/index'
    })
  },
  // 跳转到团购详情
  hrefToGroupDetail: function(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/group-buy-detail/index?Id='+id+''
    })
  },
  // 获取魔方列表
  getShopCubes: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=HomePage&method=GetShopCubes',
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
            let bannerList = res.data.cubesInfo
            for (var i = 0; i < bannerList.length; i++) {
              let img = bannerList[i].icon
              let rule = bannerList[i].urlRule
              let url = img.substring(0,4)
              if (url != 'http') {
                bannerList[i].icon = app.globalData.imageUrl+img
              }
              for (var j = 0; j < rule.length; j++) {
                let name = rule[j].name
                let value = rule[j].nameValue
                if (name == 'r' & value == 'goods.detail') {
                  bannerList[i].hrefType = 'shopDetail'
                }
                else if (name == 'r' & value == 'goods') {
                  bannerList[i].hrefType = 'shopList'
                }
                else if (name == 'id') {
                  bannerList[i].hrefId = value
                }
                else if (name == 'cate') {
                  bannerList[i].hrefCate = value
                }
              }
            }
            _this.setData({
              cubesInfoList:bannerList
            })
          }
          else{

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
  // 魔方入口跳转
  cubeHref: function(e){
    let type = e.currentTarget.dataset.type
    let id = e.currentTarget.dataset.hrefid
    let cate = e.currentTarget.dataset.hrefcate
    if (type == 'shopDetail') {
      wx.navigateTo({
        url: '/pages/shop-detail/index?Id='+id+''
      })
    }
    else if (type == 'shopList') {
      wx.navigateTo({
        url: '/pages/shop-list/index?Id='+cate+''
      })
    }
  },
  // 获取商品列表
  getShopList: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=HomePage&method=GetRecommandGoods',
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
            let goodsList  = res.data.recommandGoods
            for (var i = 0; i < goodsList.length; i++) {
              let img = goodsList[i].thumb
              let url = img.substring(0,4)
              if (url != 'http') {
                goodsList[i].thumb = app.globalData.imageUrl+img
              }
            }
            _this.setData({
              goodsList:goodsList
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
  // 跳转到商品详情
  hrefToDetail: function(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/shop-detail/index?Id='+id+''
    })
  },
  // 跳转到新人领券分类
  hrefToNewPersonal: function(){
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    else {
      wx.navigateTo({
        url: '/pages/new-personal/index'
      })
    }
  },
  //跳转到分类
  hrefToSort: function(){
    wx.redirectTo({
      url: '/pages/sort/index'
    })
  },
  //跳转到购物车
  hrefToCart: function(){
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    else {
      wx.redirectTo({
        url: '/pages/shop-cart/index'
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
  //分享
  onShareAppMessage: function(res) {
    let _this = this
    return {
      title: '名庄名酒',
      path: '/pages/index/index',
      imageUrl:_this.data.bannerList[0].thumb
    }
  },
  // 点击红包跳转登录页
  hrefToLoginByNewUser: function(){
    wx.navigateTo({
      url: '/pages/login/index?url=newuser'
    })
  },
})
