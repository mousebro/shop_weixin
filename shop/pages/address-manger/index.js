// pages/address-manger/index.js
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isDefault:0,
    region: [],
    uname:'',
    phone:'',
    address:'',
    id:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getAddress(options.id)
  },
  //设置是否设置为默认地址
  switchChange(e){
    let chose = e.detail.value == true?1:0
    this.setData({
     isDefault:chose
    })
  },
  //设置所在地区
  bindRegionChange(e){
    this.setData({
      region:e.detail.value
    })
    
  },
  //提交保存
  formSubmit(e){
    let _this = this
    console.log(_this.data.id)
    let reg = /^[1][0-9]{10}$/;
    let uname = this.data.uname
    let phone = this.data.phone
    let address = this.data.address
    let region = this.data.region
    let isPhone = reg.test(phone)
    if(!isPhone){
      wx.showModal({
        title: '提示',
        content: '手机号码必须为11位数字',
        duration:2000,
        showCancel:false,
        confirmColor:'#f04c4a'
      })
    }else if(uname == ''){
      wx.showModal({
        title: '提示',
        content: '用户名不能为空',
        duration: 2000,
        showCancel: false,
        confirmColor: '#f04c4a'
      })
    } else if (region==""){
      wx.showModal({
        title: '提示',
        content: '所在地区不能为空',
        duration: 2000,
        showCancel: false,
        confirmColor: '#f04c4a'
      })
    }else if(address == ''){
      wx.showModal({
        title: '提示',
        content: '详细地址不能为空',
        duration: 2000,
        showCancel: false,
        confirmColor: '#f04c4a'
      })
    } 
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Address&method=AddOrEditAddress',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        id: _this.data.id,
        realname:uname,
        mobile:phone,
        province: region[0],
        city: region[1],
        area: region[2],
        address: address,
        isdefault: _this.data.isDefault
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('sessionId')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
            wx.showModal({
              title:'提示',
              content:'添加修改成功',
              success:()=>{
                wx.navigateBack({
                  delta:1
                })
              }
            })
        } else {
          console.log(res.msg)
        }

      },
      fail: (res) => {
      }
    })
  },
  //获取输入框内的收货人姓名、手机号、地址
  getInput(e){
    let _this = this
    let item = e.target.dataset.item
    if(item == 'name'){
      _this.setData({
        uname:e.detail.value
      })
    }else if (item == 'phone') { 
      _this.setData({
        phone: e.detail.value
      })
    }else if (item == 'address') {
      _this.setData({
        address: e.detail.value
      })
    }
   
  },
  //获取地址信息
  getAddress(id){
    let _this = this
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Address&method=GetAddressDetail',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
        id: id
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('sessionId')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let data = res.data.addressInfo
          console.log(data)
          _this.setData({
            isDefault: parseInt(data.isdefault),
            region: [data.province,data.city,data.area],
            uname: data.realname,
            phone: data.mobile,
            address: data.address,
            id:data.id
          })
         
        } else {
          console.log(res.msg)
        }

      },
      fail: (res) => {
      }
    })
  }
})