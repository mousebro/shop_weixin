// pages/sign-in-center/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    headImg:'/images/sign-in-center/background.png'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let headImg = wx.getFileSystemManager().readFileSync(this.data.headImg,'base64')
    this.setData({
      headImg:'data:image/jpg;base64,' + headImg,
    })
  },

  
})