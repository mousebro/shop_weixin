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
      choseTime:'19:00',
    },
    nowPage:1,
    startTime: 0,
    toView:'item1'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    _this.getTimeList()
  },
  onUnload(){
  },
  timeInint(){ //初始时设置倒计时状态值
    //需要拿到正在进行秒拍活动的时间以及当前的服务器时间
    let _this = this
    //设置正在进行秒杀活动的倒计时
  
    if(!_this.data.timeList[_this.data.idx])return
    // console.log("fdsafd")
    if(_this.data.isFlash == 2 && _this.data.timeList[_this.data.idx+1].time){
      _this.countDown(_this.data.startTime, parseInt(_this.data.startTime)+1)
    }else{
      _this.countDown(_this.data.startTime, _this.data.timeList[_this.data.idx+1].time)
    }
    
  },
  //头部导航点击行为
  handleChose(e){
    let _this = this
    let time = e.currentTarget.dataset.time
    let status = e.currentTarget.dataset.status
    this.setData({
      idx: e.currentTarget.dataset.idx,
      choseTime: _this.data.timeList[e.currentTarget.dataset.idx].timeStr,
      timeid:e.currentTarget.dataset.id,
      nowPage:1
    })
    clearInterval(this.data.timer) //清除倒计时的定时器
    if(status == 2){ //选中正在进行当中
      _this.timeInint()
      _this.setData({
        isFlash: 2
      })
    }else if(status == 3){ //选中已经结束的
      _this.setData({
        isFlash: 3
      })
    }else if(status == 1){ //选中还未开始的
      _this.setData({
        isFlash:1
      })
      _this.countDown(_this.data.startTime,time)
    }
    _this.getSecKillList() // 获取抢购商品列表  
  },
  // 根据专题ID来获取对应的秒杀时间列表
  getTimeList(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
    })
    this.setHttpRequst('Seckill','GetTimeList',Data,function(res){
      let timeList = res.data.timeList //并对时间列表进行处理
      let activeItem = ''
      for(var i in timeList){
        timeList[i].toViewId = 'item'+timeList[i].id
        timeList[i].timeStr = timeList[i].time+':00' //转成5:00的时间格式
        if(timeList[i].status == 1){
          timeList[i].title = '即将开始'
        }else if(timeList[i].status == 2){
          console.log(timeList[i].time,'开始时间')
          timeList[i].title = '正在进行'
          _this.setData({
            idx:parseInt(i), //默认选中正在进行的秒拍的时间
            startTime:timeList[i].time,
            isFlash:2,
            timeid:timeList[i].id,
            nowPage:1,
            choseTime:timeList[i].timeStr,
          })
          activeItem = timeList[i].toViewId
        }else if(timeList[i].status == 3){
          timeList[i].title = '已结束'
          if((parseInt(i)+1)<timeList.length && timeList[parseInt(i)+1].status == 1){
            timeList[parseInt(i)+1].toViewId = 'item'+timeList[parseInt(i)+1].id
            timeList[parseInt(i)+1].timeStr = timeList[parseInt(i)+1].time+':00' //转成5:00的时间格式
            activeItem =timeList[parseInt(i)+1].toViewId
            timeList[parseInt(i)+1].title = '即将开始'
            _this.setData({
              idx:parseInt(i)+1, //默认选中正在进行的秒拍的时间
              startTime:timeList[parseInt(i)+1].time,
              isFlash:1,
              timeid:timeList[parseInt(i)+1].id,
              nowPage:1,
              choseTime:timeList[parseInt(i)+1].timeStr
            })
          }

        }
        
      }
      _this.setData({
        timeList:timeList,
        toView:activeItem
      })
      _this.getSystemTime(function(){ //获取完系统时间后进行倒计时初始化
        _this.timeInint()   
        _this.getSecKillList() // 获取秒杀商品列表
      })
      
    })
  },
  //点击去抢购进行页面跳转
  hrefToDetail(e){
    let idx = e.currentTarget.dataset.idx
    let isFlash = this.data.isFlash
    let saleRate = e.currentTarget.dataset.salerate
    console.log(e.currentTarget.dataset)
    if(isFlash!=2){
      if(isFlash == 3){
        wx.showModal({
          title:'提示',
          content:"该秒杀已结束",
          showCancel:false,
          success:()=>{
          }
        })
      }else{
        wx.showModal({
          title:'提示',
          content:'该秒杀还未开始',
          showCancel:false,
          success:()=>{
          }
        })
      }
      return
    }else if(saleRate==100){
      wx.showModal({
        title:'提示',
        content:"该秒杀已结束",
        showCancel:false,
        success:()=>{
        }
      })
      return
    }else if(saleRate!=100){
      wx.navigateTo({
        url: '/pages/flash/index?Id='+idx+'&start='+this.data.newStart+'&end='+this.data.newEnd,
      })
    }

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
    start = parseInt(start)
    end = parseInt(end)
    let date = new Date(_this.data.nowTimeStamp*1000)
    let newStart = _this.data.nowTimeStamp*1000-(date.getHours()-start)*3600*1000 - date.getMinutes()*60*1000-date.getSeconds()*1000
    let newEnd = (end-start)*3600*1000 + newStart
    newStart =  _this.data.nowTimeStamp*1000
    console.log('时间倒计时',newEnd,newStart)
   _this.data.timer = setInterval(() => {
    newStart += 1000
    let count = newEnd - newStart
    let hours = formatTime.formatNumber(parseInt(count / 1000 / 3600))
    let minutes = formatTime.formatNumber(parseInt((count-parseInt(hours)*1000*3600) / 1000/60 ))
    let seconds = formatTime.formatNumber(parseInt((count - parseInt(hours) * 1000 * 3600 - parseInt(minutes) * 1000 * 60) /1000))
    //如果hours minutes seconds都归零的时候重新获取商品和时间表
    if(hours == 0 && minutes == 0 && seconds == 0){
      clearInterval(_this.data.timer)
      _this.getTimeList()
    }
    if(_this.data.isFlash==2 && hours==0 && minutes<=50){
      _this.setData({
        isFlash:3
      })
    }
      _this.setData({
        time: {
          hours: hours,
          minutes: minutes,
          seconds: seconds,
        },
        newStart:newStart, 
        newEnd:newEnd
      })
    }, 1000)
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
  //获取秒杀商品列表
  getSecKillList(){
    let _this = this
    let Data = JSON.stringify({
      baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '' },
      page:_this.data.nowPage,
      pageLength:10,
      timeid:_this.data.timeid,
      roomid:0
    })
    _this.setHttpRequst('Seckill','GetGoodsList',Data,function(res){
      let goodsList = res.data.goodsList
      let seckPriceArr = []
      for(var item of goodsList){
       if(item.thumb.slice(0,4)!='http'){
        item.thumb = app.globalData.imageUrl + item.thumb
       }
      if(item.seckillprice){
        seckPriceArr = item.seckillprice.split(".")
      }
      item.seckPriceArr = seckPriceArr
      console.log(item)
      console.log("sales",item.sales,item.total)
      let saleRate =parseInt(parseInt(item.sales)/parseInt(item.total)*100)
      item.saleRate = saleRate
    }
      _this.setData({
        goodsList:res.data.goodsList,
      })
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
  onReachBottom: function(){
    let _this = this
    let page = _this.data.nowPage + 1
    _this.setData({
      nowPage:page
    },()=>{
      _this.getSecKillList()
    })
  }
})