// pages/bargain/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    //bannerList:[{id:1,thumb:'https://allnet-shop-cdn.91uda.com/images/1/2019/01/Nfn1asdF05m05f3Nnkg8FGfngFjj5F.jpg'},{id:2,thumb:'https://allnet-shop-cdn.91uda.com/images/1/2019/01/Nfn1asdF05m05f3Nnkg8FGfngFjj5F.jpg'}],
    page:1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    this.getGoodsList()
    this.getEntranceInfo()
  },
  onShareAppMessage: function () {

  },
  getGoodsList(){
    let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Bargain&method=GetGoodsList',
      method: 'post',
      data:JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page:1,
        pageLength:10,
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let goodsList = res.data.goodsList
          for(let i in goodsList){
            let url = goodsList[i].thumb.slice(0,4)
            if(url != 'http'){
              goodsList[i].thumb = app.globalData.imageUrl + goodsList[i].thumb
            }
            goodsList[i].newBargainprice = goodsList[i].bargainprice.split(".")
            goodsList[i].newBargainpriceBtn = parseInt(goodsList[i].bargainprice)
            goodsList[i].newCarouselList = [] //购买用户轮播
            for(let j in goodsList[i].carouselList){
              let name = goodsList[i].carouselList[j].nickname
              let bargainprice = goodsList[i].carouselList[j].bargainprice
               bargainprice = parseInt(bargainprice)
              let newName = name.slice(0,1) + '***' +name.slice(-1)
              let avatar = goodsList[i].carouselList[j].avatar
              let img = avatar.slice(0,4)
             
              let obj = {}
              if(img != 'http'){
                obj.avatar = app.globalData.imageUrl + avatar
              }
              obj.nickname = newName
              obj.bargainprice = bargainprice
              goodsList[i].newCarouselList.push(obj)
            }
          }
          _this.setData({
            goodsList:goodsList
          })
        }
        else {
          console.log(res.msg)
        }

      },
      fail: (res) => {
      }
    })
  },
  hrefToGroupDetail(e){
    let shopId = e.currentTarget.dataset.goodsid
    wx.navigateTo({
      url: '' + '/pages/bargain-details/index?Id=' + shopId +'',
    })
  },
  getEntranceInfo(){
    let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Bargain&method=GetEntranceInfo',
      method: 'post',
      data:JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page:1,
        pageLength:10,
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
         let entrance = res.data.entrance
          _this.setData({
            entrance:entrance
          })

        }
        else {
          console.log(res.msg)
        }

      },
      fail: (res) => {
      }
    })
  }
})