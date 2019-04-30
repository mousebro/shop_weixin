// pages/present-card/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isChose:1,
    currentPage:1,
    showMask:false,
    doneBgImg:'/images/receive-coupon-center/done.png',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getPresentList()
    //对本地背景图片编译
    let doneBgImg = wx.getFileSystemManager().readFileSync(this.data.doneBgImg,'base64')
    this.setData({
      imgUrl:'data:image/jpg;base64,' + doneBgImg
    })
  },
  //头部选项卡点击事件
  handleTap(e){
    let index = e.target.dataset.idx//判断头部哪一个被点击，并获取其下标值
    this.setData({
      isChose:index,
      currentPage:1,
    })
    //根据选项卡来请求不同的数据
    let _this = this
    _this.getPresentList()
  },
  //打开详情下拉
  openResponse(e){
    let _this = this
    let presentList = this.data.presentList
    let openResponse = e.currentTarget.dataset.op || 0
    let idx = e.currentTarget.dataset.idx
    presentList[idx].openResponse = !openResponse
    this.setData({
      presentList:presentList
    })
  },
  //兑换框输入
  bindKeyInput(e){
    this.setData({
      code:e.detail.value
    })
  },
  //兑换换获得焦点时兑换按钮更换样式
  changeBtnStyle(){
    this.setData({
      inputFocus:true
    })
  },
  //兑换礼品卡
  redeemPresent(){
    let _this = this
    let code = _this.data.code
 
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      code:code
    })
    _this.setHttpRequst('Redeem','DoRedeem',data,function(res){
      let couponList = res.data.couponList
      let presentList = res.data.presentList
      for(let i in presentList){
        presentList[i].priceArr = presentList[i].cost.split(".") //价值金额
        if(presentList[i].priceArr[1] == '00'){
          presentList[i].priceArr.splice(1,1)
        }
        presentList[i].openResponse = 0 //是否关闭说明 0为关闭 1为开启
        let startDate = new Date(parseInt(presentList[i].timestart)*1000)
        let endDate = new Date(parseInt(presentList[i].timeend)*1000)
        presentList[i].newStartTime = startDate.getFullYear() + '.' + (startDate.getMonth() + 1) + '.' + startDate.getDate()
        presentList[i].newEndTime = endDate.getFullYear() + '.' + (endDate.getMonth() + 1) + '.' + endDate.getDate()
      }
      for(var i in couponList){
        let start= new Date(couponList[i].timestart*1000)
        let startTime = [start.getFullYear(),start.getMonth()+1,start.getDate()]
        let end = new Date(couponList[i].timeend*1000)
        let endTime = [end.getFullYear(),end.getMonth()+1,end.getDate()]
        couponList[i].startTime = startTime.join(".")
        couponList[i].endTime = endTime.join(".")
      couponList[i].newDeduct = couponList[i].deduct.split('.')
      couponList[i].discount = couponList[i].discount.slice(0,3)
      couponList[i].enough = couponList[i].enough.split(".")[0]
      couponList[i].limitMsg = 0 //是否显示商品提示下拉框
    }
      _this.setData({
        presentListSucc:presentList,
        couponListSucc:couponList,
        showMask:true
      })
      if(res.data.presentList.length){
        _this.getPresentList()
      }
    },function(){
      console.log('兑换失败了')
      wx.showModal({ //兑换失败提示
        content:res.data.baseServerInfo.msg,
        showCancel:false,
        mask:true
      })
    })
  },
  //获取礼品列表
  getPresentList(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      selectType:_this.data.isChose,
      page:_this.data.currentPage,
      pageLength:5
    })
    _this.setHttpRequst('Present','GetPresentList',data,function(res){
      
      let presentList = res.data.presentList
      for(let i in presentList){
        presentList[i].priceArr = presentList[i].cost.split(".") //价值金额
        if(presentList[i].priceArr[1] == '00'){
          presentList[i].priceArr.splice(1,1)
        }
        presentList[i].openResponse = 0 //是否关闭说明 0为关闭 1为开启
        let startDate = new Date(parseInt(presentList[i].timestart)*1000)
        let endDate = new Date(parseInt(presentList[i].timeend)*1000)
        presentList[i].newStartTime = startDate.getFullYear() + '.' + (startDate.getMonth() + 1) + '.' + startDate.getDate()
        presentList[i].newEndTime = endDate.getFullYear() + '.' + (endDate.getMonth() + 1) + '.' + endDate.getDate()
      }
      _this.setData({
        presentList:res.data.presentList,
        pageCount:res.data.pageCount 
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
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
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
        wx.showModal({ //兑换失败提示
          content:res.data.baseServerInfo.msg,
          showCancel:false,
          mask:true
        })
      }
    })
  },
  onReachBottom(){
    if(this.data.showMask)return
    let currentPage = this.data.currentPage
    let pageCount = this.data.pageCount
    let _this = this
    if(currentPage<pageCount){
      this.setData({
        currentPage:currentPage + 1
      },function(){
        _this.getPresentList()
      })
    }else{
      wx.showToast({
        image:'/images/nomore.png',
        title:'没有更多了~'
      })
    }
  },
  //关闭弹窗
  closeMask(){
    this.setData({
      showMask:false
    })
  }
})