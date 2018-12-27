//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    totalPrice:0,
    addressId:0,
    realname:'点击添加地址',
    mobile:'',
    address:''
    // choseCoupon:true,
    // couponPrice:0
  },
  onShow: function(){
    let _this = this
    console.log(_this.data.addressId);
    _this.setData({
      addressId:_this.data.addressId,
      realname:_this.data.realname,
      mobile:_this.data.mobile,
      address:_this.data.address
    })
  },
  onLoad: function(){
    let _this = this
    let goodsList = wx.getStorageSync('orderShopList');
    let submitGoodsList = []  // 提交订单用商品对象列表
    let goodsIdList = [] // 获取运费用商品id列表
    _this.getAddress() // 获取用户地址簿
    // let couponList = [{id:1,name:'满减50优惠券',price:5000,usePrice:100000}]
    let fare = 1000
    let isVip = true
    let vipPrice = 12000
    let totalPrice = _this.data.totalPrice
    for (let i = 0; i < goodsList.length; i++) {
      let goodsId = goodsList[i].goodsId
      let price = parseFloat(goodsList[i].price)*100
      let count = goodsList[i].number
      let countPrice = price*count
      submitGoodsList.push({id:goodsId,total:count})
      goodsIdList.push(goodsId)
      _this.data.totalPrice = _this.data.totalPrice+countPrice
    }
    _this.setData({
      goodsList:goodsList,
      submitGoodsList:submitGoodsList,
      totalPrice:_this.data.totalPrice,
      fare:fare,
      // couponList:couponList,
      isVip:isVip,
      vipPrice:vipPrice
    })
    if (isVip) {
      let payPrice = _this.data.totalPrice + _this.data.fare - _this.data.vipPrice
      _this.setData({
        payPrice:payPrice
      })
    }
    else {
      let payPrice = _this.data.totalPrice + _this.data.fare
      _this.setData({
        payPrice:payPrice
      })
    }
  },
  // 获取用户地址
  getAddress: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Address&method=GetAddressList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''}
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('sessionId')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let addressList = res.data.addressList // 获取用户地址列表
          if (addressList.length == 0) {
            console.log('需要新建地址');
          }
          else {
            let addressInfo = addressList[0]
            let realname = addressInfo.realname
            let mobile = addressInfo.mobile
            let province = addressInfo.province
            let city = addressInfo.city
            let area = addressInfo.area
            let addressDetail = addressInfo.address
            let addressId = addressInfo.id
            console.log(addressInfo);
            let showAddress = province+city+area+addressDetail
            _this.setData({
              addressId:addressId,
              realname:realname,
              mobile:mobile,
              address:showAddress
            })
          }
        }
        else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else{
          wx.showModal({
            title:'提示',
            content:msg,
            showCancel:false,
            success:function(res){}
          })
        }
      },
      fail: (res) => {
      }
    })
  },
  changeAddress:function(){
    wx.navigateTo({
      url: '/pages/address/index?url=order'
    })
  },
  // hrefToWXaddress:function(){
  //   wx.chooseAddress({
  //     success(res) {
  //       let realname = res.userName
  //       let mobile = res.telNumber
  //       let
  //       console.log(res.userName)
  //       console.log(res.postalCode)
  //       console.log(res.provinceName)
  //       console.log(res.cityName)
  //       console.log(res.countyName)
  //       console.log(res.detailInfo)
  //       console.log(res.nationalCode)
  //       console.log(res.telNumber)
  //     }
  //   })
  // }
  // 提交生成订单
  submit: function(){
    let _this = this
    let addressId = _this.data.addressId
    let submitGoodsList = _this.data.submitGoodsList
    console.log(addressId);
    console.log(submitGoodsList);
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Order&method=CreateOrder',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        obj:submitGoodsList,
        addressid:addressId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('sessionId')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let orderId = res.data.id
          wx.navigateTo({
            url: '/pages/pay-success/index?Id='+orderId+''
          });
          console.log('订单创建成功，开始调用微信支付');
        }
        else if (code == 1019) {
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else{
          wx.showModal({
            title:'提示',
            content:msg,
            showCancel:false,
            success:function(res){}
          })
        }
      },
      fail: (res) => {
      }
    })
    // setTimeout(function(){
    //   wx.navigateTo({
    //     url: "/pages/pay-success/index"
    //   });
    // },1000)
  },

})
