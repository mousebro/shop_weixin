//index.js
//获取应用实例
const app = getApp()
Page({
  data: {
    showActive:'a',
    productList: [],// 列表显示的数据源
    isChose:1,
    isPriceUp:true,
    hideHeader: true,
    hideBottom: true,
    allPages: 0,    // 总页数
    currentPage: 1,  // 当前页数  默认是1
    obField:0,//排序关键字
    obType:0,//排序类型
    categoryId:0
  },
  onShow: function(){

  },
  onLoad: function(options){
    //this.getData();//进行页面数据加载
    //在跳转到商品列表的时进行商品列表的请求并加载
    let categoryId = this.options.Id
    let title = this.options.title
    this.setData({
      categoryId: categoryId,
      imageUrl: app.globalData.imageUrl
    })
    if (title != '' & title != undefined) {
      wx.setNavigationBarTitle({
        title: ''+title+''
      })
    }
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
        categoryId:categoryId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let goodsList = res.data.goodsList
            for (var i = 0; i < goodsList.length; i++) {
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
  // 获取数据  pageIndex：页码参数
  getData: function () {
    var self = this;
    var pageIndex = self.data.currentPage;
    wx.request({
      url: '',
      data: {
        page: pageIndex
      },
      success: function (res) {
        var dataModel = res.data;
        if (dataModel.showapi_res_code == 0) {
          if (dataModel.showapi_res_body.ret_code == 0) {
            if (pageIndex == 1) { // 下拉刷新
              self.setData({
                allPages: dataModel.showapi_res_body.pagebean.allPages,
                contentlist: dataModel.showapi_res_body.pagebean.contentlist,
                hideHeader: true
              })
            } else { // 加载更多
              console.log('加载更多');
              var tempArray = self.data.contentlist;
              tempArray = tempArray.concat(dataModel.showapi_res_body.pagebean.contentlist);
              self.setData({
                allPages: dataModel.showapi_res_body.pagebean.allPages,
                contentlist: tempArray,
                hideBottom: true
              })
            }
          }
        }
      },
      fail: function () {

      }
    })
  },

  //头部选项卡点击事件
  handleTap(e){
   var index = e.target.dataset.idx//判断头部哪一个被点击，并获取其下标值
   this.setData({
     isChose:index,
     currentPage:1
   })
    let obField =0 //排序关键字
    let obType =0 //排序类型
   //如果价格位被点击更改图标状态，并获取相对应的的数据
    if (index == 3) { //按照价格的升序或者减序，获取相对应的数据
     var isPriceUp = this.data.isPriceUp;
      isPriceUp == true ? obType = 1 : obType = 2
      obField = 3
     isPriceUp = !isPriceUp
     this.setData({
       isPriceUp:isPriceUp,
       obField: obField,
       obType: obType
     })
   }else if(index == 1){ //如果点击的是按照综合排序的
      obField = 1
      obType = 0
      this.setData({
        obField: obField,
        obType: obType
      })
   }else if(index == 2){ //如果点击按销量排序
      obField = 2
      obType = 0
      this.setData({
        obField: obField,
        obType: obType
      })
   }
   //根据选项卡来请求不同的数据
    let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page: _this.data.currentPage,
        pageLength: 10,
        obField: obField,
        obType: obType,
        categoryId: _this.data.categoryId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          let goodsList = res.data.goodsList
          for (var i = 0; i < goodsList.length; i++) {
            let img = goodsList[i].thumb
            let url = img.substring(0,4)
            if (url != 'http') {
              goodsList[i].thumb = app.globalData.imageUrl+img
            }
          }
          if (code == 1) {
            _this.setData({
              productList: goodsList
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
  //下拉刷新
  onPullDownRefresh(){
    let _this = this
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    // 隐藏导航栏加载框
    wx.hideNavigationBarLoading();
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page: _this.data.currentPage,
        pageLength: 10,
        obField: this.data.obField,
        obType: this.data.obType,
        categoryId: _this.data.categoryId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        // 停止下拉动作
        wx.stopPullDownRefresh();
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          let goodsList = res.data.goodsList
          for (var i = 0; i < goodsList.length; i++) {
            let img = goodsList[i].thumb
            let url = img.substring(0,4)
            if (url != 'http') {
              goodsList[i].thumb = app.globalData.imageUrl+img
            }
          }
          if (code == 1) {
            _this.setData({
              productList: goodsList
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
  //下拉触底加载更多
  onReachBottom(){
    let _this = this
    if (_this.data.currentPage == _this.data.allPages){
      return ;
    }
    _this.setData({
      currentPage:_this.data.currentPage + 1
    })
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page: _this.data.currentPage,
        pageLength: 10,
        obField: 1,
        obType: 0,
        categoryId: _this.data.categoryId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          let goodsList = res.data.goodsList
          for (var i = 0; i < goodsList.length; i++) {
            let img = goodsList[i].thumb
            let url = img.substring(0,4)
            if (url != 'http') {
              goodsList[i].thumb = app.globalData.imageUrl+img
            }
          }
          if (code == 1) {
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
  hrefToDetail(e){
    let idx = e.currentTarget.dataset.idx
    wx.navigateTo({
      url: '/pages/shop-detail/index?Id='+idx + '',
    })
  },
  // 跳转到搜索页
  hrefToSearch: function(){
    wx.navigateTo({
      url: '/pages/search/index'
    })
  },
})
