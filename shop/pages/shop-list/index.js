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
    allPages: '',    // 总页数
    currentPage: 1,  // 当前页数  默认是1
    loadMoreData: '加载更多……'
  },
  onShow: function(){

  },
  onLoad: function(){
    //this.getData();//进行页面数据加载
    //在跳转到商品列表的时进行商品列表的请求并加载
    this.setData({
      productList: [
        { id: 1, imgUrl: "../../images/product01.png", discount: "888.00", oldPrice: "958.00", title: "53°茅台王子酒53°茅台王" },
        { id: 2, imgUrl: "../../images/product01.png", discount: "888.00", oldPrice: "958.00", title: "53°茅台王子酒53°茅台王" },
        { id: 3, imgUrl: "../../images/product01.png", discount: "888.00", oldPrice: "958.00", title: "53°茅台王子酒53°茅台王" },
        { id: 4, imgUrl: "../../images/product01.png", discount: "888.00", oldPrice: "958.00", title: "53°茅台王子酒53°茅台王" },
        { id: 5, imgUrl: "../../images/product01.png", discount: "888.00", oldPrice: "958.00", title: "53°茅台王子酒53°茅台王" },
        { id: 6, imgUrl: "../../images/product01.png", discount: "888.00", oldPrice: "958.00", title: "53°茅台王子酒53°茅台王" },
        { id: 7, imgUrl: "../../images/product01.png", discount: "888.00", oldPrice: "958.00", title: "53°茅台王子酒53°茅台王" }
      ]
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
  //加载更多
  loadMore: function () {
    var self = this;
    // 当前页是最后一页
    if (self.data.currentPage == self.data.allPages) {
      self.setData({
        loadMoreData: '已经到顶'
      })
      return;
    }
    setTimeout(function () {
      var tempCurrentPage = self.data.currentPage;
      tempCurrentPage = tempCurrentPage + 1;
      self.setData({
        currentPage: tempCurrentPage,
        hideBottom: false
      })
      //self.getData();
    }, 300);
  },
  // 下拉刷新
  refresh: function (e) {
    var self = this;
    setTimeout(function () {
      console.log('下拉刷新');
      self.setData({
        currentPage: 1,
        hideHeader: false
      })
      //self.getData(); //下拉获取数据
    }, 300);
  },
  handleTap(e){
   var index = e.target.dataset.idx//判断头部哪一个被点击，并获取其下标值
   this.setData({
     isChose:index
   })
   //如果价格位被点击更改图标状态，并获取相对应的的数据
   if(index == 3){
     var isPriceUp = this.data.isPriceUp;
     isPriceUp = !isPriceUp
     this.setData({
       isPriceUp:isPriceUp
     })
     //按照价格的升序或者减序，获取相对应的数据
    //  let _this = this
    //  wx.request({
    //    url: 'http://'+_this.$parent.globalData.productUrl+'api?resprotocol=json&reqprotocol=json&',
    //    method:'post',
    //    data:JSON.stringify({
    //      baseClientInfo:{ longitude:0, latitude:0}
    //    }),
    //    header:{
    //      'Content-Type':'application/x-www-form-rulencoded'
    //    },
    //    success:(res)=>{
    //      _this.setData({
    //        productList:res.list
    //      })
    //    },
    //    fail:(res)=>{

    //    }
    //  })
   }
 },

  hrefToDetail: function(){
    wx.navigateTo({
      url: '/pages/shop-detail/index'
    })
  },
})
