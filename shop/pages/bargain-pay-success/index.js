// pages/bargain-pay-success/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    goodsList:[{id:1,thumb:'https://allnet-shop-cdn.91uda.com/images/1/2018/12/NMjYV8t8tXAAYAi8v844WxQmAjmUoq.jpg',title:'【台湾进口】抗菌中性洗衣液瓶装家庭装浓缩精无荧光剂4kg天然机洗淡雅清香 红色4000ml',marketprice:'199.00'},
    {id:1,thumb:'https://allnet-shop-cdn.91uda.com/images/1/2018/12/NMjYV8t8tXAAYAi8v844WxQmAjmUoq.jpg',title:'【台湾进口】抗菌中性洗衣液瓶装家庭装浓缩精无荧光剂4kg天然机洗淡雅清香 红色4000ml',marketprice:'199.00'},
    {id:1,thumb:'https://allnet-shop-cdn.91uda.com/images/1/2018/12/NMjYV8t8tXAAYAi8v844WxQmAjmUoq.jpg',title:'【台湾进口】抗菌中性洗衣液瓶装家庭装浓缩精无荧光剂4kg天然机洗淡雅清香 红色4000ml',marketprice:'199.00'},
    {id:1,thumb:'https://allnet-shop-cdn.91uda.com/images/1/2018/12/NMjYV8t8tXAAYAi8v844WxQmAjmUoq.jpg',title:'【台湾进口】抗菌中性洗衣液瓶装家庭装浓缩精无荧光剂4kg天然机洗淡雅清香 红色4000ml',marketprice:'199.00'}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let orderid = options.Id
    this.setData({
      orderid:orderid
    })
    this.getRemomendGoods()
  },
  hrefToOrderDetail: function(){
    let orderId = this.data.orderid
    let pageFrom = '/pages/index/index'
    wx.navigateTo({
      url: '/pages/my-order-detail/index?Id='+orderId+'&pageFrom='+pageFrom+"&type=4"
    })
  },
  hrefToIndex(){
    wx.reLaunch({
      url:'/pages/index/index'
    })
  },
  hrefToBargainList(){
    wx.navigateTo({
      url:'/pages/bargain-list/index'
    })
  },
  /**
   * 用户点击右上角分享
   */
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
  //获取推荐商品
  getRemomendGoods(){
    let _this = this
    let data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      limit:10
    })
    _this.setHttpRequst('Goods','GetRecommendGoods',data,function(res){
      let code = res.data.baseServerInfo.code
      let msg = res.data.baseServerInfo.msg
      let goodsList = res.data.goodsList
      for(let i in goodsList){
        let url = goodsList[i].thumb
        let img = url.slice(0,4)
        if(url != 'http'){
          goodsList[i].thumb = app.globalData.imageUrl + url
        }
      }
      _this.setData({
        goodsList:goodsList
      })
    })
  },
  hrefToDetail(e){//跳转到普通商品详情页 关闭所有页面
    let goodsid = e.currentTarget.dataset.id
    wx.reLaunch({
      url: '' + '/pages/shop-detail/index?Id=' + goodsid + ''
    })
  },
  onShareAppMessage: function () {

  }
})