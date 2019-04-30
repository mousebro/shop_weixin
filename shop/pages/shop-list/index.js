//index.js
//获取应用实例
//wx-drawer
const MENU_WIDTH_SCALE = 0.82;
const FAST_SPEED_SECOND = 300;
const FAST_SPEED_DISTANCE = 5;
const FAST_SPEED_EFF_Y = 50;
const app = getApp()
Page({
  data: {
    productList: [],// 列表显示的数据源
    isChose:1,
    isPriceUp:true,
    hideHeader: true,
    hideBottom: true,
    allPages: 0,    // 总页数
    currentPage: 1,  // 当前页数  默认是1
    obField:0,//排序关键字
    obType:0,//排序类型
    categoryId:0,
    choseTap:0,
    showMask:false,
    showActive:'a0',
    ui: {
      windowWidth: 0,
      menuWidth: 0,
      offsetLeft: 0,
      tStart: true
    }
  },
  onShow: function(){

  },
  onLoad: function(options){
    app.userView('RecordExposurenum') //统计平台曝光度记录
    this.setData({
      isIpx:app.globalData.isIpx
    })
    //在跳转到商品列表的时进行商品列表的请求并加载
    let categoryId = this.options.Id || 0
    this.setData({
      categoryId: categoryId,
      imageUrl: app.globalData.imageUrl
    })

   this.getCategory()
   this.getSelect()
  },
  handlerStart(e) {
    let {clientX, clientY} = e.touches[0];
    this.tapStartX = clientX;
    this.tapStartY = clientY;
    this.tapStartTime = e.timeStamp;
    this.startX = clientX;
    this.data.ui.tStart = true;
    this.setData({ui: this.data.ui})
  },
  handlerMove(e) {
    let _this = this
    let {clientX} = e.touches[0];
    let {ui} = this.data;
    let offsetX = this.startX - clientX;
    this.startX = clientX;
    ui.offsetLeft -= offsetX;

    if(ui.offsetLeft <= 0) {
      ui.offsetLeft = 0;
    } else if(ui.offsetLeft >= ui.menuWidth) {

      ui.offsetLeft = ui.menuWidth;
    }
    this.setData({ui: ui})
  },
  handlerCancel(e) {
  },
  handlerEnd(e) {
    this.data.ui.tStart = false;
    this.setData({ui: this.data.ui})
    let {ui} = this.data;
    let {clientX, clientY} = e.changedTouches[0];
    let endTime = e.timeStamp;
    //快速滑动
    if(endTime - this.tapStartTime <= FAST_SPEED_SECOND) {
      //向左
      if(this.tapStartX - clientX > FAST_SPEED_DISTANCE) {
        ui.offsetLeft = 0;
      } else if(this.tapStartX - clientX < -FAST_SPEED_DISTANCE && Math.abs(this.tapStartY - clientY) < FAST_SPEED_EFF_Y) {
        ui.offsetLeft = ui.menuWidth;
        this.cancleMask()
      } else {
        if(ui.offsetLeft >= ui.menuWidth/2){
          this.cancleMask()
          ui.offsetLeft = ui.menuWidth;
        } else {
          ui.offsetLeft = 0;
        }
      }
    } else {
      if(ui.offsetLeft >= ui.menuWidth/2){
        this.cancleMask()
        this.setData({showMask:false})
      } else {
        ui.offsetLeft = 0;
      }
    }
    this.setData({ui: ui})
  },
  //筛选框返回一级筛选栏
  backFirstL(){
    let {uT} = this.data
    uT.menuWidth = 0
    this.setData({
      uT:uT
    })
  },
  //点击筛选
  //隐藏筛选框内容
  cancleMask(){
    let _this = this
    let {ui,uT={}} = this.data;
    ui.offsetLeft = 0
    ui.menuWidth = 0
    uT.menuWidth = 0
    _this.setData({
      ui:ui,
      showMask:false,
      uT:uT
    })
  },
  //点击以及筛选菜单
  secSlideHandle(e){
    let _this = this
    let itemId = e.currentTarget.dataset.id
    let itemTitle = e.currentTarget.dataset.title
    _this.getFilterList(itemId,2)
    let uT = {}
    uT.menuWidth =this.data.ui.menuWidth
    uT.tStart = false
    this.setData({
      uT:uT,
      itemTitle:itemTitle,
      choseFirstId:itemId
    })
  },
  //点击筛选二级菜单回到一级内容
  getValueBack(e){
    let _this = this
    let id = e.currentTarget.dataset.id
    let title = e.currentTarget.dataset.title
    let choseFirstId = this.data.choseFirstId
    let firstLevel = this.data.firstLevel
   for(let i in firstLevel){
     if(firstLevel[i].id == choseFirstId){
      firstLevel[i].choseTitle = title
      firstLevel[i].choseId = id
     }
   }
   this.setData({
    firstLevel:firstLevel
   },function(){
     _this.backFirstL()
   })
  },
  //点击筛选进行展示右侧侧边栏
  showRightSlide(){
    try {
      let res = wx.getSystemInfoSync()
      this.windowWidth = res.windowWidth;
      this.data.ui.menuWidth = this.windowWidth * MENU_WIDTH_SCALE;
      this.data.ui.offsetLeft = 0;
      this.data.ui.windowWidth = res.windowWidth;
      this.data.ui.tStart = false
      this.setData({ui: this.data.ui,showMask:true})
    } catch (e) {
    }
  },
  handlerPageTap(e) {
    let {ui} = this.data;
    if(ui.offsetLeft != 0) {
      ui.offsetLeft = 0;
      this.setData({ui: ui})
    }
  },
  handlerAvatarTap(e) {
    let {ui} = this.data;
    if(ui.offsetLeft == 0) {
      ui.offsetLeft = ui.menuWidth;
      this.setData({ui: ui})
    }
  },
  // 获取数据  pageIndex：页码参数
  getData() {
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
  //头部选项卡点击事件排序 综合-销量-价格
  handleTap(e){
    let _this = this
   var index = e.target.dataset.idx//判断头部哪一个被点击，并获取其下标值
   this.setData({
     isChose:index,
     currentPage:1,
     showNoMoreMsg:false
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
   if(index!=4){
     if(_this.data.hasGetScreenList){ //判断前面拉取的是筛选商品列表还是 普通分类 true为筛选
      _this.fomitFilterList()
     }else{
      _this.getProductList()
     }
    
   }else{
     _this.showRightSlide()
   }
 },
  //一级分类点击事件
  changeTap(e){
   let id = e.currentTarget.dataset.id
   let idx = e.currentTarget.dataset.idx
   if(!this.data.categoryList[idx].categoryList[0])return
   let categoryId = this.data.categoryList[idx].categoryList[0].id
   let _this = this
   this.setData({
     choseTap:idx,
     categoryId:categoryId,
     firstcategoryId:id,
     showActive:'a0'
   },function(){
    _this.getProductList()
    _this.getFilterList()
   })
 },
  //二级侧边栏点击事件
  addActive(e){
    let _this = this
    let id = e.currentTarget.dataset.id
     let showId = e.currentTarget.dataset.showid
     _this.setData({
      showActive:showId,
      categoryId:id,
      showNoMoreMsg:false
     },function(){
       _this.getProductList()
     })
  },
  //获取商品列表
  getProductList(){
    let _this = this
    wx.showLoading({
      title:'加载中~'
    })
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page:_this.data.currentPage,
        pageLength:10,
        obField:_this.data.obField,
        obType:_this.data.obType,
        categoryId:_this.data.categoryId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        wx.hideLoading()
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
              allPages: res.data.pageCount,
              hasGetScreenList:false //将获取商品列表状态置为false 表示前一个拉取商品列表的方式为普通（true为筛选）
            })
          }
          else {

          }
        }
        else {
          wx.hideLoading()
        }
      },
      fail: (res) => {
      }
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
              for(let j=0;j<categoryList[i].categoryList.length;j++){
                categoryList[i].categoryList[j].showId = 'a'+j+''
                if (categoryList[i].categoryList[j].id == _this.data.categoryId) {
                  _this.chooseFirstCate = i
                  _this.chooseSecondCate = j
                  _this.chooseShowId = categoryList[i].categoryList[j].showId
                  _this.setData({
                    //showActive:_this.chooseShowId,
                    choseTap:_this.chooseFirstCate,
                  })
                }
              }
            }
            let categoryId = categoryList[0].categoryList[0].id
            if(_this.data.categoryId){
              categoryId = _this.data.categoryId
            }
            _this.setData({
              categoryList:categoryList,
              firstcategoryId:categoryList[0].id,
              categoryId:categoryId
            },function(){
              _this.getProductList()
              _this.getFilterList(0)//获取筛选列表父级
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

  //右侧商品列表滚动到底部触发加载更多
  loadMoreData(){
    let _this = this
    let a = _this.data.showActive
    let isChose = _this.data.isChose
    if(_this.data.allPages > _this.data.currentPage){
      let currentPage = _this.data.currentPage
      currentPage++
      _this.setData({
        currentPage:currentPage
      },function(){
        wx.hideLoading()
        if(isChose == 4){
          _this.fomitFilterList()
        }else{
          _this.getProductList()
        }
      })
    }else{
      _this.setData({
        showNoMoreMsg:true
      })
    }
  },
 //跳转到商品详情页
 hreftoShopDetail(e){
  let shopId = e.currentTarget.dataset.id
  wx.navigateTo({
    url: '/pages/shop-detail/index?Id=' + shopId,
  })
 },
 //获取筛选父类与子类
 getFilterList(id=0,level=1){
   let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetScreen',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        id:id,
        categoryid:_this.data.firstcategoryId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let screenlist = res.data.screenlist
            if(level == 1){
              for(let i in screenlist){
                screenlist[i].choseTitle = ''
                screenlist[i].choseId = ''
              }
              _this.setData({
                firstLevel:screenlist
              })
            }else if (level == 2){
              _this.setData({
                seconedLevel:screenlist
              })
            }
          }
          else {
          }
        }
      },
      fail: (res) => {
      }
    })
 },
 //重置筛选内容
 resetFilter(){
   let _this = this
   
   let firstLevel = _this.data.firstLevel
   for(let i in firstLevel){
     firstLevel[i].choseTitle = ''
     firstLevel[i].choseId = ''
   }
   _this.setData({
    firstLevel:firstLevel,
    filterPriceA:'',
    filterPriceB:''
   })
 },
 inputPriceA(e){
  this.setData({
    filterPriceA:e.detail.value
  })
 },
 inputPriceB(e){
  this.setData({
    filterPriceB:e.detail.value
  })
 },
 //获取筛选列表
 fomitFilterList(){
  let _this = this
  let lowprice = parseFloat(_this.data.filterPriceA) || 0
  let highprice = parseFloat(_this.data.filterPriceB) || 0
  if(lowprice>highprice){
    lowprice ^= highprice;
    highprice ^= lowprice;
    lowprice ^= highprice;
  }

  let idstrArr = []
  let firstLevel = _this.data.firstLevel
  for(let i in firstLevel){
    if(firstLevel[i].choseId != ''){
      idstrArr.push(firstLevel[i].choseId)
    }
  }
  let idstr = idstrArr.join(",")
  wx.showLoading({
    title:'加载中~'
  })
  wx.request({
    url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetScreenList',
    method: 'post',
    data: JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      page:_this.data.currentPage,
      pageLength:10,
      obField:_this.data.obField,
      obType:_this.data.obType,
      highprice:highprice,
      lowprice:lowprice,
      idstr:idstr,
      categoryid:_this.data.firstcategoryId //二级分类id
    }),
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    success: (res) => {
      wx.hideLoading()
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
            allPages: res.data.pageCount,
            hasGetScreenList:true
          },function(){
            _this.cancleMask()
          })
        }
        else {
        }
      }
      else {
        _this.setData({
          productList:[]
        })
        wx.hideLoading()
        _this.cancleMask()
      }
    },
    fail: (res) => {
      _this.cancleMask()
    }
  })
 },
  //跳转到个人中心
  hrefToMine: function(){
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    else {
      wx.redirectTo({
        url: '/pages/mine/index'
      })
    }
  },
  //跳转到购物金
  hrefToGold: function(){
    wx.redirectTo({
      url: '/pages/shopping-gold/index'
    })
  },
  //跳转到首页
  hrefToIndex: function(){
    wx.redirectTo({
      url: '/pages/index/index'
    })
  },
  /*获取首页热门搜索*/
  getSelect(){
    let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=HomePage&method=GetSelect',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let selectList = res.data.selectList
            let searchWord = ''
            let hotWords = []
            for(let item of selectList){
              if(item.type == 1){
              searchWord = item.selectname
              }else{
                hotWords.push(item.selectname)
              }
            }
            _this.setData({
            searchWord:searchWord,
            hotWords:hotWords,
            showHotWord:1
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

})
