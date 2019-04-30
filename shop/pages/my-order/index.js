// pages/my-order/index.js
var app = getApp()
import formatTime from '../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList:[],
    navbar: ['全部','待付款','待分享', '待发货', '待收货','已完成'],
    currentTab: 0,
    nowStatus:-2,
    page:1,
    pageCount:0,
    isshare:1,
    scrollLeft:0,
    menuMsg:'导航',
    opacity:0,
   },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let menuNum = [{imageUrl:'/images/shop-detail/gold.png'},{imageUrl:'/images/shop-detail/sort.png'},{imageUrl:'/images/shop-detail/mine.png'},{imageUrl:'/images/shop-detail/index.png'},]

    this.setData({
      menuNum:menuNum
    })
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let currentTab = parseInt(options.status) 
    let screenLeft = this.data.scrollLeft
    let nowStatus = -2
    switch(currentTab){
      case 0:
      currentTab = 1
      nowStatus = 0
      screenLeft = 60
      break;
      case 1:
      currentTab = 3
      nowStatus = 1
      screenLeft = 120
      break
      case 2:
      currentTab = 4
      nowStatus = 2
      screenLeft = 150
      break
      case 3:
      currentTab = 5
      nowStatus = 3
      screenLeft = 250
      break
      case 4:
      currentTab = 2
      nowStatus = 0
      screenLeft = 80
    }
    this.setData({
      currentTab:currentTab || 0,
      nowStatus:nowStatus,
      scrollLeft:screenLeft
    })
    this.GetRedPointOfUser()
  },
  onShow:function(options){
    this.getOrderList()
  },
  /*用户点击顶部导航进行选项卡切换,并请求对应的数据*/
  handleChose: function (e){
    let _this = this
    let idx = e.currentTarget.dataset.idx
    let nowStatus = 0
    if(idx == 0 ){
        nowStatus = -2
        _this.UpdateRedPoint(-1,0)
    }else if(idx == 1){
      nowStatus = 0
      _this.UpdateRedPoint(0,0)
    }else if(idx ==2){
      _this.UpdateRedPoint(4,0)
      this.setData({
        success:0 //判断是否成功拼团
      })
    }else if(idx == 3){
      _this.UpdateRedPoint(1,0)
      nowStatus = 1
    }else if(idx == 4){
      _this.UpdateRedPoint(2,0)
      nowStatus = 2
    }else if(idx == 5){
      _this.UpdateRedPoint(3,0)
      nowStatus = 3
    } 
    if(idx!=2){
      this.setData({
        success:-1 
      })
    }
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      nowStatus: nowStatus
    })
    this.getOrderList()
  },
  /*点击更多*/
  handleClick(e){
    let orderId = e.currentTarget.dataset.orderid //获取订单Id
    let orderType = e.currentTarget.dataset.ordertype
    let isteam = e.currentTarget.dataset.isteam
    let success = e.currentTarget.dataset.success
    let status = e.currentTarget.dataset.status
    if(orderType == 4 && status==0){
      wx.navigateTo({
        url: ''+'/pages/bargain-comfirm/index?isBargain=1&orderId='+orderId +'',
      })
    }else{
      wx.navigateTo({
        url: '/pages/my-order-detail/index?Id='+orderId+'&type='+orderType+'&isteam='+isteam+'&isSuccess='+success
      })
    }

  },
  /*加载订单列表*/
  getOrderList(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index',
      })
      wx.setStorage({
        key: 'isLogin',
        data: false
      })
    }
    let waitShare = 0
    if(_this.data.currentTab == 2){
      waitShare = 1
    }
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      page:_this.data.page,
      pageLength:10,
      status: _this.data.nowStatus,
      success:_this.data.success,
      waitShare:waitShare
    })
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=GetOrderList',
      method: 'post',
      data:data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let list = []
          list = res.data.orderList
          for(var i in list){
            list[i].totalCount = 0
            let orderGoodsList = list[i].orderGoodsList
            for (var j = 0; j < orderGoodsList.length; j++) {
              let img = orderGoodsList[j].thumb
              let url = img.substring(0,4)
              if (url != 'http') {
                orderGoodsList[j].thumb = app.globalData.imageUrl+img
              }
            }
            for(let len=0 ;len< list[i].orderGoodsList.length ; len++){
              list[i].totalCount += parseInt(list[i].orderGoodsList[len].total)
            }
          }
          _this.getTimes(list)
          _this.setData({
            orderList:list,
            pageCount:res.data.pageCount
          })

        }else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }else {
          console.log(res.msg)
        }

      },
      fail: (res) => {
      }
    })
  },
  /*待发货-去付款*/
  gotoPay(e) {
    let orderId = e.currentTarget.dataset.orderid //获取订单Id
    wx.navigateTo({
      url: '/pages/pay/index?Id='+orderId
    })
  },
  //进行时间戳转换
  getTimes(list){
    if(list.length == 0)return
    for(var i in list){
      let date = new Date(list[i].createtime*1000)
      list[i].newCreatetime = formatTime.formatTime(date)
      list[i].orderPList
    }
  },
  onReachBottom(){
    this.setData({
        page: ++this.data.page
    })
    this.getOrderList()
  },
  /*取消订单*/
  cancleOrder(e){
    let _this = this
    let formid = _this.data.formId
    let orderType = e.currentTarget.dataset.ordertype
    if(orderType == 2){
      var url = 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=ShopGroups&method=CancelGroupOrder'
    }else{
      
      var url = 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=CancelOrder'
    }
    let orderId = e.currentTarget.dataset.orderid //获取订单Id
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index',
      })
      wx.setStorage({
        key: 'isLogin',
        data: false
      })
    }
    wx.showModal({
      title: '提示',
      content: '确认取消订单',
      showCancel:true,
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: url,
            method: 'post',
            data: JSON.stringify({
              baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
              id:orderId,
              formid:formid
            }),
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
            },
            success: (res) => {
              let code = res.data.baseServerInfo.code
              let msg = res.data.baseServerInfo.msg
              if (code == 1) {
                _this.getOrderList()
              }else if (code == 1019) {
                wx.navigateTo({
                  url: '/pages/login/index'
                })
              }else {
                wx.showModal({
                  title:'提示',
                  content:res.data.baseServerInfo.msg,
                  showCancel:false,
                  success:function(res){
                    _this.getOrderList()
                  }
                })
              }

            },
            fail: (res) => {
            }
          })
        }
        else if (res.cancel) {
        }
      }
    })
  },
  // 提交生成订单 -去支付
  payfor: function(e){
    let _this = this
    let orderId = e.currentTarget.dataset.orderid
    let orderType = e.currentTarget.dataset.ordertype
    if(orderType == 4){
      wx.request({
        url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Bargain&method=ConfirmPay',
        method: 'post',
        data: JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
          orderid:orderId,
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
              _this.gotoPayFor(orderId,orderType)
            }else{
              wx.showModal({
                title:'提示',
                content:'购买成功',
                showCancel:false,
                function(){
                  _this.setRedPoint(1)
                  _this.getOrderList()
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
    }else{
      orderType = orderType==2?2:1
      _this.gotoPayFor(orderId,orderType)
    }
   


  },
  gotoPayFor(orderId,orderType){
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
        _this.getOrderList()
      },
      fail: function(res) {

      }
    })
  },
  // 支付失败回调
  cancelOrder: function(orderId){
    let _this = this
    _this.getOrderList()
  },
  //确认收货
  comfiremFn(e){
    let _this = this
    let orderId = e.currentTarget.dataset.orderid //获取订单Id
    let type = e.currentTarget.dataset.ordertype
    let isLogin = wx.getStorageSync('isLogin')
    let formid = _this.data.formId

    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index',
      })
      wx.setStorage({
        key: 'isLogin',
        data: false
      })
    }
    if(type == 2){//团购商品
      var url = 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopGroups&method=ConfirmReceipt'
     }else{
      var url = 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Order&method=ConfirmReceipt'
     }
    wx.showModal({
      title: '提示',
      content: '确认收货',
      showCancel:true,
      success:function(res){
        if(res.confirm){
          wx.request({
            url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Order&method=ConfirmReceipt',
            method: 'post',
            data: JSON.stringify({
              baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
              id:orderId,
              formid:formid
            }),
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
            },
            success: (res) => {
              let code = res.data.baseServerInfo.code
              let msg = res.data.baseServerInfo.msg
              if (code == 1) {
                _this.UpdateRedPoint(3,1)
                _this.getOrderList()
              }else if (code == 1019) {
                wx.navigateTo({
                  url: '/pages/login/index'
                })
              }else {
                wx.showToast({
                  title:msg,
                  image:'/images/nomore.png'
                })
              }
            },
            fail: (res) => {
            }
          })
        }
      }
    })
  },
  //更改用户红点信息
  UpdateRedPoint:function(type,show) {
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return false;
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=RedPoint&method=UpdateRedPoint',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        type:type,
        show:show
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
          // wx.setStorageSync('isLogin', false)
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
  formSubmit(e){ //获取formId用户模板消息
    let formId = e.detail.formId
    this.setData({
      formId:formId
    })
  },
  //获取用户红点信息
  GetRedPointOfUser:function(e) {
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
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=RedPoint&method=GetRedPointOfUser',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let redpointArr = res.data.redpoint
          let allstatus = 1
          for(let i in redpointArr){
            allstatus = parseInt(redpointArr[i].show) && allstatus
          }
          _this.setData({
            allstatus:allstatus,
            redpoint:res.data.redpoint
          })
          wx.hideLoading()
        }
        else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
          // wx.setStorageSync('isLogin', false)
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
  //打开全局菜单
  openMenu(){
    let _this = this
    let menuNum = this.data.menuNum
    let isOpenMenu = this.data.isOpenMenu
    let showMadal = _this.data.showModal || false
    if(!isOpenMenu){
      for(let i in menuNum){
        i = parseInt(i) 
        let deg = 180
        menuNum[i].xL = (-80*Math.cos(deg/(menuNum.length-1)*(Math.PI/180)*i) || 0).toFixed(2)
        menuNum[i].yL = (-80*Math.sin(deg/(menuNum.length-1)*(Math.PI/180)*i) || 0).toFixed(2)
      }
      this.setData({
        opacity:1,
        menuMsg:'收起'
      })
    }else{
      for(let i in menuNum){
        i = parseInt(i)
        menuNum[i].xL = 0
        menuNum[i].yL = 0
      }
      this.setData({
        opacity:0,
        menuMsg:'导航'
      })
    }
    this.setData({
      menuNum:menuNum,
      isOpenMenu:!isOpenMenu,
      showModal:!showMadal
    })
  },
  hiddenMask(){
    let _this = this
    let menuNum = this.data.menuNum
    let isOpenMenu = this.data.isOpenMenu
    let showMadal = _this.data.showModal || 0
    if(isOpenMenu){
      for(let i in menuNum){
        i = parseInt(i)
        menuNum[i].xL = 0
        menuNum[i].yL = 0
      }
      _this.setData({
        opacity:0,
        menuMsg:'导航',
        menuNum:menuNum,
        isOpenMenu:!isOpenMenu,
        showModal:!showMadal
      })
    }
  },
  hrefToPage(e){
    let type = e.currentTarget.dataset.type
    switch(type){
      case 3:
      wx.reLaunch({
        url: '/pages/index/index',
      })
      break;
      case 2:
      wx.reLaunch({
        url: '/pages/mine/index',
      })
      break;
      case 1:
      wx.reLaunch({
        url: '/pages/shop-list/index',
      })
      break;
      case 0:
      wx.reLaunch({
        url: '/pages/shopping-gold/index',
      })
      break;
    }
     
    if(type == 1){

    }
  },
})
