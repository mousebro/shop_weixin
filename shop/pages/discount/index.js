// pages/discount/index.js
const app = getApp()
import formatTime from '../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isChose:1,
    usedImg:"/images/discount/used.png",
    doneBgImg:'/images/receive-coupon-center/done.png',
    imgUrl:'',
    currentPage:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    //对本地背景图片编译
    let usedImg = wx.getFileSystemManager().readFileSync(_this.data.usedImg,'base64')
    let doneBgImg = wx.getFileSystemManager().readFileSync(this.data.doneBgImg,'base64')
    this.setData({
      usedImg:'data:image/jpg;base64,' + usedImg,
      doneBgImg:'data:image/jpg;base64,' + doneBgImg,
      imgUrl:'data:image/jpg;base64,' + doneBgImg
    })
    _this.getCategory()//获取分类列表
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  //头部选项卡点击事件
  handleTap(e){
    this.setData({
      couponList:[]
    })
    let index = e.target.dataset.idx//判断头部哪一个被点击，并获取其下标值
    let imgUrl = ''
    imgUrl = index == 1?this.data.doneBgImg:imgUrl
    imgUrl = index == 2?this.data.usedImg:imgUrl
    imgUrl = index == 3?this.data.usedImg:imgUrl
    this.setData({
      isChose:index,
      currentPage:1,
      imgUrl:imgUrl
    })
    //根据选项卡来请求不同的数据
    let _this = this
    _this.getCouponList()
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getCouponList()
  },
  // 获取优惠券列表
  getCouponList:function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return
    }
    wx.showLoading({
      title:'加载中~',
      icon:'loading'
    })
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopCoupon&method=UserCouponList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        page:_this.data.currentPage,
        pageLength:10,
        status:_this.data.isChose,
        isPage:false
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        wx.hideLoading()
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        wx.hideLoading()
        if (code == 1) {
          let couponList = res.data.couponList
          console.log(couponList)
          let pageCount = res.data.pageCount
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
            choseCoupon:false,
            couponList:couponList,
            pageCount:pageCount
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
    // let couponList = [{id:1,couponname:'满减50优惠券',deduct:'50',enough:'1000',backtype:0,timelimit:1,timestart:'2019.1.1',timeend:'2019.1.10'},{id:2,couponname:'95折折扣券',discount:'9.5',enough:'0',backtype:1,beginTime:'2019.1.1',endTime:'2019.1.10'}]
  },
  onReachBottom:function(e){
    let currentPage = this.data.currentPage
    let pageCount = this.data.pageCount
    let _this = this
    if(currentPage<pageCount){
      this.setData({
        currentPage:currentPage + 1
      },function(){
        _this.getCouponList()
      })
    }else{
      wx.showToast({
        image:'/images/nomore.png',
        title:'没有更多了~'
      })
    }
  },
  //根据优惠券的商品id、分类id等进行页面条状
  hrefToPageDetail(e){
    let detail = e.currentTarget.dataset
    let limitgoodcatetype = detail.limitgoodcatetype //是否限制商品分类id
    let limitgoodtype = detail.limitgoodtype //是否限制商品分类id
    let limitgoodids = detail.limitgoodids //商品id逗号隔开
    let limitgoodcateids = detail.limitgoodcateids //商品分类id逗号隔开
    if(limitgoodtype){
      let goodsidArr = limitgoodids.split(",") 
      wx.navigateTo({
        url: '/pages/shop-detail/index?Id=' + goodsidArr[0], //如果有多个商品id默认跳转到第一个
      })
    }else if(limitgoodcatetype){
      wx.navigateTo({
        url: '/pages/shop-list/index',
      })
    }else{
      wx.reLaunch({
        url: '/pages/index/index',
      })
    }
  },
  // 获取分类列表
  getCategory: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Shop&method=GetCategory',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let categoryListArr = []
            let categoryList = res.data.categoryList
            for(let a of categoryList){
              categoryListArr.push(a.id)
            }
            console.log(categoryList)
            console.log(categoryListArr)
          }
          else{
          }
      },
      fail: (res) => {
      }
    })
  },
  //打开下拉限制商品下拉列表
  openLimitMesg(e){
    let couponList = this.data.couponList
    let idx = e.currentTarget.dataset.idx
    let limitMsg = couponList[idx].limitMsg
    couponList[idx].limitMsg = !limitMsg
    this.setData({
      couponList:couponList
    })
  },
  //兑换框输入
  bindKeyInput(e){
    this.setData({
      code:e.detail.value,
      inputFocus:false
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
      wx.showModal({ //兑换成功提示
        content:res.data.baseServerInfo.msg,
        showCancel:false,
        mask:true
      })
      if(res.data.presentList.length){
        _this.getPresentList()
      }
    },function(){
      wx.showModal({ //兑换失败提示
        content:res.data.baseServerInfo.msg,
        showCancel:false,
        mask:true
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
})