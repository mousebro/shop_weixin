//index.js
//获取应用实例
const app = getApp()
import formatTime from '../../utils/util.js'

Page({
  data: {

  },
  onLoad: function (options) {
    app.userView('RecordExposurenum') //统计平台曝光度记录
    let shopId = options.id
    let type = options.type
    this.setData({
      shopId:shopId,
      type:type,
      imgurl:app.globalData.imageUrl
    })
    this.getCommentList()
  },
  onShow:function(){
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
        pageLength: 10,
        goodsid: _this.data.shopId,
        type:_this.data.type
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
          for (var i = 0; i < commentList.length; i++) {
            let time = new Date(commentList[i].createtime*1000)
            let showTime = formatTime.formatTime(time)
            console.log(showTime);
            commentList[i].showTime = showTime
          }
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
  //评论图片预览
  watchImg(e){
    let  commentList = this.data.commentList
    let idx=e.currentTarget.dataset.idx
    let imgurl = this.data.imgurl
    let imgUrlArr = []
    for(let i in commentList){
      for(let item of commentList[i].imgurl){
        let str = imgurl + item
        imgUrlArr.push(str)
      }
    }   
    wx.previewImage({
      current: imgUrlArr[idx], // 当前显示图片的http链接
      urls: imgUrlArr // 需要预览的图片http链接列表
    })
  }
})
