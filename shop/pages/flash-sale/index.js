// pages/flash-sale/index.js
import formatTime from '../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    idx:0,
    isFlash:false,
    time:{
      hours:'',
      minutes:'',
      seconds:'',
      timer:null,
      
    },
    startTime: 0,
    //time: 1545739200  1545750000,
    timeList: [{ time: '5:00', title: '正在进行', tamp: 1545685200000, isFlash: true }, { time: '9:00', title: '即将开始', tamp: 1545699600000, isFlash: false }, { time: '10:00', title: '即将开始', tamp: 1545703200000, isFlash: false }, { time: '12:00', title: '即将开始', tamp: 1545710400000, isFlash: false }, { time: '15:00', title: '即将开始', tamp: 1545721200000, isFlash: false }, { time: '17:00', title: '即将开始', tamp: 1545728400000, isFlash: false}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    //请求时间列表及项目
    //this.getTimeList()
    //this.getTime(1545750000000)将头部时间转换为如10:00格式
    
    //需要拿到正在进行秒拍活动的时间以及当前的服务器时间
    let start = 0
    for(var item of this.data.timeList){
      item.isFlash == true?start=item.tamp:start=start
    }
    this.setData({
      startTime:start //拿到正在进行秒拍活动的时间戳
    })
  },
  //头部导航点击行为
  handleChose(e){
    let _this = this
    let tamp = e.currentTarget.dataset.tamp
    let isFlash = e.currentTarget.dataset.falsh
    this.setData({
      idx: e.currentTarget.dataset.idx
    })
    clearInterval(()=>{
      _this.timer = null
    })
    this.countDown(this.data.startTime,tamp)
  },
  //获取顶部秒杀时间
  getTimeList(){
    wx.request({
      url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=?&method=?',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' }
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg

          if (code == 1) {
            _this.setData({
              timeList: res.data.timeList,
            })
          }
          else {

          }

      },
      fail: (res) => {
      }
    })
  },
  //点击去抢购进行页面跳转
  hrefToDetail(e){
    console.log(e.currentTarget.dataset.idx)
    // wx.navigateTo({
    //   url: '',
    // })
  },
  //进行时间转换 头部5:00
  getTime(time){
    let date = new Date(time)
    let hours = date.getHours()
    let minutes = formatTime.formatNumber(date.getMinutes())
    return [hours,minutes].join(':')
  },
  //倒计时行为
  countDown(start,end){
    let _this = this
   _this.timer = setInterval(() => {
      start += 1000
      let count = end - start
      let date = new Date(count)
      let hours = formatTime.formatNumber(date.getHours())
      let minutes = formatTime.formatNumber(date.getMinutes())
      let seconds = formatTime.formatNumber(date.getSeconds())
      _this.setData({
        time: {
          hours: hours,
          minutes: minutes,
          seconds: seconds
        }
      })
    }, 1000)
  }
})