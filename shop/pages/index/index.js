//index.js
//获取应用实例
import formatTime from '../../utils/util.js'
const app = getApp()

Page({
  data: {
    actionSheetHidden:true,
    couponList:[],
    showCouponTotal:0,
    idx:0,
    isFlash:true,
    time:{
      hours:'',
      minutes:'',
      seconds:'',
      timer:null,
      choseTime:'19:00',
    },
    nowPage:1,
    startTime: 0,
    toView:'item1',
    flashGoodsList:[],
    showAddTips:false,
    frontPictureVar:'?x-oss-process=image/resize,w_750,limit_1', //对图片进行压缩 自定义入口bannertu
    goodsPictureVar:'?x-oss-process=image/resize,w_300,limit_1' //对图片进行压缩 自定义入口bannertu
  },
  onLoad: function (options) {
    let _this = this
    let showAddTips = wx.getStorageSync('showAddTips')
    if (showAddTips === '') {
      _this.setData({
        showAddTips:true
      })
    }
    else {
      _this.setData({
        showAddTips:false
      })
    }
    // 获取是否是新用户
    wx.showShareMenu({
      withShareTicket: true
    })
    _this.setData({
      isIpx:app.globalData.isIpx
    })
    let scene = decodeURIComponent(options.scene) // 判断是否是扫小程序码进入的用户
     if (scene != 'undefined') { //进行渠道用户统计
      let list = []
      let className = scene.substr(0,7)
      if(className == 'codenum'){
        let codenum = scene.substr(7,)
        app.globalData.RecordQR = codenum
        _this.countUser(codenum)
      }
    }
    _this.getBanner()
    _this.getShopList()
    _this.getShopGroupList()
    _this.getIndexSet()
    _this.getShopNav()
    _this.getShopCubes()
    _this.getNewUserList()
    _this.getSelect() //获取搜索热词
    _this.getShareInfo()
    app.userView('RecordExposurenum') //统计平台曝光度记录

  },
  onLaunch(options){
  
  },
  onShow:function(options){
   
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    _this.setData({
      isLogin:isLogin
    })
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function(res) {
        _this.setData({
          shopNum:res.data.shopNum
        });
      }
    })
    _this.getTimeList()
    _this.recordContentView() //统计首页访客记录
  },
  onHide:function(){
    clearInterval(this.data.timer) //清除倒计时的定时器
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
                }else if(name == 'r' & value == 'bargain-list'){
                  bannerList[i].hrefType = 'bargain-list'
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
    }else if(type == 'bargain-list'){
      wx.navigateTo({
        url: '/pages/bargain-list/index?Id='+id+''
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
            let goodsList = res.data.goodsList
            for (var i = 0; i < goodsList.length; i++) {
              let img = goodsList[i].thumb
              let imgHd = goodsList[i].thumbhp
              let url = img.substring(0,4)
              let urlHd = imgHd.substring(0,4)
              if (url != 'http') {
                goodsList[i].thumb = app.globalData.imageUrl + img
              }
              if(!imgHd){
                goodsList[i].thumbhp = goodsList[i].thumb
              }else if(urlHd != 'http' && urlHd){
                goodsList[i].thumbhp = app.globalData.imageUrl + imgHd
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
  // 跳转到秒杀列表
  hrefToSeckillList: function(){
    wx.navigateTo({
      url: '/pages/flash-sale/index'
    })
  },
  // 获取魔方列表
  getShopCubes: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=HomePage&method=GetShopCubeList',
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
            //let bannerList = res.data.cubesInfo
            let cubeList = res.data.cubeList
            for(let k = 0;k<cubeList.length;k++){
              let bannerList = cubeList[k].cube
              for (let i = 0; i < bannerList.length; i++) {
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
                  else if (name == 'r' & value == 'bargain-list') {
                    bannerList[i].hrefType = 'bargain-list'
                  }
                  else if (name == 'id') {
                    bannerList[i].hrefId = value
                  }
                  else if (name == 'cate') {
                    bannerList[i].hrefCate = value
                  }
                }
              }
              cubeList[k].cube= bannerList
            }
           console.log(cubeList)

            _this.setData({
              //cubesInfoList:bannerList,
              cubeList:cubeList
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
    } else if (type == 'bargain-list') {
      wx.navigateTo({
        url: '/pages/bargain-list/index?Id='+cate+''
      })
    } else if (type == 'bargain-details') {
      wx.navigateTo({
        url: '/pages/bargain-details/index?Id='+cate+''
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
      url: '/pages/shop-list/index'
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
      wx.navigateTo({
        url: '/pages/shop-cart/index'
      })
    }
  },
  hrefToGold(){
    wx.redirectTo({
      url: '/pages/shopping-gold/index'
    })
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
    let shareInfo = _this.data.shareInfo
    return {
      title: shareInfo.title,
      path: '/pages/index/index',
      imageUrl:shareInfo.image
    }
  },
  // 点击红包跳转登录页
  hrefToLoginByNewUser: function(){
    wx.navigateTo({
      url: '/pages/login/index?url=newuser'
    })
  },
  // 关闭添加小程序提示
  closeAddtips:function(){
    let _this = this
    _this.setData({
      showAddTips:false
    })
    wx.setStorageSync('showAddTips', false)
  },
  // 秒杀模块
  timeInint(){ //初始时设置倒计时状态值
    //需要拿到正在进行秒拍活动的时间以及当前的服务器时间
    let _this = this
    //设置正在进行秒杀活动的倒计时
    if(!_this.data.timeList[_this.data.idx])return
    if(_this.data.isFlash == 2){
      _this.countDown(_this.data.startTime, parseInt(_this.data.startTime)+1)
    }else{
      _this.countDown(_this.data.startTime, _this.data.timeList[_this.data.idx+1].time)
    }
  },
  // 根据专题ID来获取对应的秒杀时间列表
  getTimeList(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
    })
    this.setHttpRequst('Seckill','GetTimeList',Data,function(res){
      let timeList = res.data.timeList //并对时间列表进行处理
      let activeItem = ''
      for(var i in timeList){
        timeList[i].toViewId = 'item'+timeList[i].id
        timeList[i].timeStr = timeList[i].time+':00' //转成5:00的时间格式
        if(timeList[i].status == 1){
          timeList[i].title = '即将开始'
        }else if(timeList[i].status == 2){
          timeList[i].title = '正在进行'
          _this.setData({
            idx:parseInt(i), //默认选中正在进行的秒拍的时间
            startTime:timeList[i].time,
            isFlash:2,
            timeid:timeList[i].id,
            nowPage:1,
            choseTime:timeList[i].timeStr,
            nowTitle:timeList[i].title
          })
          activeItem = timeList[i].toViewId
        }else if(timeList[i].status == 3){
          timeList[i].title = '已结束'
          if((parseInt(i)+1)<timeList.length && timeList[parseInt(i)+1].status == 1){
            timeList[parseInt(i) + 1].toViewId = 'item'+timeList[parseInt(i)+1].id
            timeList[parseInt(i) + 1].timeStr = timeList[parseInt(i)+1].time+':00' //转成5:00的时间格式
            activeItem =timeList[parseInt(i)+1].toViewId
            timeList[parseInt(i) + 1].title = '即将开始'
            _this.setData({
              idx:parseInt(i) + 1, //默认选中正在进行的秒拍的时间
              startTime:timeList[parseInt(i) + 1].time,
              isFlash:1,
              timeid:timeList[parseInt(i) + 1].id,
              nowPage:1,
              nowTitle:'即将开始',
              choseTime:timeList[parseInt(i) + 1].timeStr
            })
          }

        }

      }
      _this.setData({
        timeList:timeList,
        toView:activeItem
      })
      _this.getSystemTime(function(){ //获取完系统时间后进行倒计时初始化
        _this.timeInint()
        _this.getSecKillList() // 获取秒杀商品列表
      })
    },function(){})
  },
  //点击去抢购进行页面跳转
  hrefToFlashDetail(e){
    let idx = e.currentTarget.dataset.idx
    let isFlash = this.data.isFlash
   if(isFlash == 3)return
    if(isFlash!=2){
      if(isFlash == 3){
        wx.showModal({
          title:'提示',
          content:"该秒杀已结束",
          showCancel:false,
          success:()=>{
          }
        })
      }else{
        wx.showModal({
          title:'提示',
          content:'该秒杀还未开始',
          showCancel:false,
          success:()=>{
          }
        })
      }
      return
    }
    wx.navigateTo({
      url: '/pages/flash/index?Id='+idx+'&start='+this.data.newStart+'&end='+this.data.newEnd,
    })
  },
  //进行时间转换 头部5:00
  getTime(time){
    let date = new Date(time)
    let hours = date.getHours()
    let minutes = formatTime.formatNumber(date.getMinutes())
    return [hours,minutes].join(':')
  },
  //倒计时行为
  countDown(start,end){
    let _this = this
    start = parseInt(start)
    end = parseInt(end)
    let date = new Date(_this.data.nowTimeStamp*1000)
    let newStart = _this.data.nowTimeStamp*1000-(date.getHours()-start)*3600*1000 - date.getMinutes()*60*1000-date.getSeconds()*1000
    let newEnd = (end-start)*3600*1000 + newStart
    newStart =  _this.data.nowTimeStamp*1000
   _this.data.timer = setInterval(() => {
    newStart += 1000
    let count = newEnd - newStart
    let hours = formatTime.formatNumber(parseInt(count / 1000 / 3600))
    let minutes = formatTime.formatNumber(parseInt((count-parseInt(hours)*1000*3600) / 1000/60 ))
    let seconds = formatTime.formatNumber(parseInt((count - parseInt(hours) * 1000 * 3600 - parseInt(minutes) * 1000 * 60) /1000))
    //如果hours minutes seconds都归零的时候重新获取商品和时间表
    if(hours == 0 && minutes == 0 && seconds == 0){
      clearInterval(_this.data.timer)
      _this.getTimeList()
    }
    if(_this.data.isFlash==2 && hours==0 && minutes<=50){
      clearInterval(_this.data.timer)
      _this.setData({
        isFlash:-1,
        nowTitle:'即将开始'
      })
      _this.countDown(_this.data.startTime, _this.data.timeList[_this.data.idx+2].time)
    }
      _this.setData({
        time: {
          hours: hours,
          minutes: minutes,
          seconds: seconds,
        },
        newStart:newStart,
        newEnd:newEnd
      })
    }, 1000)
  },
  //获取系统时间
  getSystemTime(Succ){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
    })
    _this.setHttpRequst('System','GetBaseInfo',Data,function(res){
      _this.setData({
        nowTimeStamp:res.data.serverTimeStamp
      })
      Succ()
    })
  },
  //获取秒杀商品列表
  getSecKillList(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      page:_this.data.nowPage,
      pageLength:10,
      timeid:_this.data.timeid,
      roomid:0
    })
    _this.setHttpRequst('Seckill','GetGoodsList',Data,function(res){
      let goodsList = res.data.goodsList
      let seckPriceArr = []
      for(var item of goodsList){
       if(item.thumb.slice(0,4)!='http'){
        item.thumb = app.globalData.imageUrl + item.thumb
       }
      if(item.seckillprice){
        seckPriceArr = item.seckillprice.split(".")
      }
      item.seckPriceArr = seckPriceArr

      let saleRate =parseInt(parseInt(item.sales)/parseInt(item.total)*100)
      item.saleRate = saleRate
    }
      _this.setData({
        flashGoodsList:res.data.goodsList,
      })
    })
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
  //渠道用户统计
  countUser(codenum){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=RecordQR',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        qrid:codenum
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        wx.setStorageSync('sceneRecordQR', '')
       },
      fail: (res) => {
        wx.setStorageSync('sceneRecordQR', '')
      }
    })
  },
  /*获取首页热门搜索*/
  getSelect(){
    let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=HomePage&method=GetSelect',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let selectList = res.data.selectList
            let searchWord = ''
            let hotWords = []
            for(let item of selectList){
              if(item.type == 1){
              searchWord = item.selectname
              }else{
                hotWords.push(item.selectname)
              }
            }
            _this.setData({
            searchWord:searchWord,
            hotWords:hotWords,
            showHotWord:1
            })
          }
          else {
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
  //跳转到砍价列表页
  hrefToBargainList(){
    wx.navigateTo({
      url: '/pages/bargain-list/index',
    })
  },
  hrefToArticleList(){
    wx.navigateTo({
      url: '/pages/new-index/index',
    })
  },
  //获取小程序分享
  getShareInfo(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Share&method=GetShareInfo',
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
              let info =res.data
              let img = info.image
              let url = img.substring(0,4)
              if (url != 'http') {
                info.image = app.globalData.imageUrl + img
              }
             _this.setData({
               shareInfo:info
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
  //统计首页访客记录
  recordContentView(){
    let _this = this
    let cookie = ' '
    if(wx.getStorageSync('token')){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=RecordHomepageView',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
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
  //页面滚动，当超过屏幕3*显示返回顶部按钮
    
  onPageScroll:function(res){
    let _this = this
    wx.getSystemInfo({
      success:(ret)=>{
        if (res.scrollTop > ret.windowHeight*3){
          _this.setData({
            showBackToTop:true
          })          
        }else{
          _this.setData({
            showBackToTop:false
          }) 
        }
      }
    })

  },
  backToTop(){
    let _this = this
    wx.pageScrollTo({
      scrollTop: 0,
     success:()=>{
      _this.setData({
        showBackToTop:false
      })      
     }
    })
  },


})
