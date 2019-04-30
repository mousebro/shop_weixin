// pages/commit/index.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    star:5,
    pictureList:[],
    pictureTokenList:[],
    content:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let _this = this
  },
  // 文本框输入绑定
  contentInput: function(e){
    let _this = this
    _this.data.content = e.detail.value
  },
  //输入电话绑定
  phoneInput(e){
    let _this = this
    _this.data.phoneNum = e.detail.value
  },
  /*点击商品的的星标识进行评星行为*/
  setStar: function(e){
    this.setData({
      star:e.target.dataset.idx
    })
  },
  /*点击添加图片进行图片添加行为*/
  addPic: function(){
    let _this = this;
    let pictureList = _this.data.pictureList
    if (pictureList.length > 4) {
      wx.showModal({
        title: '提示',
        content: '图片上传最大数量为5',
        showCancel:false,
        success: function(res) {
        }
      })
    }
    else {
      wx.chooseImage({
        count:1,
        success: function(res) {
          let tempFilePaths = res.tempFilePaths
          let pictureCount = _this.data.pictureList.length
          // _this.data.pictureList.push({id:pictureCount,url:tempFilePaths[0]})
          // _this.data.pictureCount = pictureCount + 1
          // _this.setData({
          //   pictureList:_this.data.pictureList,
          //   pictureCount:pictureCount +1
          // })
          wx.uploadFile({
            url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&class=system&method=UploadPicture', //仅为示例，非真实的接口地址
            filePath: tempFilePaths[0],
            name: 'file',
            formData:{
              'user': 'test'
            },
            success: function(res){
              let info = JSON.parse(res.data)
              _this.data.pictureList.push({id:pictureCount,url:app.globalData.imageUrl+info.imgUrl})
              _this.data.pictureCount = pictureCount + 1
              _this.setData({
                pictureList:_this.data.pictureList,
                pictureCount:pictureCount +1
              })
              _this.data.pictureTokenList.push(info.imgUrl)
            }
          })
        }
      })
    }
  },
  // 删除上传图片
  delPicture: function(e){
    let _this = this
    _this.data.pictureList.splice(e.currentTarget.dataset.idx,1)
    _this.data.pictureTokenList.splice(e.currentTarget.dataset.idx,1)
    let pictureList = _this.data.pictureList
    for (var i = 0; i < pictureList.length; i++) {
      pictureList[i].id = i
    }
    _this.setData({
      pictureList:pictureList,
      pictureCount:pictureList.length
    })
  },
  //点击提交按钮进行内容提交
  bindFormSubmit: function(){
    let _this = this
    if(!_this.data.content){
      wx.showToast({
        title:'内容不能为空哦~'
      })
    } 
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=MiniAppUser&method=AddSuggset',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        content:_this.data.content,
        mobile:_this.data.phoneNum,
        images:_this.data.pictureTokenList
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          wx.showModal({
            title:'提示',
            content:'感谢您的反馈~',
            showCancel:false,
            success:function(res){
              wx.redirectTo({
                url: '/pages/mine/index'
              })
            }
          })
        }
        else if (code == 1019){
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
  }


})
