//index.js
//获取应用实例
const app = getApp()
const groupTimerList = []
const oneGroupTimer = []
let WxParse = require('../../wxParse/wxParse.js');
import formatTime from '../../utils/util.js'
Page({
  data: {
    buyNumber: 1,
    buyNumMin: 1,
    buyNumMax: 100,
    shopCarInfo: {},
    showActive: 'a1',
    actionSheetHidden: true, //是否显示底部客服弹窗
    isShowList:true, //是否显示拼团列表悬浮框
    isShowItem:true, //是否显示个人拼团悬浮框
    timerList:null ,//团购列表页的定时器
    timeList:[], //团购列表时间
    background:"/images/group-buy/group-detail.png",
    choseIndex:0, //选择在团购列表了哪一个团购的下标
    timer:''
  },
  onShow: function () {
    let _this = this
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function (res) {
        _this.setData({
          shopCarInfo: res.data,
          shopNum: res.data.shopNum
        });
      }
    })
    _this.getGoodsInfo()
    _this.getTeamList()
    _this.getCommentList()
  },
  onHide:function(){
    let timerList = this.data.timeList
    for(let i in groupTimerList){ //关闭团购列表定时器
      clearInterval(groupTimerList[i])
    }
    for(let i in oneGroupTimer){ //关闭单个团购列表定时器
      clearInterval(oneGroupTimer[i])
    }
  },
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    this.getSystemTime()
    //对本地背景图片编译
    let base64 = wx.getFileSystemManager().readFileSync(_this.data.background,'base64')
    this.setData({
      background:'data:image/jpg;base64,' + base64
    })
    let shopId = options.Id
    if(options.teamid){
      _this.setData({
        oneteamid:options.teamid,
        shopId:options.Id
      })
      _this.getGoodsInfo()
      _this.goToGroupBuy()
      _this.getTeamList()
      _this.getCommentList()
    }
    this.setData({
      shopId: shopId
    })
    _this.getSuperMsg()//获取super会员折扣信息
  },
  /*倒计时*/
  countDown(start,end,i) {
      let _this = this
      start = this.data.startTime  //将系统时间替换为开始时间
      let timer = null
      timer = setInterval(() => {
      start += 1
      let count = end - start
      let hours = formatTime.formatNumber(parseInt(count / 3600))
      let minutes = formatTime.formatNumber(parseInt((count - parseInt(hours) * 3600)/ 60))
      let secondeds = formatTime.formatNumber(parseInt((count - parseInt(hours) * 3600-parseInt(minutes)*60)))
      let timeList = {hours,minutes,secondeds}
      _this.data.timeList[i] = timeList
      _this.setData({
        timeList:_this.data.timeList,
      })
    }, 1000)
    return timer
  },
  //获取拼单列表
  getTeamList(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      id: _this.data.shopId,
      page:1,
      pageLength:10,
      status:1
    })
    _this.setHttpRequst('ShopGroups','GetTeamList',Data,(res)=>{
      let teamList = res.data.teamList
      for(let i in teamList){
        groupTimerList.push(_this.countDown(teamList[i].starttime,teamList[i].endtime,parseInt(i)))
      }
      _this.setData({
        //teamList:res.data.teamList
        teamList:teamList,
        //timerList:timer
      })
    })
  },
  // 点击商品以及点击详情定位
  scrollPosition: function (e) {
    let _this = this
    let showId = e.currentTarget.dataset.id
    _this.setData({
      showActive: showId,
      toView: showId
    })
  },
  // 单独购买
  buyProductHandle: function () {
    this.setData({
      showModal: true,
      modal1: true
    })
  },
  // 关闭购物车弹窗
  closeModal1: function () {
    this.setData({
      showModal: false,
      modal1: false
    })
  },
  // 展示立即购买
  showBuy: function () {
    this.setData({
      showModal: true,
      modal2: true
    })
  },
  // 关闭立即购买弹窗
  closeModal2: function () {
    this.setData({
      showModal: false,
      modal2: false
    })
  },
  // 跳转到购物车
  hrefToShopCart: function () {
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    wx.navigateTo({
      url: '/pages/shop-cart/index'
    })
  },
  // 跳转到订单支付
  hrefToPay: function (e) {
    let _this = this
    _this.setData({ //关闭弹窗
      showModal: false,
      modal1: false
    })
    let shopList = []
    let id = 0
    let goodsId = e.currentTarget.dataset.goodid;
    let pic = _this.data.imageUrl[0]
    let name = _this.data.goodsTitle
    let number = _this.data.buyNumber;
    let price = _this.data.goodsDetail.singleprice;
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index',
      })
      wx.setStorage({
        key: 'isLogin',
        data: false
      })
    }else{
      let goodsdetail = this.data.goodsDetail
      let detail = {}
      detail.singleprice = goodsdetail.singleprice
      detail.groupsprice = goodsdetail.groupsprice
      detail.title = goodsdetail.title
      detail.freight = goodsdetail.freight
      detail.thumbUrl = goodsdetail.thumbUrl[0]
      detail.teamid = null
      detail.buyNumber = number
      detail.isCommon = 1
      detail.id = goodsdetail.id
      detail =JSON.stringify(detail)
      wx.navigateTo({
        url: '/pages/group-buy-order-detail/index?detail='+detail,
      })
      shopList.push({ id: id, goodsId: goodsId, pic: pic, name: name, number: number, price: price })
      wx.setStorage({
        key: "orderShopList",
        data: shopList
      })
    }

  },
  // 商品数量增减
  lessTap: function () {
    if (this.data.buyNumber > this.data.buyNumMin) {
      let currentNum = this.data.buyNumber;
      currentNum--;
      let price = this.data.countPrice
      let showPrice = currentNum * price
      this.setData({
        buyNumber: currentNum,
        price: showPrice
      })
    }
  },
  plusTap: function () {
    if (this.data.buyNumber < this.data.buyNumMax) {
      var currentNum = this.data.buyNumber;
      currentNum++;
      let price = this.data.countPrice
      let showPrice = currentNum * price
      this.setData({
        buyNumber: currentNum,
        price: showPrice
      })
    }
  },
  // 原价购买商品-立即购买
  addShopCar: function (e) {
    let goodsid = e.currentTarget.dataset.goodid
    wx.navigateTo({
      url:'/pages/pay/index?Id='+goodsid
    })
    // let shopCarInfo = this.bulidShopCarInfo();
    // this.setData({
    //   shopCarInfo: shopCarInfo,
    //   shopNum: shopCarInfo.shopNum
    // });
    // // 写入本地存储
    // wx.setStorage({
    //   key: "shopCarInfo",
    //   data: shopCarInfo
    // })
  },
  // 构建购物车信息
  bulidShopCarInfo: function () {
    let shopCarMap = {};
    shopCarMap.goodsId = this.data.id;
    shopCarMap.pic = this.data.goodsPicture
    shopCarMap.name = this.data.title
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.price = this.data.countPrice;
    let shopCarInfo = this.data.shopCarInfo;
    this.addGoods()
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    // 判断是否有相同项，合并相同项
    let hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      let tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }
    // 购物车数量增加
    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    return shopCarInfo;
  },
  // 获取商品详情
  getGoodsInfo: function () {
    let _this = this
    wx.showLoading({
      title:'拼命加载中~',
      mask:true
    })
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=ShopGroups&method=GetDetail',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        id:_this.data.shopId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        wx.hideLoading()
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (res.statusCode == 200) {
          if (code == 1) {
            let detail = res.data.goodsDetail
            detail.priceArr = detail.groupsprice.split('.') //团购价
            detail.priceOld = detail.singleprice.split('.') //原价
            for (let i in res.data.goodsDetail.thumbUrl){
              let url = res.data.goodsDetail.thumbUrl[i].substring(0, 4)
              if(url != 'http'){
                res.data.goodsDetail.thumbUrl[i] = app.globalData.imageUrl + res.data.goodsDetail.thumbUrl[i]
              }
            }
            let description = detail.content
            WxParse.wxParse('content', 'html', description, _this, 5);
            _this.setData({
              goodsDetail:res.data.goodsDetail,
              goodsTitle:res.data.goodsDetail.title,
              goodsId:res.data.goodsDetail.id,
              imageUrl:res.data.goodsDetail.thumbUrl,
              nownum:res.data.goodsDetail.nownum,
            })
          }
          else {
            wx.showModal({
              title: '提示',
              content: msg,
              showCancel: false,
              success: function (res) { }
            })
          }
        }
        else {
          wx.showModal({
            title: '提示',
            content: msg,
            showCancel: false,
            success: function (res) {
              wx.reLaunch({
                url:'/pages/index/index'
              })
             }
          })
        }
      },
      fail: (res) => {
        wx.hideLoading()
      }
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
      phoneNumber: app.globalData.customerMobile // 仅为示例，并非真实的电话号码
    })
  },
  //取消底部弹窗
  close: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
  },
  //关闭拼单列表悬浮框
  closeGroupList(){
    this.setData({
      isShowList:!this.data.isShowList,
      showModal:false
    })
  },
  //点击查看全部显示拼单列表
  showGroupList(){
    this.setData({
      isShowList:!this.data.isShowList,
      isShowItem:true,
      showModal:true
    })
  },
  //点击单个拼团信息进行拼团操作
  goToGroupBuy(e){
    let _this = this
    if(_this.data.oneteamid){//判断是否是通过外部分享进入的团购详情
      var teamid = _this.data.oneteamid
    }else{
      var teamid = e.currentTarget.dataset.teamid
    }
    let goodsid = _this.data.shopId
    //let idx = e.currentTarget.dataset.index
    _this.setData({
      isShowItem:!this.data.isShowItem,
      isShowList:true,
      showModal:true
      //choseIndex:idx
    })
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      id:teamid
    })
    _this.setHttpRequst('ShopGroups','GetTeamDetail',Data,function(res){
      let team = res.data.team
      //获取订单id跳转
      let start = _this.data.startTime
      let end = res.data.team.endtime
      oneGroupTimer[0] = setInterval(() => {
        start += 1
        let count = end - start
        let hours = formatTime.formatNumber(parseInt(count / 3600))
        let minutes = formatTime.formatNumber(parseInt((count - parseInt(hours) * 3600)/ 60))
        let secondeds = formatTime.formatNumber(parseInt((count - parseInt(hours) * 3600-parseInt(minutes)*60)))
        let timeList = {hours,minutes,secondeds}
        _this.data.oneGroupTime = timeList
        _this.setData({
          oneGroupTime:_this.data.oneGroupTime,
        })
      }, 1000)
      _this.setData({ //单个拼团的详情
        oneTeamDetail:team
      })
      if(team.leftnum==0){
        wx.showModal({
          title:'该拼团已经结束',
          content:'看看其他商品',
          showCancel:false,
          success:function(){
            wx.reLaunch({
              url:'/pages/index/index'
            })
          }
        })
      }
    })
  },
  //点击参与拼团进行拼团行为
  joinGroups(e){
    let _this = this
    let teamid = e.currentTarget.dataset.teamid
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index',
      })
      wx.setStorage({
        key: 'isLogin',
        data: false
      })
    }else{
      let goodsdetail = this.data.goodsDetail
      let detail = {}
      detail.singleprice = goodsdetail.singleprice
      detail.groupsprice = goodsdetail.groupsprice
      detail.teamid = teamid
      detail.title = goodsdetail.title
      detail.freight = goodsdetail.freight
      detail.thumbUrl = goodsdetail.thumbUrl[0]
      detail.id = goodsdetail.id
      detail =JSON.stringify(detail)
      wx.navigateTo({
        url: '/pages/group-buy-order-detail/index?detail='+detail,
      })
      if(!_this.data.addressId){ //如果没有地址Id去地址管理页获取地址Id
        wx.navigateTo({
          url: '/pages/address/index?url=group-buy',
        })
      }else{ //获取到地址Id后进行参与拼团的行为
        let addressId = _this.data.addressId
        let teamId = e.currentTarget.dataset.teamid
        let Data = JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
          teamid:teamId,
          addressid:addressId
        })
        _this.setHttpRequst('ShopGroups','JoinGroups',Data,function(res){
            _this.payfor()
        })
      }
    }

  },
  //点击发起拼单以团长的身份创建一个拼团
  startAgroup(e){
    let _this = this
    _this.setData({
      showModal: false,
      modal2: false
    })
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index',
      })
      wx.setStorage({
        key: 'isLogin',
        data: false
      })
    }else{
      let goodsdetail = this.data.goodsDetail
      let detail = {}
      detail.isTeamLeader = 1 //用于生成订单是判断是否为以团长身份成团
      detail.singleprice = goodsdetail.singleprice
      detail.groupsprice = goodsdetail.groupsprice
      detail.title = goodsdetail.title
      detail.freight = goodsdetail.freight
      detail.thumbUrl = goodsdetail.thumbUrl[0]
      detail.id = goodsdetail.id
      detail =JSON.stringify(detail)
      wx.navigateTo({
        url: '/pages/group-buy-order-detail/index?detail='+detail,
      })
    }

  },
  //关闭单个拼团悬浮框
  closePersonalGroup(){
    for(var i in oneGroupTimer){
      clearInterval(oneGroupTimer[i])
    }
    this.setData({
      isShowItem:!this.data.isShowItem,
      showModal:false
    })
  },
  //分享拼团商品
  onShareAppMessage: function(res) {
    let _this = this
    return {
      title: ''+_this.data.goodsTitle+'',
      path: '/pages/group-buy-detail/index?Id='+_this.data.goodsId+'',
      imageUrl:_this.data.imageUrl[0]
    }
  },
  //获取系统时间
  getSystemTime(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
    })
    _this.setHttpRequst('System','GetBaseInfo',Data,function(res){
      _this.setData({
        startTime:res.data.serverTimeStamp
      })
    })
  },
  //获取super会员设定列表（折扣）
  getSuperMsg(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
    })
    _this.setHttpRequst('Supermember','GetMemberbase',Data,function(res){
      let discount = res.data.baseinfo.discount
      _this.setData({
        supDiscount:discount
      })
    })
  },
  //发起Http请求
  setHttpRequst(Class,Method,Data,Succ,Fail){
    let _this = this
    wx.request({
      url: `https://${app.globalData.productUrl}/api?resprotocol=json&reqprotocol=json&class=${Class}&method=${Method}`,
      method: 'post',
      data: Data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (res.statusCode == 200) {
          if (code == 1) {
            Succ(res)
          }
          else {
            Fail(res)
          }
        }else if(code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else {
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

  // 提交生成订单 -去支付
  payfor: function(orderid){
    let _this = this
    let orderType = 2
    wx.showLoading({
      mask:true,
      title: '订单支付中...'
    })
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Payment&method=WechatPayOrder',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        orderId:orderId,
        orderType:orderType
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        let payInfo = res.data
        if (code == 1) {
          wx.hideLoading()
              let appId = payInfo.appId
              let timeStamp = payInfo.timeStamp
              let nonceStr  = payInfo.nonceStr
              let prepayId  = payInfo.prepayId
              let sign      = payInfo.sign
              let orderSn   = payInfo.orderSn
              wx.requestPayment({
                'timeStamp': ''+timeStamp+'',
                'nonceStr': nonceStr,
                'package': 'prepay_id='+prepayId,
                'signType': 'MD5',
                'paySign': sign,
                'success':function(res){
                  _this.paySuccess(orderSn,prepayId,orderId)
                },
                'fail':function(res){
                  _this.cancelOrder(orderId)
                },
                'complete':function(res){
                }
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
  // 支付成功回调
  paySuccess: function(orderSn,prepayId,orderId){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Payment&method=WechatPaySuccess',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 },
        orderSn: orderSn,
        prepayId:prepayId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: function(res) {

      },
      fail: function(res) {
      }
    })
  },
  // 支付失败回调
  cancelOrder: function(orderId){
    let _this = this

  },
    // 获取评论列表
  getCommentList: function(){
  let _this = this
  wx.request({
    url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=OrderComment&method=GetCommentList',
    method: 'post',
    data: JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
      page: 1,
      pageLength: 1,
      goodsid: _this.data.shopId,
      type:2
    }),
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: (res) => {
      let code = res.data.baseServerInfo.code
      let msg = res.data.baseServerInfo.msg
      if (code == 1) {
        let commentList = res.data.commentList
        let totalComment = res.data.totalNum
        _this.setData({
          commentList:commentList,
          totalComment:totalComment
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
  // 跳转到全部评论
  hrefToCommentList: function(){
    let _this = this
    wx.navigateTo({
      url: '/pages/commit-list/index?id='+_this.data.shopId+'&type=2'
    });
  },
  // 跳转回首页
  herfToIndex: function(){
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },

})
