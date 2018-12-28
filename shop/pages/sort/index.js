//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    showActive:'a0'
  },
  onShow: function(){

  },
  onLoad: function(){
    let _this = this
    _this.getCategory()
  },
  // 点击左侧栏
  addActive: function(e){
    let _this = this
    let id = e.target.dataset.id
    _this.showActive = id
    _this.setData({
      toView: id,
      showActive: id
    })
  },
  // 为右侧滑块部分创建节点
  scrollFeedback: function(){
    let _this = this
    let query = wx.createSelectorQuery().in(this)
    let heightArr = [0]
    let s = 0
    // 计算右边滑块总高度
    query.select('.content').boundingClientRect((res) => {
      this.setData({
        containerH:res.height
      })
    }).exec()
    // 获取每个一级分类的高度，用来建立左边索引
    query.selectAll('.position').boundingClientRect((rects) => {
      rects.forEach((res) => {
        s += res.height
        heightArr.push(s)
      })
      this.setData({
        heightArr:heightArr
      })
    }).exec()
  },
  // 监听右侧滑块滑动距离
  onscroll: function(e){
    let scrollTop = e.detail.scrollTop
    let scrollArr = this.data.heightArr
    for (let i = 0; i < scrollArr.length; i++) {
      if (scrollTop >= scrollArr[i-1]+50 & scrollTop < scrollArr[i]) {
        this.setData({
          showActive: 'a'+i+''
        })
      }
      else if (scrollTop < 50) {
        this.setData({
          showActive: 'a0'
        })
      }
    }
  },
  // 跳转到商品列表
  hrefToShopList: function(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/shop-list/index?Id='+id+''
    })
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
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let categoryList = res.data.categoryList
            for (let i = 0; i < categoryList.length; i++) {
              categoryList[i].showId = 'a'+i+''
            }
            _this.setData({
              categoryList:categoryList,
            })
            _this.scrollFeedback()
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
  // 跳转到搜索页
  hrefToSearch: function(){
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },
})
