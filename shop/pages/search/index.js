// pages/search/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    inputVal:"",
    isSuccess:true,
    isNoCatchData:false,
    productList: [],
    searchKeyWord:'',
    placeholderWord:'请输入商品名',
    searchWord:'',
    selectList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    this.getSelect()
    this.getHistorySelect()
  },
  /*用户搜索框输入操作*/
  bindKeyInput:function(e){
    // wx.showLoading({
    //   title: '正在加载中',
    // })
    let _this = this
    let value = ""
    if(e.currentTarget.dataset.value){ //热词搜索
      value = e.currentTarget.dataset.value 
    }else{
      value = e.detail.value
    }
    this.setData({
      inputVal:value,
      searchWord:value
    })
    /*判断是否请求数据完成，只有在请求完成的时候才能再根据输入的值再次发送请求*/
    let kWord = this.data.inputVal
    let cookie = ' '
    let isLogin = wx.getStorageSync('isLogin')
    if(isLogin){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    _this.setData({
      isSuccess:false //还未请求成功，防止再次输入而向服务器发送请求
    })
  
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        page: _this.data.currentPage,
        pageLength: 10,
        obField: 0,
        obType: 0,
        keyword: kWord
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        cookie:cookie
      },
      success: (res) => {
        console.log(res)
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let productList = res.data.goodsList
            for (var i = 0; i < productList.length; i++) {
              let img = productList[i].thumb
              let url = img.slice(0,4)
              if (url != 'http') {
                productList[i].thumb = app.globalData.imageUrl+img
              }
            }
            if (productList.length == 0) {
              _this.setData({
                isNoCatchData:true,
                showHotWord:1
              })
            }
            else {
              _this.setData({
                isNoCatchData:false,
                productList: productList,
                showHotWord:0
              })
            }
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
  /*用户点击商品进行详情页跳转*/
  hrefToDetail(e){
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/shop-detail/index?Id=' + id + ''
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
           //测试
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
  /*获取历史搜索记录*/
  getHistorySelect(){
    let _this = this
    let cookie = ' '
    let isLogin = wx.getStorageSync('isLogin')
    if(isLogin){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    console.log(cookie)
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=HomePage&method=GetHistorySelect',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
           _this.setData({
            selectList:res.data.selectList
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
  //删除搜索历史
  deleteHistorySelect(){
    let _this = this
    let cookie = ' '
    let isLogin = wx.getStorageSync('isLogin')
    if(isLogin){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    console.log(cookie)
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=HomePage&method=DeleteHistorySelect',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          let selectList = []
          if (code == 1) {
            _this.setData({
              selectList:selectList
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
  inputsrc(e){
    console.log(e.currentTarget.dataset.src)
  }
})
