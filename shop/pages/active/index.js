// pages/active/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    couponList:[{id:1}],
    usedBgImg:'/images/receive-coupon-center/received.png',
    doneBgImg:'/images/receive-coupon-center/done.png',
    mould:1,// 选择哪一种模板，红色为1 黑色为2
    frontPictureVar:'?x-oss-process=image/resize,w_750,limit_1', //对图片进行压缩 自定义入口bannertu
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    wx.setNavigationBarTitle({ //动态设置标题（以及主题颜色）
      title: '我是一个活动页' 
    })

    if(_this.data.mould == 1){
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#c42c1a',
      });
      _this.setData({
        indicatorColor:'#ea4149'
      })
    }else{
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#030200',
      });
      _this.setData({
        indicatorColor:'#c8b06e'
      })
    }
    //优惠券对象
    let couponObj = {}
    couponObj.mould = _this.data.mould  //选择哪一种模板，红色为1 黑色为2
    couponObj.redTicket = '../../images/receive-coupon-center/coupon.png' //红色优惠券图标
    couponObj.blackTicket = '../../images/active/tickt.png' //黑色地图优惠券图标
    couponObj.blackStamp = '../../images/active/receiveB.png' //黑色主题已领取邮戳
    couponObj.redStamp = '../../images/active/receive.png' //红色主题已领取邮戳

    couponObj.blackBgcoupon1 = 'https://allnet-shop-cdn.91uda.com/images/1/2019/04/K5tWI7ZaV78J0WWxI00CrrtKXrSzU8.png'
    couponObj.redBgcoupon1 = 'https://allnet-shop-cdn.91uda.com/images/1/2019/04/sOnEK6iir3wIoiS03SmZKsMIzKbOWs.png'
    couponObj.usedBgImg = 'https://allnet-shop-cdn.91uda.com/images/1/2019/04/sOnEK6iir3wIoiS03SmZKsMIzKbOWs.png'
    couponObj.doneBgImg = 'https://allnet-shop-cdn.91uda.com/images/1/2019/04/J7L78GZ6Yt7xsjA7R7QGR7cK4R8QZ7.png'
    couponObj.redBgcoupon2 = 'https://allnet-shop-cdn.91uda.com/images/1/2019/04/mVQPPjGfGV62Qgtbg13zQQq2ZQh70p.png' //红色背景一行两列背景
    couponObj.redBgcoupon3 = 'https://allnet-shop-cdn.91uda.com/images/1/2019/04/X1HfdH6r1KhM4hWmmjMmmkf6yLR6Uw.png' //红色背景一行3列背景
    couponObj.blackBgcoupon2 = 'https://allnet-shop-cdn.91uda.com/images/1/2019/04/UU4qDjD894P442vPdMud4J09ld4929.png' //黑色背景一行两列背景
    couponObj.blackBgcoupon3 = 'https://allnet-shop-cdn.91uda.com/images/1/2019/04/mhcEncNZ9CKYhynnqnehhCPP3Yychq.png' //黑色背景一行3列背景

    //商品对象
    let goodsObj = {}
    goodsObj.mould = _this.data.mould  //选择哪一种模板，红色为1 黑色为2

    //活动专场对象
    let specialObj = {}
    specialObj.mould = _this.data.mould
    _this.setData({
      couponObj:couponObj,
      goodsObj:goodsObj,
      specialObj:specialObj
    })
  },
  //返回顶部
  backToTop(){
    wx.pageScrollTo({
      scrollTop: 0,
    })
  }

})