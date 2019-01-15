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
    overDueImg:"/images/discount/overdue.png",
    imgUrl:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    //对本地背景图片编译
    let usedImg = wx.getFileSystemManager().readFileSync(_this.data.usedImg,'base64')
    let overDueImg = wx.getFileSystemManager().readFileSync(_this.data.usedImg,'base64')
    this.setData({
      usedImg:'data:image/jpg;base64,' + usedImg,
      overDueImg:'data:image/jpg;base64,' + overDueImg
    })
    _this.getCouponList()
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
    imgUrl = index == 1?'':imgUrl
    imgUrl = index == 2?this.data.usedImg:imgUrl
    imgUrl = index == 3?this.data.overDueImg:imgUrl
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

  },
  // 获取优惠券列表
  getCouponList:function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopCoupon&method=UserCouponList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        page:1,
        pageLength:100,
        status:_this.data.isChose,
        isPage:false
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
          let couponList = res.data.couponList
          for(var i in couponList){
            let start= new Date(couponList[i].timestart*1000)
            let startTime = [start.getFullYear(),start.getMonth()+1,start.getDate()]
            let end = new Date(couponList[i].timeend*1000)
            let endTime = [end.getFullYear(),end.getMonth()+1,end.getDate()]
            couponList[i].startTime = startTime.join(".")
            couponList[i].endTime = endTime.join(".")
            couponList[i].newDeduct = couponList[i].deduct.split('.')
          }
          _this.setData({
            choseCoupon:false,
            couponList:couponList
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
    // let couponList = [{id:1,couponname:'满减50优惠券',deduct:'50',enough:'1000',backtype:0,timelimit:1,timestart:'2019.1.1',timeend:'2019.1.10'},{id:2,couponname:'95折折扣券',discount:'9.5',enough:'0',backtype:1,beginTime:'2019.1.1',endTime:'2019.1.10'}]
  },
})