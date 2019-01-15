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
    let url = options.url
    this.setData({
      url:url
    })
  },
  //点击新建收货地址，跳转到地址页
  addNewAddress(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index',
      })
      wx.setStorage({
        key: 'isLogin',
        data: false
      })
    }
    if (wx.chooseAddress) {
      wx.showModal({
        title: '提示',
        content: '是否从本地获取地址',
        success:(res)=>{
          if(res.confirm){
            wx.chooseAddress({
              success: function (res) { //从本地中获取地址信息
                wx.request({
                  url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Address&method=AddOrEditAddress',
                  method: 'post',
                  data: JSON.stringify({
                    baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
                    id: _this.data.id,
                    realname: res.userName,
                    mobile: res.telNumber,
                    province: res.provinceName,
                    city: res.cityName,
                    area: res.countyName,
                    address: res.detailInfo,
                    isdefault: 1
                  }),
                  header: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
                  },
                  success: (res) => {
                    let code = res.data.baseServerInfo.code
                    let msg = res.data.baseServerInfo.msg
                    if (code == 1) {
                      _this.getaddress()
                    } else {
                      console.log(res.msg)
                    }

                  },
                  fail: (res) => {
                  }
                })

              },
              fail: function (err) {
                console.log(JSON.stringify(err))
              }
            })
          }else{
            wx.navigateTo({
              url: '/pages/address-manger/index?id=',
            })
          }
        }
      })

    } else {
      console.log('当前微信版本不支持从本地获取地址');
    }
    // wx.navigateTo({
    //   url: '/pages/address-manger/index?id=',
    // })
  },
  //加载用户的收货地址
  getaddress(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index',
      })
    }
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Address&method=GetAddressList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        console.log(code)
        if (code == 1) {
          let arr = res.data.addressList
          for(var i in arr){
             arr[i].showMobile = _this.phoneFilter(arr[i].mobile)   //对电话号码进行过滤处理
             arr[i].totalAddress = arr[i].province + arr[i].city + arr[i].area +arr[i].address
          }
          _this.setData({
            addressList: arr
          })
        }else if(code==1019){
          wx.navigateTo({
            url: '/pages/login/index',
          })
          wx.setStorage({
            key: 'isLogin',
            data: false
          })
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
              'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
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
    let _this = this
    let url = _this.data.url
    if (url == 'order') {
      let id = e.currentTarget.dataset.id
      let mobile = e.currentTarget.dataset.mobile
      let address = e.currentTarget.dataset.address
      let name = e.currentTarget.dataset.name
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2];//上一页面
      prevPage.setData({//直接给上移页面赋值
        addressId:id,
        realname:name,
        mobile:mobile,
        address:address
      })
      wx.navigateBack()
    }else if(url == 'group-buy'){
      let id = e.currentTarget.dataset.id
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2];//上一页面
      prevPage.setData({//直接给上移页面赋值
        addressId:id
      })
      wx.navigateBack()
    }
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
