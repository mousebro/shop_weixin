//index.js
var app = getApp()
Page({
  data: {
    goodsList:{
      saveHidden:true,
      totalPrice:0,
      allSelect:true,
      noSelect:false,
      list:[]
    },
    delBtnWidth:120,    // 删除按钮宽度单位（rpx）
  },

  // 获取元素自适应后的实际宽度
  getEleWidth:function(w){
    var real = 0;
    try {
      var res = wx.getSystemInfoSync().windowWidth;
      var scale = (750/2)/(w/2);  //以宽度750px设计稿做宽度的自适应
      // console.log(scale);
      real = Math.floor(res/scale);
      return real;
    } catch (e) {
      return false;
     // Do something when catch error
    }
  },
  initEleWidth:function(){
    var delBtnWidth = this.getEleWidth(this.data.delBtnWidth);
    this.setData({
      delBtnWidth:delBtnWidth
    });
  },
  onLoad: function () {
      this.initEleWidth();
  },
  onShow: function(){
      // var shopList = [];
      // // 获取购物车数据
      // var shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      // if (shopCarInfoMem && shopCarInfoMem.shopList) {
      //   shopList = shopCarInfoMem.shopList
      // }
      this.getShopCartList();
      // console.log(shopList);
      // this.data.goodsList.list = shopList;
      // this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),shopList);
  },
  // 获取服务器购物车列表
  getShopCartList: function(){
    let _this = this
    let isLogin = wx.getStorageSync('isLogin')
    if (!isLogin) {
      wx.navigateTo({
        url: '/pages/login/index'
      })
      wx.setStorageSync('isLogin', false)
    }
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShoppingCart&method=GetShoppingCartList',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: {longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        page:1,
        pageLength:100
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('token')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          console.log(res);
          let shopList = []
          let toolShopList = res.data.cartList
          for (var i = 0; i < toolShopList.length; i++) {
            let shopId = toolShopList[i].id // 购物车ID
            let goodsId = toolShopList[i].goodsid // 商品ID
            let total = toolShopList[i].total // 商品数量
            let goodsTitle = toolShopList[i].goodsTitle // 商品名称
            let thumb = toolShopList[i].thumb // 商品缩略图
            let price = toolShopList[i].marketprice // 商品单价
            shopList.push({id:shopId,goodsId:goodsId,name:goodsTitle,number:total,pic:thumb,price:price})
          }
          console.log(shopList);
          this.data.goodsList.list = shopList;
          this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),shopList);
        }
        else if (code == 1019){
          wx.navigateTo({
            url: '/pages/login/index'
          })
        }
        else {
          console.log(msg);
        }
      },
      fail: (res) => {
        console.log(res);
      }
    })
  },
  // 跳转回首页
  hrefToIndex:function(){
      wx.switchTab({
          url: "/pages/index/index"
      });
  },
  // 单块滑动事件
  touchS:function(e){
    if(e.touches.length==1){
      this.setData({
        startX:e.touches[0].clientX
      });
    }
  },
  touchM:function(e){
    var index = e.currentTarget.dataset.index;

    if(e.touches.length==1){
      var moveX = e.touches[0].clientX;
      var disX = this.data.startX - moveX;
      var delBtnWidth = this.data.delBtnWidth;
      var left = "";
      if(disX == 0 || disX < 0){//如果移动距离小于等于0，container位置不变
        left = "margin-left:0px";
      }else if(disX > 0 ){//移动距离大于0，container left值等于手指移动距离
        left = "margin-left:-"+disX+"px";
        if(disX>=delBtnWidth){
          left = "left:-"+delBtnWidth+"px";
        }
      }
      var list = this.data.goodsList.list;
      if(index!="" && index !=null){
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
      }
    }
  },
  touchE:function(e){
    var index = e.currentTarget.dataset.index;
    if(e.changedTouches.length==1){
      var endX = e.changedTouches[0].clientX;
      var disX = this.data.startX - endX;
      var delBtnWidth = this.data.delBtnWidth;
      //如果距离小于删除按钮的1/2，不显示删除按钮
      var left = disX > delBtnWidth/2 ? "margin-left:-"+delBtnWidth+"px":"margin-left:0px";
      var list = this.data.goodsList.list;
     if(index!=="" && index != null){
        list[parseInt(index)].left = left;
        this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);

      }
    }
  },
  // 删除本地商品
  delItem:function(e){
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    var delGoodsIdList = []
    list.splice(index,1);
    var delGoodsId = e.currentTarget.dataset.id
    delGoodsIdList.push(delGoodsId)
    console.log(delGoodsIdList);
    this.setData({
      delGoodsIdList:delGoodsIdList
    })
    this.delGoods()
    this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
  },
  // 服务器删除购物车商品
  delGoods: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShoppingCart&method=DelGoods',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        cartId: _this.data.delGoodsIdList
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('sessionId')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          console.log('删除商品成功');
          // wx.showToast({
          //   title: '删除商品成功',
          //   icon: 'success',
          //   duration: 2000
          // })
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
  // 单选
  selectTap:function(e){
    var index = e.currentTarget.dataset.index;
    var list = this.data.goodsList.list;
    if(index!=="" && index != null){
        list[parseInt(index)].active = !list[parseInt(index)].active ;
        this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
      }
   },
  // 计算总价
  totalPrice:function(){
      var list = this.data.goodsList.list;
      var total = 0;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(curItem.active){
            total+= parseFloat(curItem.price)*curItem.number;
          }
      }
      total = parseFloat(total.toFixed(2));//js浮点计算bug，取两位小数精度
      return total;
   },
  // 全选状态
  allSelect:function(){
      var list = this.data.goodsList.list;
      var allSelect = false;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(curItem.active){
            allSelect = true;
          }else{
             allSelect = false;
             break;
          }
      }
      return allSelect;
   },
  // 全不选状态
  noSelect:function(){
      var list = this.data.goodsList.list;
      var noSelect = 0;
      for(var i = 0 ; i < list.length ; i++){
          var curItem = list[i];
          if(!curItem.active){
            noSelect++;
          }
      }
      if(noSelect == list.length){
         return true;
      }else{
        return false;
      }
   },
  // 往本地购物车添加物品
  setGoodsList:function(saveHidden,total,allSelect,noSelect,list){
      this.setData({
        goodsList:{
          saveHidden:saveHidden,
          totalPrice:total,
          allSelect:allSelect,
          noSelect:noSelect,
          list:list
        }
      });
      var shopCarInfo = {};
      var tempNumber = 0;
      shopCarInfo.shopList = list;
      for(var i = 0;i<list.length;i++){
        tempNumber = tempNumber + list[i].number
      }
      shopCarInfo.shopNum = tempNumber;
      wx.setStorage({
        key:"shopCarInfo",
        data:shopCarInfo
      })
   },
  // 全选按钮点击
  bindAllSelect:function(){
      var currentAllSelect = this.data.goodsList.allSelect;
      var list = this.data.goodsList.list;
      if(currentAllSelect){
        for(var i = 0 ; i < list.length ; i++){
            var curItem = list[i];
            curItem.active = false;
        }
      }else{
        for(var i = 0 ; i < list.length ; i++){
            var curItem = list[i];
            curItem.active = true;
        }
      }

      this.setGoodsList(this.getSaveHide(),this.totalPrice(),!currentAllSelect,this.noSelect(),list);
   },
  // 购物车内数量加
  jiaBtnTap:function(e){
    let index = e.currentTarget.dataset.index;
    let list = this.data.goodsList.list;
    let plusGoodsId = e.currentTarget.dataset.id
    this.setData({
      plusGoodsId:plusGoodsId
    })
    if(index!=="" && index != null){
      if(list[parseInt(index)].number<9999){
        list[parseInt(index)].number++;
        this.setData({
          plusGoodsNum:list[parseInt(index)].number
        })
        this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
        this.plusGoods()
      }
    }
   },
  // 调用接口加购物车数量
  plusGoods: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShoppingCart&method=GoodsIncOne',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id: _this.data.plusGoodsId,
        total: _this.data.plusGoodsNum-1
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('sessionId')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          console.log('增加商品数量');
          // wx.showToast({
          //   title: '删除商品成功',
          //   icon: 'success',
          //   duration: 2000
          // })
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
  // 购物车内数量减
  jianBtnTap:function(e){
    let index = e.currentTarget.dataset.index;
    let list = this.data.goodsList.list;
    let lessGoodsId = e.currentTarget.dataset.id
    this.setData({
      lessGoodsId:lessGoodsId
    })
    if(index!=="" && index != null){
      if(list[parseInt(index)].number>1){
        list[parseInt(index)].number--;
        this.setData({
          lessGoodsNum:list[parseInt(index)].number
        })
        this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
        this.lessGoods()
      }
    }
   },
  // 调用减接口购物车数量
  lessGoods: function(){
    let _this = this
    wx.request({
      url: 'https://'+app.globalData.productUrl+'/api?resprotocol=json&reqprotocol=json&class=ShoppingCart&method=GoodsDecOne',
      method: 'post',
      data: JSON.stringify({
        baseClientInfo: { longitude: 0, latitude: 0 ,appId: ''+app.globalData.appId+''},
        id: _this.data.lessGoodsId,
        total: _this.data.lessGoodsNum+1
      }),
      header: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'cookie': 'PBCSID=' + wx.getStorageSync('sessionId') + ';PBCSTOKEN=' + wx.getStorageSync('sessionId')
      },
      success: (res) => {
        let code = res.data.baseServerInfo.code
        let msg = res.data.baseServerInfo.msg
        if (code == 1) {
          console.log('减少商品数量');
          // wx.showToast({
          //   title: '删除商品成功',
          //   icon: 'success',
          //   duration: 2000
          // })
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
  // // 编辑按钮
  // editTap:function(){
  //    var list = this.data.goodsList.list;
  //    for(var i = 0 ; i < list.length ; i++){
  //           var curItem = list[i];
  //           curItem.active = false;
  //    }
  //    this.setGoodsList(!this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
  //  },
  // // 确认完成，退出编辑状态
  // saveTap:function(){
  //    var list = this.data.goodsList.list;
  //    for(var i = 0 ; i < list.length ; i++){
  //           var curItem = list[i];
  //           curItem.active = true;
  //    }
  //    this.setGoodsList(!this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
  //  },
  // 展示编辑状态还是结算状态（暂时取消该功能）
  getSaveHide:function(){
     var saveHidden = this.data.goodsList.saveHidden;
     return saveHidden;
   },
  // 删除选择项
  deleteSelected:function(){
      var list = this.data.goodsList.list;
     /*
      for(let i = 0 ; i < list.length ; i++){
            let curItem = list[i];
            if(curItem.active){
              list.splice(i,1);
            }
      }
      */
     // above codes that remove elements in a for statement may change the length of list dynamically
     list = list.filter(function(curGoods) {
        return !curGoods.active;
     });
     this.setGoodsList(this.getSaveHide(),this.totalPrice(),this.allSelect(),this.noSelect(),list);
  },
  // 生成订单
  toPayOrder:function(){
      // wx.showLoading();
      // var that = this;
      let _this = this
      if (this.data.goodsList.noSelect) {
        wx.hideLoading();
        return;
      }
      // 重新计算价格，判断库存
      let shopList = [];
      let shopCarInfoMem = wx.getStorageSync('shopCarInfo');
      if (shopCarInfoMem && shopCarInfoMem.shopList) {
        // shopList = shopCarInfoMem.shopList
        shopList = shopCarInfoMem.shopList.filter(entity => {
          return entity.active;
        });
      }
      if (shopList.length == 0) {
        wx.hideLoading();
        return;
      }
      let isFail = false;
      let doneNumber = 0;
      let needDoneNUmber = shopList.length;
      console.log(shopList);
      wx.setStorage({
        key:"orderShopList",
        data:shopList
      })
      _this.hrefToPay()
  },
  // 跳转到订单结算页
  hrefToPay:function() {
    // wx.hideLoading();
    wx.navigateTo({
      url:"/pages/pay/index"
    })
  }
})
