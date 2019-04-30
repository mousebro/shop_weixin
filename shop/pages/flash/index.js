//index.js
//获取应用实例
const app = getApp()
let WxParse = require('../../wxParse/wxParse.js');
import formatTime from '../../utils/util.js'
Page({
  data: {
    buyNumber:1,
    buyNumMin:1,
    buyNumMax:9999,
    shopCarInfo:{},
    showActive:'a1',
    actionSheetHidden:true,
    imgUrl:'',
    timer:''
  },
  onShow: function(){
    let _this = this
  },
  onLoad: function(options){
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let shopId = options.Id
    let _this = this
    this.setData({
      shopId:shopId,
      imageUrl: app.globalData.imageUrl,
      isIpx:app.globalData.isIpx,
      startTime:options.start,
      endTime:options.end
    },()=>{
      _this.countDown(_this.data.startTime,_this.data.endTime) //进行倒计时行为
    })
    
    _this.getGoodsInfo()
    _this.getCommentList()
  },
  onUnload(){
    clearInterval(this.data.timer) //关闭定时器
  },
  // 点击商品以及点击详情定位
  scrollPosition: function(e){
    let _this = this
    let showId = e.currentTarget.dataset.id
    _this.setData({
      showActive:showId,
      toView:showId
    })
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
        type:1
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
      url: '/pages/commit-list/index?id='+_this.data.shopId+'&type=1'
    });
  },
  // 展示立即购买
  showBuy: function(){
    this.setData({
      showModal:true,
      modal2:true
    })
  },
  // 关闭立即购买弹窗
  closeModal2: function(){
    this.setData({
      showModal:false,
      modal2:false
    })
  },
  // 跳转到订单支付
  hrefToPay: function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    else {
      let shopList = []
      let id = 0
      let goodsId = _this.data.id;
      let pic = _this.data.goodsPicture
      let name = _this.data.title
      let number = _this.data.buyNumber;
      let price = _this.data.countPrice;
      let roomid = _this.data.roomid
      let taskid = _this.data.taskid
      let timeid = _this.data.timeid
      let freight = _this.data.freight
      let param = _this.data.param
      shopList.push({id:id,goodsId:goodsId,pic:pic,name:name,number:number,price:price,roomid:roomid,taskid:taskid,timeid:timeid,freight:freight,param:param})
      wx.setStorage({
        key:"orderShopList",
        data:shopList
      })
      wx.navigateTo({
        url: "/pages/flash-order/index?from=secKill"
      });
    }
  },
  // 商品数量增减
  lessTap: function() {
     if(this.data.buyNumber > this.data.buyNumMin){
        let currentNum = this.data.buyNumber;
        currentNum--;
        let price = this.data.seckillprice
        let showPrice = (currentNum*price).toFixed(2)
        this.setData({
            buyNumber: currentNum,
            price:showPrice
        })
     }
  },
  plusTap: function() {
     if(this.data.buyNumber < this.data.buyNumMax){
        var currentNum = this.data.buyNumber;
        currentNum++ ;
        let price = this.data.seckillprice
        let showPrice = (currentNum*price).toFixed(2)
        console.log(price,showPrice)
        this.setData({
            buyNumber: currentNum,
            price:showPrice
        })
     }
  },
  // 获取商品详情
  getGoodsInfo: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Seckill&method=GetGoodsDetail',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id: _this.data.shopId
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
           console.log(res.data)
            let goodsInfo = res.data.goodsDetail
            let id = goodsInfo.taskgoodsid //秒杀商品id
            let title = goodsInfo.title
            let seckillprice = goodsInfo.seckillprice
            let marketprice = goodsInfo.marketprice
            let thumbUrl = goodsInfo.thumbUrl
            let buyNumMax = goodsInfo.totalmaxbuy
            let roomid = goodsInfo.roomid
            let timeid = goodsInfo.timeid
            let taskid = goodsInfo.taskid
            let freight = goodsInfo.dispatchprice
            let param = goodsInfo.param
            for (var i = 0; i < thumbUrl.length; i++) {
              let img = thumbUrl[i]
              let url = img.substring(0,4)
              if (url != 'http') {
                thumbUrl[i] = app.globalData.imageUrl+img
              }
            }
            let goodsPicture = goodsInfo.thumbUrl[0]
            let description = goodsInfo.content //此处为富文本内容
            let countPrice = parseFloat(seckillprice)
            WxParse.wxParse('content', 'html', description, _this, 5);
            _this.setData({
              id:id,
              title:title,
              seckillprice:seckillprice,
              marketprice:marketprice,
              thumbList:thumbUrl,
              countPrice:countPrice,
              price:seckillprice,
              goodsPicture:goodsPicture,
              buyNumMax:buyNumMax,
              roomid:roomid,
              timeid:timeid,
              taskid:taskid,
              freight:freight,
              param:param
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

        }
      },
      fail: (res) => {
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
      phoneNumber: ''+app.globalData.customerMobile+'' // 仅为示例，并非真实的电话号码
    })
  },
  //取消底部弹窗
  close: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
  },
  //分享
  onShareAppMessage: function(res) {
    let _this = this
    return {
      title: ''+_this.data.title+'',
      path: '/pages/flash/index?Id='+_this.data.id+'',
      imageUrl:this.data.goodsPicture
    }
  },
  // 跳转回首页
  herfToIndex: function(){
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },
  //倒计时行为
  countDown(start,end){
    let _this = this
    start = parseInt(start)
    end = parseInt(end)
    _this.data.timer = setInterval(() => {
    start += 1000
    let count = end - start
    let hours = formatTime.formatNumber(parseInt(count / 1000 / 3600))
    let minutes = formatTime.formatNumber(parseInt((count-parseInt(hours)*1000*3600) / 1000/60 ))
    let seconds = formatTime.formatNumber(parseInt((count - parseInt(hours) * 1000 * 3600 - parseInt(minutes) * 1000 * 60) /1000))
      _this.setData({
        time: {
          hours: hours,
          minutes: minutes,
          seconds: seconds,
        }
      })
      if(hours==0 && minutes==0 && seconds==0){
        clearInterval( _this.data.timer)
        wx.navigateBack({
          delta:1
        })
      } 
    }, 1000)

  },
})
