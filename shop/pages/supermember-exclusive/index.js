// pages/super-exclusive/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navbar:['全部','洗护','烟酒','家电'],
    scrollLeft:0,
    currentTab:0,
    allPages: 0,    // 总页数
    currentPage: 1,  // 当前页数  默认是1
    obField:0,//排序关键字
    obType:0,//排序类型
    categoryId:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    this.getShopList()
    this.getCategory(0)
  },
  onReady: function () {

  },
  /*用户点击顶部导航进行选项卡切换,并请求对应的数据*/
  handleChose: function (e){
    let _this = this
    let nowStatus = 0
    let categoryid = e.currentTarget.dataset.categoryid || 0
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
      nowStatus: nowStatus
    })
    _this.getShopList(categoryid)
  },
  // 获取分类列表
  getCategory: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Shop&method=GetSuperCategory',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let categoryList = res.data.categoryList
            let navbar = [{id:0,name:'全部'}]
            console.log(categoryList)
            for (let i = 0; i < categoryList.length; i++) {
              categoryList[i].showId = 'a'+i+''
              navbar.push({id:categoryList[i].id,name:categoryList[i].name})
            }
            _this.setData({
              categoryList:categoryList,
              navbar:navbar
            })
           
          }
          else{

          }
        }
        else {
          console.log(res.statusCode);
        }
      },
      fail: (res) => {
      }
    })
  },
  //获取super会员商品列表
  getShopList(categoryId){
    let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page:_this.data.currentPage,
        pageLength:10,
        obField:1,
        obType:0,
        categoryId:categoryId,
        issuper:2
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          console.log(res.data)
          if (code == 1) {
            let goodsList = res.data.goodsList
            console.log(goodsList)
            for (var i = 0; i < goodsList.length; i++) {
              goodsList[i].newmarkertprice = goodsList[i].marketprice.split(".")
              goodsList[i].newsuperprice = goodsList[i].superprice.split(".")
              let img = goodsList[i].thumb
              let url = img.substring(0,4)
              if (url != 'http') {
                goodsList[i].thumb = app.globalData.imageUrl+img
              }
            }
            _this.setData({
              productList: goodsList,
              allPages: res.data.pageCount
            })
          }
          else {

          }
        }
        else {
          console.log(res.statusCode);
        }
      },
      fail: (res) => {
      }
    })
  },
  //跳转到商品详情页
  hrefToDetail(e){
    wx.navigateTo({
      url: '/pages/shop-detail/index?Id='+e.currentTarget.dataset.idx+'&issuper=1',
    })
  }
})