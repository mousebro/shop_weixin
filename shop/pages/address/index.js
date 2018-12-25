// pages/address/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    addressList: [],
    url:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // let uid = options.options.id 
    //判断是从哪一个页面进入的（支付订单 / 个人中心）
    // this.setData({
    //   url:options.url
    // })
  },
  //点击新建收货地址，跳转到地址页
  addNewAddress(){
    wx.navigateTo({
      url: '/pages/address-manger/index?id=',
    })
  },
  //加载用户的收货地址
  getaddress(){
    let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Address&method=GetAddressList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('sessionId')
      }, 
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let arr = res.data.addressList
          for(var i in arr){
             arr[i].mobile = _this.phoneFilter(arr[i].mobile)   //对电话号码进行过滤处理
             arr[i].totalAddress = arr[i].province + arr[i].city + arr[i].area +arr[i].address
          }
          _this.setData({
            addressList: arr
          })
        }else{
          console.log(res.msg)
        }

      },
      fail: (res) => {
      }
    })
  },
  //电话号码过滤器
  phoneFilter(pNum){
    let arr = pNum.split("")
    let a = arr.splice(0,3)
    let b = arr.splice(4,8)
    let aStr = a.join("")
    let bStr = b.join("")
    return aStr + "****" + bStr
  },
  //删除地址
  deleteAddress(e){
    let idx = e.target.dataset.idx;
    let _this = this
    wx.showModal({
      title: '提示',
      content: '是否删除该地址',
      success:(res)=>{
        if (res.confirm) {
          wx.request({
            url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Address&method=DelAddress',
            method: 'post',
            data: JSON.stringify({
              baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
              id:idx
            }),
            header: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('sessionId')
            },
            success: (res) => {
              let code = res.data.baseServerInfo.code
              let msg = res.data.baseServerInfo.msg
              if (code == 1) {
                _this.getaddress()//重新加载地址列表
              } else {
                console.log(res.msg)
              }

            },
            fail: (res) => {
            }
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      },

    })
    
  },
  //编辑地址
  editorAddress(e){
    let idx = e.target.dataset.idx;
    wx.navigateTo({
      url: '/pages/address-manger/index?id='+idx,
    })
  },
  //点击地址信息，跳转到支付订单列表，并携带会参数
  hrefHandle(e){
    // if (url=='personal')ruturn;
    // let idx = e.currentTarget.dataset.idx //那一条地址被点击
    // let pages = getCurrentPages();//当前页面
    // let prevPage = pages[pages.length - 2];//上一页面
    // prevPage.setData({//直接给上移页面赋值
    //   item: e.currentTarget.dataset.item,
    //   selAddress: idx
    // });
    // wx.navigateBack({//返回
    //   delta: 1
    // })
  },
  onShow(){
    this.getaddress()
  }
})