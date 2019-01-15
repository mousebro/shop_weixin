// pages/flash-sale/index.js
import formatTime from '../../utils/util.js'
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    idx:0,
    isFlash:true,
    time:{
      hours:'',
      minutes:'',
      seconds:'',
      timer:null,
      choseTime:'19:00'
    },
    startTime: 0,
    //time: 1545739200  1545750000,
    timeList: [{ time: '5:00', title: '正在进行', tamp: 1545685200000, isFlash: true }, { time: '9:00', title: '即将开始', tamp: 1545699600000, isFlash: false }, { time: '10:00', title: '即将开始', tamp: 1545703200000, isFlash: false }, { time: '12:00', title: '即将开始', tamp: 1545710400000, isFlash: false }, { time: '15:00', title: '即将开始', tamp: 1545721200000, isFlash: false }, { time: '17:00', title: '即将开始', tamp: 1545728400000, isFlash: false}]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
    _this.getTimeList()
    //请求时间列表及项目
    //this.getTimeList()
    //this.getTime(1545750000000)将头部时间转换为如10:00格式
   
  },
  timeInint(){ //初始时设置倒计时状态值
    //需要拿到正在进行秒拍活动的时间以及当前的服务器时间
    let _this = this
    let start = _this.data.startTime
    let list = _this.data.timeList
    let idx = 0
    _this.setData({
      startTime: start //拿到正在进行秒拍活动的时间
    })
    //设置正在进行秒杀活动的倒计时
    console.log(start,list[idx+1].time)
    return
    _this.countDown(start, list[idx + 1].time)
  },
  //头部导航点击行为
  handleChose(e){
    let _this = this
    let tamp = e.currentTarget.dataset.tamp
    let isFlash = e.currentTarget.dataset.falsh
    this.setData({
      idx: e.currentTarget.dataset.idx,
      choseTime: _this.data.timeList[e.currentTarget.dataset.idx].time
    })
    clearInterval(this.data.timer) //清除倒计时的定时器
    if(isFlash){
      _this.timeInint()
      _this.setData({
        isFlash: true
      })
    }else{
      _this.countDown(this.data.startTime, tamp) //设置新的倒计时
      _this.setData({
        isFlash: false
      })
    }
  },
  // 根据专题ID来获取对应的秒杀时间列表
  getTimeList(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      id:1
    })
    this.setHttpRequst('Seckill','GetTimeList',Data,function(res){
      let timeList = res.data.timeList //并对时间列表进行处理
      for(var i in timeList){
        console.log(timeList[i].status)
        if(timeList[i].status == 1){
          timeList[i].title = '即将开始'
        }else if(timeList[i].status == 2){
          timeList[i].title = '正在进行'
          _this.setData({
            idx:i, //默认选中正在进行的秒拍的时间
            startTime:timeList[i].time
          })
        }else if(timeList[i].status == 3){
          timeList[i].title = '已结束'
          // if((parseInt(i)+1)<timeList.length && timeList[i+1].status==1){
          //   timeList[i].title = '正在进行'
          //   _this.setData({
          //     idx:i, //默认选中正在进行的秒拍的时间
          //     startTime:timeList[i].time
          //   })
          // }
        }
        timeList[i].timeStr = timeList[i].time+':00' //转成5:00的时间格式
      }
      _this.setData({
        timeList:timeList
      })
      _this.getSystemTime(function(){ //获取完系统时间后进行倒计时初始化
        _this.timeInint()   
      })
    })
  },
  //点击去抢购进行页面跳转
  hrefToDetail(e){
    let idx = e.currentTarget.dataset.idx
    console.log(idx)
    wx.navigateTo({
      url: '/pages/flash-detail/index?Id='+idx,
    })
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
    console.log(end,start,_this.data.nowTimeStamp)
    let date = new Date(_this.data.nowTimeStamp*1000)
    console.log(date.getHours())
    end = _this.data.nowTimeStamp*1000 + (end-date.getHours())*3600*1000
    start = _this.data.nowTimeStamp*1000
    console.log(start,end)
  //  _this.data.timer = setInterval(() => {
  //   start += 1000
  //   let count = end - start
  //   let hours = formatTime.formatNumber(parseInt(count / 1000 / 3600))
  //   let minutes = formatTime.formatNumber(parseInt((count-parseInt(hours)*1000*3600) / 1000/60 ))
  //   let seconds = formatTime.formatNumber(parseInt((count - parseInt(hours) * 1000 * 3600 - parseInt(minutes) * 1000 * 60) /1000))
  //     _this.setData({
  //       time: {
  //         hours: hours,
  //         minutes: minutes,
  //         seconds: seconds
  //       }
  //     })
  //   }, 1000)
  },
  //获取系统时间
  getSystemTime(Succ){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
    })
    _this.setHttpRequst('System','GetBaseInfo',Data,function(res){
      _this.setData({
        nowTimeStamp:res.data.serverTimeStamp
      })
      Succ()
    })
  },
  //发送http请求
  setHttpRequst(Class,Method,Data,Succ,Fail){
    let _this = this
    wx.request({
      url: `https://${app.globalData.productUrl}/api?resprotocol=json&reqprotocol=json&class=${Class}&method=${Method}`,
      method: 'post',
      data: Data,
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            Succ(res)
          }
          else {
            Fail(res)
          }
        }else {
          wx.showModal({
            title:'提示',
            content:msg,
            showCancel:false,
            success:function(res){
              wx.navigateBack({
                delta:1
              })
            }
          })
        }
      },
      fail: (res) => {
      }
    })
  },
})