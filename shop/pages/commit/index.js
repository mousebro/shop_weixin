// pages/commit/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    star:3,
    productInfo: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },
  /*点击商品的的星标识进行评星行为*/
  setStar(e){
    this.setData({
      star:e.target.dataset.idx
    })
  },
  /*点击添加图片进行图片添加行为*/
  addPic(){
    var that = this;
    wx.chooseImage({
      count: 5,  //最多可以选择的图片总数
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths;
        //启动上传等待中...
        wx.showToast({
          title: '正在上传...',
          icon: 'loading',
          mask: true,
          duration: 10000
        })
        console.log(tempFilePaths[0])
        return 
        var uploadImgCount = 0;
        for (var i = 0, h = tempFilePaths.length; i < h; i++) {
          wx.uploadFile({
            url: 'https://' + app.globalData.productUrl + '/api?resprotocol=json&reqprotocol=json&class=System&method=UploadRemotePicture', //开发者服务器地址
            filePath: tempFilePaths[i], 
            name: 'upload-pic',
            formData: {
              baseClientInfo: { longitude: 0, latitude: 0, appId: '' + app.globalData.appId + '', },
              name: 'upload-pic', //文件对应的 key，开发者在服务端可以通过这个 key 获取文件的二进制内容
              path:tempFilePaths[i],
              width:100,
              height:100,
              has1:1,
              md5:1,
            },
            header: {
              "Content-Type": "multipart/form-data"
            },
            success: function (res) {
              console.log(res)
              uploadImgCount++;
              var data = JSON.parse(res.data);
              //服务器返回格式: { "Catalog": "testFolder", "FileName": "1.jpg", "Url": "https://test.com/1.jpg" }
              var productInfo = that.data.productInfo;
              if (productInfo.bannerInfo == null) {
                productInfo.bannerInfo = [];
              }
              productInfo.bannerInfo.push({
                "catalog": data.Catalog,
                "fileName": data.FileName,
                "url": data.Url
              });
              that.setData({
                productInfo: productInfo
              });

              //如果是最后一张,则隐藏等待中
              if (uploadImgCount == tempFilePaths.length) {
                wx.hideToast();
              }
            },
            fail: function (res) {
              wx.hideToast();
              wx.showModal({
                title: '错误提示',
                content: '上传图片失败',
                showCancel: false,
                success: function (res) { }
              })
            }
          });
        }
      }
    });
  },
  //点击提交按钮进行内容提交
  bindFormSubmit(){
    
  }
  

})