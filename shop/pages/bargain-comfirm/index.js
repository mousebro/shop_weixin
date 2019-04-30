// pages/bargain-comfirm/index.js
const app = getApp()
const groupSuccessTimer = []
import formatTime from '../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isOrder:0, //通过此参数来判断是否是进入个人的分享页面 0为否 1为是
    nowPage:1, //
    actionSort:true,
    showMask:0,
    goodsId:244,
    productImg:'https://allnet-shop-cdn.91uda.com/images/1/2019/01/LZ4MzImVvTIPCvA544qJgDp4VtmZDS.jpg',
    title:'53度王子酒王子酒53度王子酒王子酒53度王子酒王子酒53度王子酒王子',
    canvasCodeImg:'',
    canvasProductImg:'https://allnet-shop-cdn.91uda.com/images/1/2019/01/LZ4MzImVvTIPCvA544qJgDp4VtmZDS.jpg',
    avatar:'https://allnet-shop-cdn.91uda.com/images/1/2018/12/NMjYV8t8tXAAYAi8v844WxQmAjmUoq.jpg',
    nickname:'喵咪酱',
    logo:'../../images/logo.png',
    saveProductImg:0,
    issaveCodeImg:0,
    showToast:0,
    doneBgImg:'/images/bargain/toast.png',
    bargainType:3,
    showMsg:'绘制中...',
    formArr:[]
  },

  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    let doneBgImg = wx.getFileSystemManager().readFileSync(this.data.doneBgImg,'base64')
    this.setData({
      doneBgImg:'data:image/jpg;base64,' + doneBgImg,
    })
    let isOrder = options.isBargain  || 0
    let scene = decodeURIComponent(options.scene) // 判断是否是扫小程序码进入的用户
    if (scene == 'undefined') {
      let orderid = options.orderId 
      if (orderid == undefined) {
         this.setData({
          orderid:orderid,
          imageUrl: app.globalData.imageUrl,
          isIpx:app.globalData.isIpx,
          isOrder:isOrder,
        })
      }
      else {
        this.setData({
          orderid:orderid,
          imageUrl: app.globalData.imageUrl,
          isIpx:app.globalData.isIpx,
          isOrder:isOrder,
        })
      }
    }
    else {
      let orderid = 0
      if(scene.length<16){
        orderid = scene
      }
      this.setData({
        orderid:orderid,
        imageUrl: app.globalData.imageUrl,
        isIpx:app.globalData.isIpx,
        isOrder:isOrder,
      })
    }
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
    this.getBargainDetail()
    
  
  },
  onShow:function(){
    this.getBargainProgress(function(){})
  },
  onHide:function(){
    clearInterval(groupSuccessTimer[0])
  },
  // 规则弹出层
  showModal(){
    let _this = this
    _this.setData({
      showModal:true,
      modal1:true
    })
  },
  hideModal(){
    let _this = this
    _this.setData({
      showModal:false,
      modal1:false
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
        'Content-Type': 'application/x-www-form-urlencoded',
        //'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            Succ(res)
          }
          else {
            Fail(res)
          }
        }else if (code == 1019) {
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
  /*倒计时*/
  countDown(end) {
      let _this = this
      let start = this.data.startTime  //将系统时间替换为开始时间
      let timer = null
      timer = setInterval(() => {
      start += 1
      let count = end - start
      let hours = formatTime.formatNumber(parseInt(count / 3600))
      let minutes = formatTime.formatNumber(parseInt((count - parseInt(hours) * 3600)/ 60))
      let secondeds = formatTime.formatNumber(parseInt((count - parseInt(hours) * 3600-parseInt(minutes)*60)))
      let timeList = {hours,minutes,secondeds}
      if(timeList.secondeds<0){
        if(_this.data.bargainType!=-3){
          _this.setData({
            bargainType:5
          })
        }
      }
      _this.data.timeList = timeList
      _this.setData({
        timeList:_this.data.timeList
      })
    }, 1000)
    return timer
  },
  //获取系统时间
  getSystemTime(){
    let _this = this
    let endTime = _this.data.bargainEndtime || 86400
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
    })
    _this.setHttpRequst('System','GetBaseInfo',Data,function(res){
      _this.setData({
        startTime:res.data.serverTimeStamp
      })
      endTime = endTime - res.data.serverTimeStamp
      groupSuccessTimer[0] = _this.countDown(res.data.serverTimeStamp + endTime)
    })
  },
  onShareAppMessage: function () {
    let _this = this
    let msg = _this.data.nickname + '@你！考验感情的时候到了！快来帮我砍价!'
    return {
      title: ''+msg+'',
      path: '/pages/bargain-comfirm/index?orderId='+_this.data.orderid+'',
      imageUrl:'https://allnet-shop-cdn.91uda.com/images/1/2019/03/ai76Va1Az9N9VIu77ws2BBuVi2k4aK.jpg'
    }
  },
  //获取砍价规则
  getBargainRule(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      id:_this.data.shopId
    })
    wx.request({
      url: `https://${app.globalData.productUrl}/api?resprotocol=json&reqprotocol=json&class=Bargain&method=GetRule`,
      method: 'post',
      data: Data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            _this.setData({
              introductioncontent:res.data.rule
            })        
          }
          else {
          }
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
  hrefToIndex(){
    wx.reLaunch({
      url: '/pages/index/index',
    })
  },
  //获取帮忙砍详情
  getBargainDetail(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    let orderid = _this.data.orderid
    let cookie = ''
    if (isLogin) {
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Bargain&method=HelpBargainDetail',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        orderid:orderid
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        console.log(code,'code')
        if (code == 1) {
          let detail =  res.data.detail
          console.log(detail)
          let bargainGoodsid = detail.bargainGoodsid
          let introduct = detail.introduct
          let labels = detail.labels 
          console.log(labels)
          let avatar = detail.avatar
          if(labels.length==0){
            labels = [{labelname:'限时抢购'},{labelname:'平台让利'}]
          }else if(labels.length == 1){
            labels.push({labelname:'限时抢购'})
          }else if(labels.length>2){
            labels = labels.slice(0,2)
          }
          let url = detail.image
          let img = url.slice(0,4)
          detail.newNickName = detail.nickname.slice(0,1)+'*'+detail.nickname.substr(detail.nickname.length - 1,1)
          detail.newBargainPrice = detail.bargainprice.split(".")
          
          if(img != 'http'){
            detail.image = app.globalData.imageUrl + url
          }
          let productImg = detail.image
          let isMyorder = res.data.isMyOrderNotPay || 0 //在有用户登录的情况下判断该分享是否是属于该用户的未支付订单 是的话传回1 否传0
          _this.setData({
            title:detail.title,
            goodsPicture:detail.image,
            bargainDetail:detail,
            shopId:bargainGoodsid,
            introduct:introduct,
            labels:labels,
            productImg:productImg,
            avatar:avatar,
            nickname:detail.nickname,
            bargainprice:detail.bargainprice,
            deleteprice:detail.deleteprice,
            isMyorder:isMyorder
          },function(){

            _this.getBargainRule()
            _this.getCarousel()
            wx.downloadFile({
              url:avatar,
              success:function(res){
                _this.setData({
                  avatar:res.tempFilePath
                })
                wx.downloadFile({
                  url:productImg,
                  success:function(res){
                    _this.setData({
                      productImg:res.tempFilePath,
                      saveProductImg:1
                    },function(){
                      _this.getGoodsShareInfo()
                      console.log('头像和商品图')
                    })
                  }
                })
              }
            })
            
          })
        }
        else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else{
        }
      },
      fail: (res) => {
      }
    })
  },
  //获取砍价商品下单成功轮播
  getCarousel(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      id:_this.data.shopId
    })
    
    _this.setHttpRequst('Bargain','GetCarousel',Data,function(res){
      let carouselList = res.data.carouselList
      for(let i in carouselList){
        let url = carouselList[i].avatar
        let img = url.slice(0,4)
        if(img != 'http'){
          carouselList[i].avatar = app.globalData.imageUrl + url
        }
        carouselList[i].newNickName = carouselList[i].nickname.slice(0,1)+'*'+carouselList[i].nickname.substr(carouselList[i].nickname.length - 1,1)
        carouselList[i].showprice = parseInt(carouselList[i].bargainprice)
      }
      _this.setData({
        carouselList:carouselList
      })
    },function(res){
      wx.showModal({
        title:'提示',
        content:res.data.baseServerInfo.msg,
        showCancel:false
      })
    })
  },
  //获取砍价商品进度详情
  getBargainProgress(suFn){
   
    let _this = this
    clearInterval(groupSuccessTimer[0])
    let orderid = _this.data.orderid
    let nowPage = _this.data.nowPage
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      orderid:orderid,
      page:nowPage,
      pageLength:10
    })
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Bargain&method=GetBargainDetail',
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
          let pageCount = res.data.pageCount
          let progress = res.data.progress
          let bargainEndtime =progress.bargainEndtime //距离结束时间
          let lastPrice = progress.price //基础价格
          let dispatchprice  = progress.dispatchprice 
          let bargainPrice  = progress.bargainPrice 
          let progressRate = (parseFloat(bargainPrice) / parseFloat(dispatchprice))*100
          let cutList = res.data.cutList //帮砍成员列表
          let payPrice =( parseFloat(dispatchprice) - parseFloat(bargainPrice)).toFixed(2)
         
          let doneBargainPrice = (parseFloat(dispatchprice) - parseFloat(bargainPrice)).toFixed(2)
          for(let i in cutList){
            let url = cutList[i].avatar  
            let img = url.slice(0,4)
            if(img != 'http'){
              cutList[i].avatar = app.globalData.imageUrl + url
            }
            cutList[i].newNickName = cutList[i].nickname.slice(0,1)+'*'+cutList[i].nickname.substr(cutList[i].nickname.length - 1,1)  
          }
          _this.setData({
            pageCount:pageCount,
            bargainEndtime:bargainEndtime,
            lastPrice:lastPrice,
            dispatchprice:dispatchprice,
            bargainPrice:bargainPrice,
            progressRate:progressRate,
            cutList:cutList,
            payPrice:payPrice,
            doneBargainPrice:doneBargainPrice
          },function(){
            _this.getSystemTime()
            suFn(res)
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
  //帮他砍价
  helpToBargain(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    let orderid = _this.data.orderid
    console.log(_this.data.formId,'fomrid',_this.data.formArr)
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      console.log('fdskdj')
    }else{
      wx.showLoading({
        mask:true,
        title: '帮砍进行中...'
      })
      wx.request({
        url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Bargain&method=DoBargain',
        method: 'post',
        data: JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
          id:_this.data.orderid,
          formid:_this.data.formId,
          formarr:_this.data.formArr
        }),
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
        },
        success: (res) => {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          wx.hideLoading()
          if (code == 1) {
            let type = res.data.bargainResult
           let showBargainPrice = res.data.price
            let title = ''
            // switch(type){
            //   case 1:
            //     title = '帮砍成功'
            //     break;
            //   case 4:
            //     title = '这是自己的订单'
            //     break;
            //   case 6:
            //     title = '已经帮砍过该订单'
            // }
            console.log(type,'type')
           if(type == 1){
            _this.setData({
              showToast:1,
              showBargainPrice:showBargainPrice
            })
           }else if(type==3){
            wx.navigateTo({
              url: '/pages/login/index'
            })
           }else if(type == 8){ //超过日期范围内砍价限制
            wx.showModal({
             title:'提示',
             content:'您本次活动帮砍已达到上限~',
             showCancel:false,
             success:function(res){}
            })
          }
           else if(type == 4){ //自己的订单
             wx.showModal({
              title:'提示',
              content:'这是自己的订单~',
              showCancel:false,
              success:function(res){}
             })
           }else if(type ==6){ //帮砍成功
            wx.showModal({
              title:'提示',
              content:'已帮砍过该订单~',
              showCancel:false,
              success:function(res){}
             })
           }else if(type==-2){
            wx.showModal({
              title:'提示',
              content:'帮砍失败~',
              showCancel:false,
              success:function(res){}
             })
           }else if(type == 2){
            wx.showModal({
              title:'提示',
              content:'您的今日帮砍已达到上限~',
              duration:1500,
              showCancel:false,
              success:function(res){
              }
             })
           }else if(type == 5){
            wx.showModal({
              title:'提示',
              content:'该砍价活动已过期~',
              duration:1500,
              showCancel:false,
              success:function(res){
              }
             })
           }else if(type == -1 || type==-3){
            wx.showModal({
              title:'提示',
              content:'该订单不存在~',
              duration:1500,
              showCancel:false,
              success:function(res){
              }
             })
           }
            _this.getBargainProgress(function(res){
              _this.setData({
                bargainType:type
              })
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
         
          wx.hideLoading()
        }
      })
    }
    

  },
  //付款
  goToPay(){
    let _this = this
    let orderid = _this.data.orderid
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Bargain&method=ConfirmPay',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        orderid:orderid,
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let flag = res.data.flag
          if(flag==1){
            _this.payfor(orderid)
          }else{
            wx.showModal({
              title:'提示',
              content:'购买成功',
              showCancel:false,
              function(){
                _this.setRedPoint(1)
                wx.redirectTo({
                  url: '/pages/bargain-pay-success/index?Id='+orderid+''
                })
              }
            })
          }
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
   // 订单支付
   payfor: function(orderId){
    let _this = this
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
        orderType:4
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        let payInfo = res.data
        wx.hideLoading()
        if (code == 1) {
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
        _this.setRedPoint(1)
        wx.reLaunch({
          url: '/pages/bargain-pay-success/index?Id='+orderId+''
        });
      },
      fail: function(res) {
      }
    })
  },
  // 支付失败回调
  cancelOrder: function(orderId){
    this.setRedPoint(0)
    
    // wx.redirectTo({
    //   url: '/pages/my-order-detail/index?Id='+orderId+''
    // });
  },
  //添加红点
  setRedPoint(type){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=RedPoint&method=UpdateRedPoint',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        type:type,
        show:1
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
        }
        else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else{
        }
      },
      fail: (res) => {
      }
    })
  },
  onReachBottom: function(){
    let _this = this
    let oldPage = this.data.nowPage
    let newPage = oldPage + 1
    this.setData({
      nowPage:newPage
    },function(){
      _this.getBargainProgress(function(){}) //下拉加载更多帮砍列表内容
    })
  },
  shareShop(){
    let _this = this
    _this.setData({
      actionSort: false
    })
  },
  //关闭分享弹窗
  closeShare(){
    let _this = this
    _this.setData({
      actionSort: true
    })
  },
  shareShopImg(){

  },
  hrefToBargainDetail(e){//跳转到详情页
    let _this = this
    wx.reLaunch({
      url: ''+'/pages/bargain-details/index?Id=' + _this.data.shopId + '',
    })
  },
  //关闭海报分享弹出窗
  closeMask(){
    let _this = this 
    _this.setData({
      showMask:0
    })
   },
   //打开海报分享弹出窗
   showMask(){
     let _this = this
     _this.setData({
       showMask:1
     })
   },
   // 获取海报信息
   getGoodsShareInfo: function(){
     let _this = this
    //  wx.showLoading({
    //    mask:true,
    //    title: '绘制海报中...'
    //  })
     wx.request({
       url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsShareQR',
       method: 'post',
       data: JSON.stringify({
         baseClientInfo: { longitude: 0, latitude: 0,appId: ''+app.globalData.appId+''},
         goodsid:0,
         orderid:_this.data.orderid,
         path:'pages/bargain-comfirm/index'
       }),
       header: {
         'Content-Type': 'application/x-www-form-urlencoded',
         //'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
       },
       success: (res) => {
         let code = res.data.baseServerInfo.code
         let msg = res.data.baseServerInfo.msg
         if (code == 1) {
           let miniPicture = res.data.qrurl     // 获取小程序
           _this.setData({
             codeImg:miniPicture,
           })
            wx.downloadFile({
              url: _this.data.codeImg,//注意公众平台是否配置相应的域名
              success: function (res) {
                //wx.hideLoading()
                
                _this.setData({
                  canvasCodeImg:res.tempFilePath,
                  issaveCodeImg:1,
                  showMsg:'保存'
                },function(){
                  _this.drawImage()
                  console.log('保存二维吗图片成功')
                 // 
                })
              }
            })
         }
         else{
           _this.setData({
             issaveImg:0
           })
           
         }
       },
       fail: (res) => {
         wx.hideLoading()
       }
     })
   },
   openPoster(){
    let _this = this
    _this.setData({
      showMask:true,
      actionSort:true
    })
   },
   drawImage:function(){
     let _this = this
     _this.setData({
      actionSort:true
    })

     let productImg = _this.data.productImg
     let rate = 2
     const ctx = wx.createCanvasContext('firstCanvas')
     ctx.save()
     ctx.setFillStyle('#fff') //白色底图
     ctx.fillRect(0, 0, 375*rate, 667*rate)
     ctx.restore()
     ctx.save()
     ctx.setFillStyle('#fff') //白色底图
     ctx.fillRect(15 * rate,100 * rate,345 * rate,527 * rate)
     ctx.drawImage(productImg, 15 * rate, 100 * rate, 340 * rate, 340 * rate) //商品图
     ctx.restore()
     //头像
     ctx.save();
     ctx.beginPath(); //开始绘制
     ctx.arc((40 / 2 + 20)*rate, (40 / 2 + 20)*rate, (40 / 2) * rate, 0, Math.PI * 2, false);
     ctx.setStrokeStyle('#fff')
     ctx.stroke()
     ctx.clip(); 
     ctx.drawImage(_this.data.avatar, 20*rate, 20 *rate, 40 *rate, 40 * rate);
     ctx.restore()
     ctx.draw()
     //商城logo
     ctx.drawImage(_this.data.logo,285 * rate,30 * rate,70 *rate,30 *rate)
 
    //  //标语
     ctx.setFontSize(15 * rate)
     ctx.setFillStyle('#777777')
     ctx.fillText(`"${_this.data.introduct}"`, 15*rate,80*rate, 300*rate);
     //用户名称
     let nickname = _this.data.nickname + '推荐'
     ctx.setFontSize(16*rate)
     ctx.setFillStyle('#222222')
     ctx.fillText(nickname, 70*rate,48*rate, 300*rate);
     //处理文字 title
     let title = _this.data.title
     if(title.length>32){
      title = title.substring(0,31) + '...'
    }
     let fontArr = title.split("")
     let temp = ''
     let row = []
     ctx.setFontSize(20*rate)
     for(let i=0;i<fontArr.length;i++){
       if (ctx.measureText(temp).width < 340*rate && i!=(fontArr.length - 1)) {
         temp += fontArr[i];
       }
       else {
         if(i==(fontArr.length - 1)){
           temp += fontArr[i]
         }
         row.push(temp);
         temp = "";
       }
     }
     for(let i in row){
       ctx.setFillStyle('#222222')
       ctx.fillText(row[i], 15*rate,(470 + i * 30)*rate, 340*rate);
     }
     ctx.restore()
     //判断商品标题的行数，以下偏移内容只有一行的话在原有基础上减去一个字体高度
     let toffTop = 0
     if(row.length <=1 ){
       toffTop = 40*rate
     }
     //自定义标签 （取两个）
     ctx.beginPath()
     ctx.save()
     ctx.setStrokeStyle('#ea4149')
     ctx.setFillStyle('#ea4149')
     ctx.setFontSize(12 * rate)
     ctx.fillText(`${_this.data.labels[0].labelname}`, 20*rate,540*rate, 300*rate);
     ctx.rect(15 * rate,526 * rate,ctx.measureText(`${_this.data.labels[0].labelname}`).width +10*rate, 18*rate)
    
     ctx.stroke()
     ctx.restore()
     ctx.closePath()
     
     ctx.beginPath()
     ctx.save()
     ctx.setStrokeStyle('#ff8046')
     ctx.setFontSize(12 * rate)
     ctx.setFillStyle('#ff8046')
     ctx.fillText(`${_this.data.labels[1].labelname}`, (ctx.measureText(`${_this.data.labels[0].labelname}`).width +40*rate),540*rate, 300*rate);
     ctx.rect((ctx.measureText(`${_this.data.labels[0].labelname}`).width +35*rate),526 * rate,ctx.measureText(`${_this.data.labels[1].labelname}`).width +10*rate , 18*rate)
     
     ctx.stroke()
     ctx.restore()
     ctx.closePath()
     //文字，价格 现价
     
     ctx.save()
    ctx.beginPath()
     
     ctx.setFillStyle('#f03d43')
     let bargain = _this.data.bargainprice.split('.')
     ctx.setFontSize(22*rate)
     ctx.fillText(`￥`, 15*rate,580*rate , 300*rate);
     let widthA = ctx.measureText('￥').width
     ctx.setFontSize(32*rate)
     ctx.fillText(`${bargain[0]}`, 15*rate+ widthA,580*rate , 300*rate); //现价
     let widthB = ctx.measureText(`${bargain[0]}`).width
     ctx.setFontSize(22 * rate)
     ctx.fillText(`.${bargain[1]}`, 15*rate + widthA +widthB,580*rate  , 300*rate);
     //判断市场价价文字长度再做偏移处理（千、百、十）
     
     ctx.setFontSize(16 * rate)
     ctx.setFillStyle('#7d7d7d')
     let mpLength = _this.data.mpLength
     ctx.fillText(`￥${_this.data.deleteprice}`,15 * rate,600 * rate , 300*rate);//原价
     ctx.moveTo(15 * rate,595 * rate )
     ctx.lineTo(15* rate + ctx.measureText(`￥${_this.data.deleteprice}`).width,595 * rate )
     ctx.stroke()
     ctx.restore()
     ctx.closePath()
     //二维码
     ctx.drawImage(_this.data.canvasCodeImg, 275*rate, 510*rate, 80*rate, 80*rate) //二维码
     ctx.setFontSize(12*rate)
     ctx.setFillStyle('#7d7d7d')
     ctx.fillText('长按识别小程序购买',255*rate,615*rate,300 * rate);
     ctx.restore()
     ctx.setStrokeStyle("#fff")
     ctx.draw(true,function(){
       console.log('开始绘制')
       //_this.toLocalImage()
     })
     
   },
   //把画布导出成图片保存
   toLocalImage() {
     let _this = this;
     if(_this.data.saveProductImg==0 || _this.data.issaveCodeImg == 0){
      wx.showModal({
        title:'提示',
        content:'获取二维码失败',
        showCancel:false,
        success:function(res){
          return;
        }
      })
      return
    }else if(_this.data.issaveCodeImg==1){
      _this.setData({
        issaveCodeImg:0,
        showMsg:'保存中...'
      })
      wx.showLoading({
        title:'保存中'
      })
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: 750,
        height: 1334,
        destWidth: 1500,
        destHeight: 2668,
        quality:1,
        canvasId: 'firstCanvas',
        success: function (res) {
          wx.hideLoading()
          wx.saveImageToPhotosAlbum({
            filePath: res.tempFilePath,
            success(res) {
              console.log('绘制成功');
              wx.showToast({
                title: '图片已保存',
                icon: 'success',
                duration: 2000
              })
              _this.setData({
                showMsg:'保存',
                isshowing:1,
                issaveCodeImg:1
              })
            },
            fail(res){
              _this.setData({
                showMsg:'保存',
                isshowing:1,
                issaveCodeImg:1
              })
            }
          })
        }
      })
    }

   },
  // 关闭添加小程序提示
  closeAddtips:function(){
    let _this = this
    _this.setData({
      showAddTips:false
    })
    wx.setStorageSync('showAddTips', false)
  },
  closeToast(){//关闭弹出框
    this.setData({
      showToast:0
    })
  },
  formSubmit(e){ //获取formId用户模板消息
    let _this = this
    let formId = e.detail.formId
    let formArr = this.data.formArr
    formArr.push(formId)
    this.setData({
      formId:formId,
      formArr:formArr
    })
  },
})