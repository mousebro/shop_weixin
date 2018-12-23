// pages/my-order-detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isSuper:true,
    statuTitle:'已完成',
    freightMsg:'您的订单已有本人签收，感谢您在名庄商城购物，欢迎再次光临',
    productList: [{id:1, title: '53°茅台王子酒53°茅台王', thumb: '../../pic/product01.png', price:'888.00',count:1}],
    orderMsg: { number: '951753852951', orderTime: '2018-12-14 15:30', payTime:'2018-12-14 15:30'},
    customer: { name: '张三', phone: '15659165566', address:'福建省福州市闽侯镇软件园G区1#13'},
    bills: { pTotal: '888.00', freight: '10.00', coupon:'100.00',supers:'50.00',pay:'748.00'}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  /*点击去评价按钮，进行页面跳转*/
  hrefCommit(){

  },
  /*点击联系客服*/
  hrefCService(){
    console.log("fdsf")
  }
})