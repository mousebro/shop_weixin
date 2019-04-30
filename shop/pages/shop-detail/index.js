//index.js
//获取应用实例
const app = getApp()
let WxParse = require('../../wxParse/wxParse.js');
let swiperCurrent = 0
Page({
  data: {
    buyNumber:1,
    buyNumMin:1,
    buyNumMax:9999,
    shopCarInfo:{},
    showActive:'a1',
    actionSheetHidden:true,
    imgUrl:'',
    shopId:'',
    actionSort:true,
    opacity:0,
    menuMsg:'导航',
    noClloctImg:'../../images/article/collect-no.png', //未收藏图标
    hasClloctImg:'../../images/article/collect.png', //已收藏图标
    frontPictureVar:'?x-oss-process=image/resize,w_375,limit_1' //对图片进行压缩
  },
  onShow: function(){
    let menuNum = [{imageUrl:'/images/shop-detail/gold.png'},{imageUrl:'/images/shop-detail/sort.png'},{imageUrl:'/images/shop-detail/mine.png'},{imageUrl:'/images/shop-detail/index.png'},]

    this.setData({
      menuNum:menuNum
    })

    let _this = this
    // 获取购物车数据
    wx.getStorage({
      key: 'shopCarInfo',
      success: function(res) {
        _this.setData({
          shopCarInfo:res.data,
          shopNum:res.data.shopNum
        });
      }
    })
  },
  onHide(){
    this.setData({
      opacity:0,
      isOpenMenu:false,
      showModal:false
    })
    if(this.data.modal2){ //如果弹出立即购买弹窗，不必关闭遮罩层
      this.setData({
        showModal:true
      })
    }
  },

  onLoad: function(options){
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let shopId = options.Id
    // let issuper = options.issuper || 0//判断是否是从会员专属商品列表进入
    // this.setData({
    //   issuper:issuper
    // })
    let _this = this
    let scene = decodeURIComponent(options.scene) // 判断是否是扫小程序码进入的用户
    if (scene == 'undefined') {
      let shopId = options.Id
      if (shopId == undefined) {
        let showShopId = wx.getStorageSync('showShopId') // 从其他小程序跳转到该小程序的读取id方式
        this.setData({
          shopId:showShopId,
          imageUrl: app.globalData.imageUrl,
          isIpx:app.globalData.isIpx
        })
      }
      else {
        this.setData({
          shopId:shopId,
          imageUrl: app.globalData.imageUrl,
          isIpx:app.globalData.isIpx
        })
      }
    }
    else {
      let shopId = 0
      if(scene.length<16){
        shopId = scene
      }else{
        var drpCode = scene.substr(0, 16)
        shopId = scene.substr(16)
        wx.setStorageSync('drpCode', drpCode)
      }
      this.setData({
        shopId:shopId,
        imageUrl: app.globalData.imageUrl,
        isIpx:app.globalData.isIpx
      })
    }
    _this.getGoodsInfo()
    _this.getCommentList()
    _this.recordShopView(1)
  },
  // 点击商品以及点击详情定位
  scrollPosition: function(e){
    let _this = this
    let showId = e.currentTarget.dataset.id
    _this.setData({
      showActive:showId,
      toView:showId
    })
  },
  //无库存时引导用户咨询客服弹窗
  showStoskMask(){
    this.setData({
      showModal:true,
      showStosk:true
    })
  },
  //关闭用户咨询客服弹窗
  closeStoskMask(){
    this.setData({
      showModal:false,
      showStosk:false
    })
  },
  // 获取评论列表
  getCommentList: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=OrderComment&method=GetCommentList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        page: 1,
        pageLength: 1,
        goodsid: _this.data.shopId,
        type:1
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let commentList = res.data.commentList
          let totalComment = res.data.totalNum
          for(let i in commentList){
            let img = commentList[i].headimgurl
            let url = img.slice(0,4)
            if(url != 'http'){
              commentList[i].headimgurl = app.globalData.imageUrl + img
            }
          }
          _this.setData({
            commentList:commentList,
            totalComment:totalComment
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
  // 跳转到全部评论
  hrefToCommentList: function(){
    let _this = this
    wx.navigateTo({
      url: '/pages/commit-list/index?id='+_this.data.shopId+'&type=1'
    });
  },
  // 展示加入购物车
  showBuyCar: function(){
    this.setData({
      showModal:true,
      modal1:true
    })
  },
  // 关闭购物车弹窗
  closeModal1: function(){
    this.setData({
      showModal:false,
      modal1:false
    })
  },
  // 展示立即购买
  showBuy: function(){
    this.setData({
      showModal:true,
      modal2:true
    })
  },
  // 关闭立即购买弹窗
  closeModal2: function(){
    this.setData({
      showModal:false,
      modal2:false
    })
  },
  // 跳转到购物车
  hrefToShopCart: function(){
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    else {
      wx.navigateTo({
        url: "/pages/shop-cart/index"
      });
    }
  },
  // 跳转到订单支付
  hrefToPay: function(){
    let _this = this
    _this.recordShopView(2)//商品的浏览记录
    let isLogin = wx.getStorageSync('isLogin')
    
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
    }
    else {
      let shopList = []
      let id = 0
      let goodsId = _this.data.id;
      let pic = _this.data.choseSpecImg
      let name = _this.data.title
      let number = _this.data.buyNumber;
      let price = _this.data.countPrice;
      let cateTotal = _this.data.cateTotal
      let spec = _this.data.choseSpecId //商品规格分类
      let specTitle = _this.data.specTitle
      shopList.push({id:id,goodsId:goodsId,pic:pic,name:name,number:number,price:price,cateTotal:cateTotal,spec:spec,specTitle:specTitle,total:number})
      
      wx.setStorage({
        key:"orderShopList",
        data:shopList,
        success:function(){
          let obj = [{id:goodsId,total:number,spec:spec}]
          _this.checkStock(obj)
        }
      })
    }
  },
  //检查库存是否不足
  checkStock(obj){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Goods&method=CheckStock',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        obj:obj,
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          let isLeft = res.data.isLeft
          if(isLeft!=0){
            wx.navigateTo({
              url: "/pages/pay/index"
            });
          }else{
            _this.setData({
              modal2:false
            },function(){
              _this.showStoskMask()
            })
          }
        }
        else {
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
  // 商品数量增减
  lessTap: function() {
     if(this.data.buyNumber > this.data.buyNumMin){
        let currentNum = this.data.buyNumber;
        currentNum--;
        let price = this.data.countPrice
        let showPrice = (currentNum*price).toFixed(2)
        this.setData({
            buyNumber: currentNum,
            price:showPrice
        })
     }
  },
  plusTap: function() {
     if(this.data.buyNumber < this.data.buyNumMax){
        var currentNum = this.data.buyNumber;
        currentNum++ ;
        let price = this.data.countPrice
        let showPrice = (currentNum*price).toFixed(2)
        this.setData({
            buyNumber: currentNum,
            price:showPrice
        })
     }
  },
  // 加入本地购物车
  addShopCar: function() {
    let shopCarInfo = this.bulidShopCarInfo();
    this.setData({
      shopCarInfo:shopCarInfo,
      shopNum:shopCarInfo.shopNum
    });
    // 写入本地存储
    wx.setStorage({
      key:"shopCarInfo",
      data:shopCarInfo
    })
  },
  // 构建购物车信息
  bulidShopCarInfo: function () {
    let shopCarMap = {};
    shopCarMap.goodsId = this.data.id;
    shopCarMap.pic = this.data.goodsPicture
    shopCarMap.name = this.data.title
    shopCarMap.number = this.data.buyNumber;
    shopCarMap.price = this.data.countPrice;
    let shopCarInfo = this.data.shopCarInfo;
    this.addGoods()
    if (!shopCarInfo.shopNum) {
      shopCarInfo.shopNum = 0;
    }
    if (!shopCarInfo.shopList) {
      shopCarInfo.shopList = [];
    }
    // 判断是否有相同项，合并相同项
    let hasSameGoodsIndex = -1;
    for (var i = 0; i < shopCarInfo.shopList.length; i++) {
      let tmpShopCarMap = shopCarInfo.shopList[i];
      if (tmpShopCarMap.goodsId == shopCarMap.goodsId && tmpShopCarMap.propertyChildIds == shopCarMap.propertyChildIds) {
        hasSameGoodsIndex = i;
        shopCarMap.number = shopCarMap.number + tmpShopCarMap.number;
        break;
      }
    }
    // 购物车数量增加
    shopCarInfo.shopNum = shopCarInfo.shopNum + this.data.buyNumber;
    if (hasSameGoodsIndex > -1) {
      shopCarInfo.shopList.splice(hasSameGoodsIndex, 1, shopCarMap);
    } else {
      shopCarInfo.shopList.push(shopCarMap);
    }
    return shopCarInfo;
  },
  // 获取商品详情
  getGoodsInfo: function(){
    wx.showLoading({
      title:'加载中',
      mask:true
    })
    let _this = this
    let cookie = ''
    if(wx.getStorageSync('token')){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsInfo',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id: _this.data.shopId
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
          "cookie":cookie
      },
      success: (res) => {
        wx.hideLoading()
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            let goodsInfo = res.data.goodsInfo
            let id = goodsInfo.id
            let title = goodsInfo.title
            let productprice = goodsInfo.productprice
            let marketprice = goodsInfo.marketprice
            let thumbUrl = goodsInfo.thumbUrl
            let subtitle = goodsInfo.subtitle
            let hasCollect = goodsInfo.collect  || 0//判断商品是否已经收藏
            let cateTotal = [] //商品分类
            cateTotal.push(goodsInfo.ccate)
            cateTotal.push(goodsInfo.pcate)
            cateTotal.push(goodsInfo.tcate)
            
            for (let i = 0; i < thumbUrl.length; i++) {
              let img = thumbUrl[i]
              let url = img.slice(0,4)
              if (url != 'http') {
                thumbUrl[i] = app.globalData.imageUrl+img
              }
            }
            //商品规格
            let choseSpecArr = []
            let specOptions = goodsInfo.option //多规格组合后图片、价格等组合
            //specAllArr为含有首个规格id的所有规格组合集合
            let specAllArr = []
            //选中其他项组合 只选择一次  
            let hasChoseOtherId = true 
            if(goodsInfo.hasoption!=0){
              for(let l in specOptions){
                let specsArr = specOptions[l].specs.split(",")
                if(specsArr.includes(goodsInfo.spec[0].items[0].id.toString())){
                  specAllArr = specAllArr.concat(specsArr)
                }
              }
              let spec = goodsInfo.spec
              for(let j = 0;j < spec.length;j++){
                let option = spec[j].items
                hasChoseOtherId = true 
                for(let k = 0;k < option.length;k++){
                  // marketprice = option[0].marketprice
                  // productprice = option[0].productprice
                  if(k!=0){
                    goodsInfo.spec[j].items[k].hasChose = 0
                    goodsInfo.spec[j].items[k].isShow = 1
                  }else{
                    if(specAllArr.includes(goodsInfo.spec[j].items[k].id.toString()) && hasChoseOtherId){
                      goodsInfo.spec[j].items[k].hasChose = 1 //默认选中每个分类的首项
                      hasChoseOtherId = false //已经选完默认项
                      choseSpecArr.push(goodsInfo.spec[j].items[k].id)
                    }else{
                      goodsInfo.spec[j].items[k].hasChose = 0 //默认选中每个分类的首项
                    }
                    goodsInfo.spec[j].items[k].isShow = 1
                  }

                  // thumbUrl[0] = goodsInfo.spec[0].option[0].thumb
                }
              }
            }
            console.log(specOptions,'options')
            let choseSpecImg = ''//默认选中的规格图片
            let choseSpecId = " " //默认选中的规格id
            for(let op in specOptions){
              let img = specOptions[op].thumb
              let url = img.slice(0,4)
              if (url != 'http') {
                specOptions[op].thumb = app.globalData.imageUrl + img
              }

              specOptions[op].specsArr = specOptions[op].specs.split(",")
              if(specOptions[op].specsArr.length == choseSpecArr.length){
                let isSame = 1
                specOptions[op].specsArr.forEach(ele => {
                  let a = choseSpecArr.includes(parseInt(ele))
                  isSame = a && isSame
                });
                if(isSame){
                  choseSpecImg = specOptions[op].thumb
                  marketprice =  specOptions[op].marketprice
                  productprice =  specOptions[op].productprice
                  choseSpecId = specOptions[op].id
                  _this.setData({
                    specTitle:specOptions[op].title
                  })
                }
              }
            }
            if(specOptions.length == 0){
              choseSpecImg = goodsInfo.thumbUrl[0]
            }
            // //会员价显示
            // if(_this.data.issuper == 1){
            //   marketprice = goodsInfo.superprice
            // }
            let spec = goodsInfo.spec
            let goodsPicture = goodsInfo.thumbUrl[0]
            let description = goodsInfo.content
            let countPrice = parseFloat(marketprice)
            WxParse.wxParse('content', 'html', description, _this, 5);
            _this.setData({
              goodsInfo:goodsInfo,
              id:id,
              title:title,
              labels:goodsInfo.labels,
              productprice:productprice,
              marketprice:marketprice,
              thumbList:thumbUrl,
              countPrice:countPrice,
              price:marketprice,
              goodsPicture:goodsPicture,
              cateTotal:cateTotal,
              spec:spec,
              subtitle:subtitle,
              hasCollect:hasCollect,
              choseSpecImg:choseSpecImg,
              specOptions:specOptions,
              choseSpecArr:choseSpecArr,
              choseSpecId:choseSpecId
            },function(){
              if(goodsInfo.hasoption){
                _this.choseSortSize()
              }
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
        }
        else {

        }
      },
      fail: (res) => {
        wx.hideLoading()
      }
    })
  },
  //轮播图滚动为
  swiperChange(e){
    swiperCurrent = e.detail.current
  },
  // 增加商品到服务器购物车
  addGoods: function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    let spec = _this.data.choseSpecId || 0 //商品规格id
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      return false;
    }
  
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShoppingCart&method=AddGoods',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        goodsId: _this.data.id,
        total: _this.data.buyNumber,
        spec:spec,
        guide:1 // 判斷是否引導客服
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        _this.closeModal1();
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
         let isLeft = res.data.isLeft //判断库存是否为0从而判断是否需要进行客服引导
         if(isLeft==0){
           _this.showStoskMask()
         }else{
          wx.showToast({
            title: '加入购物车成功',
            icon: 'success',
            duration: 2000
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
  //唤起底部客服弹窗
  listenerButton: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: false
    })
  },
  //拨打客服热线
  call: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
    wx.makePhoneCall({
      phoneNumber: ''+app.globalData.customerMobile+'' // 仅为示例，并非真实的电话号码
    })
  },
  //取消底部弹窗
  close: function () {
    let _this = this
    _this.setData({
      actionSheetHidden: true
    })
  },
  //分享
  onShareAppMessage: function(res) {
    let _this = this
    return {
      title: ''+_this.data.title+'',
      path: '/pages/shop-detail/index?Id='+_this.data.id+'',
      imageUrl:this.data.goodsPicture
    }
  },
  shareShop(){
    let _this = this
    _this.setData({
      actionSort: false
    })
  },
  //关闭分享弹窗
  closeShare(){
    let _this = this
    _this.setData({
      actionSort: true
    })
  },
  //分享图片
  shareShopImg(){
    let _this = this
    _this.setData({
      actionSort: true
    })
    let product = {}
    product.title = _this.data.title
    //product.productImg = _this.data.goodsPicture
    product.productImg = _this.data.thumbList[swiperCurrent] //选取当前看到的轮播图
    product.marketprice = _this.data.marketprice
    product.productprice = _this.data.productprice
    product.subtitle = _this.data.subtitle
    wx.setStorageSync('shareProduct',product)
    wx.navigateTo({
      url: '/pages/canvas-share/index?Id='+_this.data.id+'' //跳转到海报页
    });
  },
  shareShopLine(){
    let _this = this
    _this.setData({
      actionSort: true
    })
  },
  // 跳转回首页
  herfToIndex: function(){
    wx.reLaunch({
      url: "/pages/index/index"
    });
  },
  //加入购物车、立即购买选择规格参数
  choseSortSize(e){
    let _this  = this
    let thumbList = _this.data.thumbList
   
    let choseSpecArr = _this.data.choseSpecArr //选中的规格组合数组
    let specOptions = _this.data.specOptions
 
    let choseSpecId = " " //默认选中的规格id
    let spec = _this.data.spec
    let line = 0
    let idx =  choseSpecArr[0].toString()
    let opidx = 0
    if(e){ //人为触发
      line = e.currentTarget.dataset.line //获得其父分类所属下标
       idx = e.currentTarget.dataset.idx.toString() 
       opidx = e.currentTarget.dataset.opidx
    }
   
    //let thumb = e.currentTarget.dataset.thumb


   
    for(let i in choseSpecArr){
      choseSpecArr[i] = choseSpecArr[i].toString()
    }
    if(choseSpecArr[line] != idx){
      choseSpecArr[line] = idx
    }
    let choseSpecImg = ''
    let marketprice = ''
    let productprice = ''

    //在选中某个规格后 去除没有组合的的选项 当前选中的规格idx 并且拿到所有含有该规格的组合specAllArr 在选中非本行的id规格id进行比对
    let specAllArr = []
    for(let l in specOptions){
      let specsArr = specOptions[l].specsArr
      if(specsArr.includes(idx)){
        specAllArr = specAllArr.concat(specsArr)
      }
    }

    for(let i in spec){
      let items = spec[i].items
      for(let j in items){
        spec[i].items[j].isShow = 1
        if(spec.length>1){
          if((specAllArr.includes(items[j].id.toString())) && line != i ){
            spec[i].items[j].isShow = 1
          }else if(!(specAllArr.includes(items[j].id.toString())) && line != i){
            spec[i].items[j].isShow = 0
          }
        }else{
          specAllArr = []
          for(let i in specOptions){
            specAllArr.push(specOptions[i].specsArr[0])
          }
          if((specAllArr.includes(items[j].id.toString()))){
            spec[i].items[j].isShow = 1
          }else if(!(specAllArr.includes(items[j].id.toString()))){
            spec[i].items[j].isShow = 0
          }
        }


        
      }
    }
      //如果原来的选中的choseSpecArr不存在于现有的组合当中，默认选择所有可能组合的第一种组合 当前支持2维
      let otherSpec = 0
      for(let i in choseSpecArr){
        if(choseSpecArr[i] != idx){
          otherSpec = choseSpecArr[i]
        }
      }
     
      if(!(specAllArr.includes(otherSpec.toString()))){
         //
         let replaceSpec = 0
         for(let i in specAllArr){
           if(specAllArr[i] != idx){
             replaceSpec = specAllArr[i]
            break
           } 
         }
         for(let i in spec){
          if(i != line){
            let items= spec[i].items
            for(let j in items){
              spec[i].items[j].hasChose = 0
              if(items[j].id == replaceSpec){
                spec[i].items[j].hasChose = 1
                let newChoseSpecArr = []
                newChoseSpecArr.push(items[j].id.toString())
                newChoseSpecArr.push(idx.toString())
                choseSpecArr = newChoseSpecArr
              }
            }

          }
         }
      }
     
    //console.log(idx)
    console.log(choseSpecArr)
    //将拿到的规格ID 换取规格组合后的ID
    for(let op in specOptions){
      if(specOptions[op].specsArr.length == choseSpecArr.length){
        let isSame = 1
        specOptions[op].specsArr.forEach(ele => {
          let a = choseSpecArr.includes(ele.toString())
          isSame = a && isSame
        });
        if(isSame){
          choseSpecImg = specOptions[op].thumb
          marketprice =  specOptions[op].marketprice
          productprice =  specOptions[op].productprice
          choseSpecId = specOptions[op].id
          _this.setData({
            specTitle:specOptions[op].title,
          })
        }
      }
    }
    for(let i in spec){
      let item = spec[i].items
      for(let k in item){
        if(i == line){
          spec[i].items[k].hasChose = 0
        }
      }
    }
    spec[line].items[opidx].hasChose = 1
    

    //thumbList[0] = thumb
    console.log(choseSpecId)
    _this.setData({
      thumbList:thumbList,
      marketprice:marketprice,
      productprice:productprice,
      countPrice:marketprice,
      price:marketprice,
      goodsPicture:choseSpecImg, //将选中的规格图片设置为订单图片
      choseSpecImg:choseSpecImg,
      choseSpecArr:choseSpecArr,
      spec:spec,
      choseSpecId:choseSpecId,
      buyNumber:1
    })
  },
  //统计进入的流量
  recordShopView(type){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    let cookie = ''
    if(isLogin){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=RecordShopView',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        goodsid: _this.data.shopId,
        type:type
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
        if (res.statusCode == 200) {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
            }
        }
        else {
        }
      },
      fail: (res) => {
      }
    })
  },
  previewImg(e){
    let imgList = []
    let img = e.currentTarget.dataset.img
    imgList.push(img)
    wx.previewImage({
      urls: imgList,
    })
  },
  //打开全局菜单
  openMenu(){
    let _this = this
    let menuNum = this.data.menuNum
    let isOpenMenu = this.data.isOpenMenu
    let showMadal = _this.data.showModal || 0
    if(!isOpenMenu){
      for(let i in menuNum){
        i = parseInt(i) 
        let deg = 180
        menuNum[i].xL = (-80*Math.cos(deg/(menuNum.length-1)*(Math.PI/180)*i) || 0).toFixed(2)
        menuNum[i].yL = (-80*Math.sin(deg/(menuNum.length-1)*(Math.PI/180)*i) || 0).toFixed(2)
      }
      this.setData({
        opacity:1,
        menuMsg:'收起'
      })
    }else{
      for(let i in menuNum){
        i = parseInt(i)
        menuNum[i].xL = 0
        menuNum[i].yL = 0
      }
      this.setData({
        opacity:0,
        menuMsg:'导航'
      })
    }
    this.setData({
      menuNum:menuNum,
      isOpenMenu:!isOpenMenu,
      showModal:!showMadal
    })
  },
  hiddenMask(){
    let _this = this
    let menuNum = this.data.menuNum
    let isOpenMenu = this.data.isOpenMenu
    let showMadal = _this.data.showModal || 0
    if(isOpenMenu){
      for(let i in menuNum){
        i = parseInt(i)
        menuNum[i].xL = 0
        menuNum[i].yL = 0
      }
      _this.setData({
        opacity:0,
        menuMsg:'导航',
        menuNum:menuNum,
        isOpenMenu:!isOpenMenu,
        showModal:!showMadal
      })
    }
  },
  hrefToPage(e){
    let type = e.currentTarget.dataset.type
    switch(type){
      case 3:
      wx.reLaunch({
        url: '/pages/index/index',
      })
      break;
      case 2:
      wx.reLaunch({
        url: '/pages/mine/index',
      })
      break;
      case 1:
      wx.reLaunch({
        url: '/pages/shop-list/index',
      })
      break;
      case 0:
      wx.reLaunch({
        url: '/pages/shopping-gold/index',
      })
      break;
    }
     
    if(type == 1){

    }
  },
  //收藏商品、取消收藏
  collectGood(){
    let isLogin = wx.getStorageSync('isLogin')
    let _this = this
    let cookie = ''
    let collectType = 1
    let hasCollect = this.data.hasCollect
    if(this.data.hasCollect){
      collectType = 2
    }
    if(isLogin){
      cookie = 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Collect&method=DoCollect',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        goodsid: _this.data.shopId,
        collectType:collectType,
        goodsType:1
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': cookie
      },
      success: (res) => {
          let code = res.data.baseServerInfo.code
          let msg = res.data.baseServerInfo.msg
          if (code == 1) {
              if(!hasCollect){
                wx.showToast({
                  title:'收藏成功',
                  icon:'success'
                })
              }else{
                wx.showToast({
                  title:'取消成功',
                  image:'/images/nomore.png'
                })
              }
              _this.setData({
                hasCollect:!hasCollect
              })
            }else if(code == 1019){
              wx.navigateTo({
                url: '/pages/login/index',
              })
            }
      },
      fail: (res) => {
      }
    })
  },
  listenScroll(e){
    let _this = this
    let scrollTop = e.detail.scrollTop
    wx.getSystemInfo({
      success:(ret)=>{
        if (scrollTop > ret.windowHeight*3){
          _this.setData({
            showBackToTop:true
          })          
        }else{
          _this.setData({
            showBackToTop:false
          }) 
        }
      }
    })
  },
  backToTop(){
    let _this = this
    _this.setData({
      showBackToTop:false,
      scrollTop:0
    }) 
  }
})
