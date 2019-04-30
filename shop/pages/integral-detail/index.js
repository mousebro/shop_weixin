// pages/integral-detail/index.js
import formatTime from '../../utils/util.js'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPage:1,
    getTabBar:true //true代表已到账 、false代表冻结中
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    this.getCreditList()
  },
  //获取购物金出入账记录
  getCreditList(isget=1){ //1默认是已到账 2冻结中
  let _this = this
  let isLogin = wx.getStorageSync('isLogin')
  if (!isLogin) {
    wx.navigateTo({
      url: '/pages/login/index',
    })}
    else{
      wx.showLoading({
        title:'正在加载中~',
        icon:'loading'
      })
      let url = 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Credit&method=GetCreditList'
      if(isget == 2){
        url = 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=Credit&method=GetCreditFreezeList'
      }
      wx.request({
        url: url,
        method: 'post',
        data: JSON.stringify({
          baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
          page:_this.data.currentPage,
          pageLength:10
        }),
        header: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
        },
        success: (res) => {
          wx.hideLoading()
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
           let creditList =  res.data.creditList || res.data.creditFreezeList
            for(let i in creditList){
              let time = new Date(creditList[i].createtime * 1000)
              creditList[i].newCreatTime = formatTime.formatTime(time)
            }
            _this.setData({
              creditList:creditList,
              pageCount:res.data.pageCount,
            })
            if(res.data.freezeCredit != _this.data.freezeCredit){
              _this.setData({
                freezeCredit:res.data.freezeCredit || '0',
              })
            }else if (_this.data.credit != res.data.credit){
              _this.setData({
                credit:res.data.credit 
              })
            }
          } else {
            console.log(res.msg)
          }
  
        },
        fail: (res) => {
          wx.hideLoading()
        }
      })
    }
  },
  //下拉触底加载更多
  getMoreRecord(){
   let currentPage = this.data.currentPage
   let _this = this
   currentPage++
   if(currentPage > _this.data.pageCount){
     wx.showToast({
       title:'没有更多了~',
       image:'/images/nomore.png'
     })
     return false;
   }else{
    this.setData({
      currentPage:currentPage
     },function(){
       if(!_this.data.getTabBar){
        _this.getCreditList(2) //冻结记录
       }else{
        _this.getCreditList()
       }
     })
   }
  },
  //点击头部tabbar转换
  changeTabBarA(){
    let _this = this
    this.setData({
      getTabBar:true,
      currentPage:1
    },function(){
      _this.getCreditList()
    })
  },
  changeTabBarB(){
    let _this = this
    this.setData({
      getTabBar:false,
      currentPage:1
    },function(){
      _this.getCreditList(2)
    })
  }
})