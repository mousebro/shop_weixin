//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    isChose:1,
    usedImg:"/images/discount/used.png",
    doneBgImg:'/images/receive-coupon-center/done.png',
    imgUrl:'',
    currentPage:1,
  },
  onShow: function(){
  },
  onLoad: function(options){
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    let totalPrice = parseFloat(options.totalPrice) + parseFloat(options.couponPrice)*100
    console.log(totalPrice)
    let fare = options.fare
    let submitGoodsList = JSON.parse(options.submitGoodsList)
    let couponId = options.couponId //默认选中的couponid
    _this.setData({
      totalPrice:totalPrice,
      payPrice:totalPrice,
      submitGoodsList:submitGoodsList,
      fare:fare,
      couponId:couponId
    })
    //对本地背景图片编译
    let usedImg = wx.getFileSystemManager().readFileSync(_this.data.usedImg,'base64')
    let doneBgImg = wx.getFileSystemManager().readFileSync(this.data.doneBgImg,'base64')
    this.setData({
      usedImg:'data:image/jpg;base64,' + usedImg,
      doneBgImg:'data:image/jpg;base64,' + doneBgImg,
      imgUrl:'data:image/jpg;base64,' + doneBgImg
    })

    _this.getCouponList()
  },
  //头部选项卡点击事件
  handleTap(e){
    this.setData({
      couponList:[]
    })
    let index = e.target.dataset.idx//判断头部哪一个被点击，并获取其下标值
    let imgUrl = ''
    imgUrl = index == 1?this.data.doneBgImg:imgUrl
    imgUrl = index == 2?this.data.usedImg:imgUrl
    imgUrl = index == 3?this.data.usedImg:imgUrl
    this.setData({
      isChose:index,
      currentPage:1,
      imgUrl:imgUrl
    })
    //根据选项卡来请求不同的数据
    let _this = this
    _this.getCouponList()
  },
  // 获取优惠券列表
  getCouponList:function(){
    let _this = this
    let status = 4 //优惠券可用 
    if(_this.data.isChose == 2){
      status = 5 //优惠券不可用
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShopCoupon&method=UserCouponList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        page:1,
        pageLength:5,
        status:status,
        isPage:false,
        obj:_this.data.submitGoodsList
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        wx.hideLoading()
        if (code == 1) {
          let couponList = res.data.couponList
          console.log(couponList,'couponlist')
          for(var i in couponList){
              couponList[i].choseStatus = 0 //设置每个优惠券未被选中的状态
              let start= new Date(couponList[i].timestart*1000)
              let startTime = [start.getFullYear(),start.getMonth()+1,start.getDate()]
              let end = new Date(couponList[i].timeend*1000)
              let endTime = [end.getFullYear(),end.getMonth()+1,end.getDate()]
              couponList[i].startTime = startTime.join(".")
              couponList[i].endTime = endTime.join(".")
            couponList[i].newDeduct = couponList[i].deduct.split('.')
            couponList[i].discount = couponList[i].discount.slice(0,3)
            couponList[i].enough = couponList[i].enough.split(".")[0]
            couponList[i].limitMsg = 0 //是否显示商品提示下拉框
            if(couponList[i].couponItemId == _this.data.couponId){
              couponList[i].choseStatus = 1 //默认选中可用优惠券第一个 如果已经选择其他优惠券 则根据其优惠券id进行勾选样式显示
            }
          }
          _this.setData({
            choseCoupon:false,
            couponList:couponList
          })
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
    // let couponList = [{id:1,couponname:'满减50优惠券',deduct:'50',enough:'1000',backtype:0,timelimit:1,timestart:'2019.1.1',timeend:'2019.1.10'},{id:2,couponname:'95折折扣券',discount:'9.5',enough:'0',backtype:1,beginTime:'2019.1.1',endTime:'2019.1.10'}]
  },
  // 点击打开优惠券列表
  choseCoupon:function(){
    let _this = this
    let couponList = _this.data.couponList
    _this.setData({
      showModal:true
    })
  },
  // 使用现金券
  useCashCoupon:function(e){
    if(this.data.isChose == 2)return
    let _this = this
    let couponId = e.currentTarget.dataset.id
    let couponPrice = e.currentTarget.dataset.price
    let idx = e.currentTarget.dataset.idx
    let couponList = _this.data.couponList
    let submitGoodsList = _this.data.submitGoodsList
    //根据优惠券限制单商品
    let limitgoodcateids = e.currentTarget.dataset.limitgoodcateids.split(",") //根据哪些商品分类
    let limitgoodcatetype = e.currentTarget.dataset.limitgoodcatetype //是否根据商品分类
    let limitgoodids = e.currentTarget.dataset.limitgoodids.split(",")  //根据哪些商品id
    let limitgoodtype = e.currentTarget.dataset.limitgoodtype //是否根据商品id
    let payPrice = _this.data.payPrice
    let usePrice = parseFloat(e.currentTarget.dataset.useprice) //满减条件金额
    let totalPrice = _this.data.totalPrice/100 
    couponList[idx].choseStatus = 1
    _this.setData({
      couponList:couponList
    })
    //单商品符合满减条件
    let goodsPrice = 0   
    // if(limitgoodtype == 1){
    //   for(let i in submitGoodsList){
    //     for(let j in limitgoodids){
    //       if(limitgoodids[j] == submitGoodsList[i].id){
    //         goodsPrice += submitGoodsList[i].price * submitGoodsList[i].total
    //       }
    //     }
    //   }
    // }else if(limitgoodcatetype == 1){
    //   for(let i in submitGoodsList){
    //     for(let j in submitGoodsList[i].cateTotal){
    //       for(let k in limitgoodcateids){
    //         if(limitgoodcateids[k] == submitGoodsList[i].cateTotal[j]){
    //           goodsPrice += submitGoodsList[i].price * submitGoodsList[i].total
    //         }
    //       }
    //     }
    //   }
    // }else if(limitgoodtype == 0 && limitgoodcatetype == 0){
    //   goodsPrice = _this.data.totalPrice
    // }
    goodsPrice = goodsPrice/100
    //没加针对单商品优惠劵前
    payPrice = _this.data.payPrice - couponPrice*100
    console.log(goodsPrice,'goodsPrice',usePrice)
    if (false) {
      wx.showModal({
        title:'提示',
        content:'该券不满足满减条件',
        showCancel:false,
        success:function(res){}
      })
    }
    else {
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2];//上一页面
      prevPage.setData({//直接给上移页面赋值
        couponId:couponId,
        showModal:false,
        couponBackType:0,
        couponPrice:couponPrice,
        showPayPrice:payPrice,
        countPrice:payPrice,
        choseCoupon:true,
        integral:0
      },function(){
        wx.navigateBack()
      })
     
    }
  },
  // 使用折扣券
  useDiscountCoupon:function(e){
    let _this = this
    let couponId = e.currentTarget.dataset.id
    let discount = e.currentTarget.dataset.discount
    //根据优惠券限制单商品
    let limitgoodcateids = e.currentTarget.dataset.limitgoodcateids.split(",") //根据哪些商品分类
    let limitgoodcatetype = e.currentTarget.dataset.limitgoodcatetype //是否根据商品分类
    let limitgoodids = e.currentTarget.dataset.limitgoodids.split(",")  //根据哪些商品id
    let limitgoodtype = e.currentTarget.dataset.limitgoodtype //是否根据商品id
    let submitGoodsList = _this.data.submitGoodsList
    let usePrice = parseFloat(e.currentTarget.dataset.useprice)
    let totalPrice = parseFloat(_this.data.totalPrice)
    let fare = parseFloat(_this.data.fare)*100
    totalPrice = totalPrice - fare //运费不做折扣处理
    //let couponPrice = parseInt((totalPrice - totalPrice*discount/10))/100
    let goodsPrice = 0 
    //单商品符合折扣条件
     if(limitgoodtype == 1){
       for(let i in submitGoodsList){
         for(let j in limitgoodids){
           if(limitgoodcateids[j] == submitGoodsList[i].id){
             goodsPrice += submitGoodsList[i].price * submitGoodsList[i].total
           }
         }
       }
     }else if(limitgoodcatetype == 1){
       for(let i in submitGoodsList){
         for(let j in submitGoodsList[i].cateTotal){
           for(let k in limitgoodcateids){
             if(limitgoodcateids[k] == submitGoodsList[i].cateTotal[j]){
               goodsPrice += submitGoodsList[i].price * submitGoodsList[i].total
             }
           }
         }
       }
     }else if(limitgoodtype == 0 && limitgoodcatetype == 0){
       goodsPrice = totalPrice
     }
     goodsPrice = goodsPrice
    if(goodsPrice==0)return
    let couponPrice = parseInt(goodsPrice - goodsPrice*discount/10)/100
    let payPrice = parseInt(totalPrice - couponPrice*100 + _this.data.fare*100)
    //let payPrice = parseInt(goodsPrice - couponPrice*100)
    
    if (totalPrice < usePrice*100) {
      wx.showModal({
        title:'提示',
        content:'该券不满足满减条件',
        showCancel:false,
        success:function(res){}
      })
    }
    else {
      let pages = getCurrentPages()
      let prevPage = pages[pages.length - 2];//上一页面
      prevPage.setData({//直接给上移页面赋值
        couponId:couponId,
        showModal:false,
        couponBackType:1,
        couponPrice:couponPrice,
        showPayPrice:payPrice,
        countPrice:payPrice,
        couponDiscount:discount,
        choseCoupon:true,
        integral:0
      })
      wx.navigateBack()
    }
  },
  // 不使用优惠券
  useNoCoupon:function(e){
    let _this = this
    let pages = getCurrentPages()
    let prevPage = pages[pages.length - 2];//上一页面
    prevPage.setData({//直接给上移页面赋值
      couponId:'',
      showModal:false,
      choseCoupon:false,
      countPrice:_this.data.payPrice,
      showPayPrice:_this.data.payPrice,
      integral:0
    })
    wx.navigateBack()
  },
  //打开下拉限制商品下拉列表
  openLimitMesg(e){
    let couponList = this.data.couponList
    let idx = e.currentTarget.dataset.idx
    let limitMsg = couponList[idx].limitMsg
    couponList[idx].limitMsg = !limitMsg
    this.setData({
      couponList:couponList
    })
  }
})
