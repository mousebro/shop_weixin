// pages/canvas-share/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productImg:'',
    title:'',
    subScrib:'',
    priceNowStart:0,
    priceNowEnd:0,
    priceOldStart:0,
    priceOldEnd:0,
    codeImg:'',
    issaveImg:0,
    showMsg:'保存图片',
    isshowing:1
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
    let goodsId = options.Id

    let pageFrom = options.pageFrom
    _this.data.goodsId = goodsId
    let productInfo = wx.getStorageSync('shareProduct')
    if(productInfo.subtitle.length>20){
      productInfo.subtitle = productInfo.subtitle.substring(0,19) + '...'
    }
    if(productInfo.title.length>32){
      productInfo.title = productInfo.title.substring(0,31) + '...'
    }
    _this.setData({
      title:productInfo.title,
      priceNowStart:productInfo.marketprice,
      priceOldStart:productInfo.productprice,
      productImg:productInfo.productImg,
      subScrib:productInfo.subtitle,
      mpLength:productInfo.marketprice.length,
      pageFrom:pageFrom
    })
    _this.getGoodsShareInfo(pageFrom)
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // this.drawImage()
  },
  // 获取海报信息
  getGoodsShareInfo: function(pageFrom){
    let _this = this
    wx.showLoading({
      mask:true,
      title: '绘制海报中...'
    })
    let path = ''
    
    if(pageFrom=='bargain'){
      path='pages/bargain-details/index'
    }else{
      path = 'pages/shop-detail/index'
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=Goods&method=GetGoodsShareQR',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0,appId: ''+app.globalData.appId+''},
        goodsid:_this.data.goodsId,
        orderid:0,
        path:path
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        //'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          // let thumb = res.data.qrurl   // 获取商品首图
          // let url = thumb.substring(0,4)
          // if (url != 'http') {
          //   let thumbUrl = app.globalData.imageUrl+thumb
          //   _this.setData({
          //     productImg:thumbUrl
          //   })
          // }
          // else {
          //   let thumbUrl = thumb
          //   _this.setData({
          //     productImg:thumbUrl
          //   })
          // }
          //let recommend = res.data.recommend    // 获取推荐文案
          let miniPicture = res.data.qrurl     // 获取小程序
          //let title = res.data.title // 商品标题
          //let marketprice = res.data.marketprice // 获取商品价格
          //let productprice = res.data.productprice  // 获取商品划线价格
          _this.setData({
            //subScrib:recommend,
            codeImg:miniPicture,
            // title:title,
            // priceNowStart:marketprice,
            // priceOldStart:productprice,
          })
          wx.downloadFile({
            url: _this.data.productImg,//注意公众平台是否配置相应的域名
            success: function (res) {
              _this.setData({
                canvasProductImg:res.tempFilePath
              })
              wx.downloadFile({
                url: _this.data.codeImg,//注意公众平台是否配置相应的域名
                success: function (res) {
                  wx.hideLoading()
                  console.log('保存图片成功')
                  _this.setData({
                    canvasCodeImg:res.tempFilePath,
                    issaveImg:1
                  })
                }
              })
            }
          })
        }
        else{
          wx.hideLoading()
          _this.setData({
            issaveImg:0
          })
          wx.showModal({
            title:'提示',
            content:msg,
            showCancel:false,
            success:function(res){}
          })
        }
      },
      fail: (res) => {
        wx.hideLoading()
      }
    })
  },
  drawImage:function(){
    let _this = this
    if(_this.data.issaveImg==0){
      wx.showModal({
        title:'提示',
        content:'获取二维码失败',
        showCancel:false,
        success:function(res){
          return;
        }
      })
      return
    };
    if(_this.data.isshowing){
      _this.setData({
        showMsg:'正在绘制当中',
        isshowing:0
      })
    }else{
      return
    }
    let productImg = _this.data.canvasProductImg
    const ctx = wx.createCanvasContext('firstCanvas')
    const grd = ctx.createLinearGradient(0, 0, 375*2, 667*2) //底图渐变色
    grd.addColorStop(0, '#ec6649')
    grd.addColorStop(1, '#db4247')
    ctx.setFillStyle(grd)//将渐变色渲染入矩形
    ctx.fillRect(0, 0, 375*2, 667*2)
    ctx.setFillStyle('#fff') //白色底图
    ctx.fillRect(15*2,20*2,345*2,627*2)
    ctx.drawImage(productImg, 87*2, 30*2, 200*2, 200*2) //商品图
    //处理文字 title
    let title = _this.data.title
    let fontArr = title.split("")
    let temp = ''
    let row = []
    ctx.setFontSize(40)
    for(let i=0;i<fontArr.length;i++){
      if (ctx.measureText(temp).width < 600 && i!=(fontArr.length - 1)) {
        temp += fontArr[i];
      }
      else {
        if(i==(fontArr.length - 1)){
          temp += fontArr[i]
        }
        row.push(temp);
        temp = "";
      }
    }
    for(let i in row){
      ctx.setFillStyle('#222222')
      ctx.fillText(row[i], 40*2,(280 + i * 30)*2, 300*2);
    }
    //判断商品标题的行数，以下偏移内容只有一行的话在原有基础上减去一个字体高度
    let toffTop = 0
    if(row.length <=1 ){
      toffTop = 40*2
    }
    //文字 描述
    ctx.setFontSize(16*2)
    ctx.setFillStyle('#989898')
    ctx.fillText(`"${_this.data.subScrib}"`, 40*2,350*2 - toffTop, 300*2);
    //文字，价格 现价
    ctx.setFontSize(22*2)
    ctx.setFillStyle('#f03d43')
    ctx.fillText(`￥${_this.data.priceNowStart}`, 40*2,380*2 - toffTop, 300*2); //现价
    let priceStartStr = `￥${_this.data.priceNowStart}`
    let priceEndStr = `￥${_this.data.priceOldStart}`
    ctx.setFontSize(16*2)
    ctx.setFillStyle('#7d7d7d')

    //判断市场价价文字长度再做偏移处理（千、百、十）
    let mpLength = _this.data.mpLength
    ctx.fillText(`￥${_this.data.priceOldStart}`,ctx.measureText(priceStartStr).width+150,380 * 2 - toffTop, 300*2);//原价
    ctx.moveTo(ctx.measureText(priceStartStr).width + 150,376*2 - toffTop)
    ctx.lineTo((ctx.measureText(priceStartStr).width +150+ ctx.measureText(priceEndStr).width),376*2 - toffTop)
    ctx.stroke()
    ctx.setFillStyle('#e7e7e7') //两条分割线
    ctx.setLineWidth(.1)
    ctx.moveTo(40*2,405*2)
    ctx.lineTo(335*2,405*2)
    ctx.stroke()
    ctx.moveTo(40*2,410*2)
    ctx.lineTo(335*2,410*2)
    ctx.stroke()
    //二维码
    ctx.drawImage(_this.data.canvasCodeImg, 115*2, 430*2, 150*2, 150*2) //商品图
    ctx.setFontSize(16*2)
    ctx.setFillStyle('#7d7d7d')
    ctx.fillText('长按识别小程序购买',115*2,615*2,300*2);//原价
    ctx.draw(true,function(){
      _this.toLocalImage()
    })
  },
  //把画布导出成图片保存11
  toLocalImage() {
    let _this = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: 750,
      height: 1334,
      destWidth: 1500,
      destHeight: 2668,
      quality:1,
      canvasId: 'firstCanvas',
      success: function (res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success(res) {
            console.log('绘制成功');
            wx.showToast({
              title: '图片已保存',
              icon: 'success',
              duration: 2000
            })
            _this.setData({
              showMsg:'保存图片',
              isshowing:1
            })
          },
          fail(res){
            _this.setData({
              showMsg:'保存图片',
              isshowing:1
            })
          }
        })
      }
    })
  }
})
