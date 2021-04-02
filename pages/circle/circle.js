// pages/circle/circle.js
//获取接口配置
const config = require('../../config/config')
const { formatYearDate } = require('../../utils/util')
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showCommentArea: false,//编辑评论、调起键盘
    commentAreaBottom: 0,//键盘高度
    tabbarHeight:0,//

    newsLists:[],
    queryData:{
      "pageNum": 1,//第几页
      "pageSize": 10,//一页加载几条
    },
    loading_more: false,
    warn:'',//正在加载/已全部加载完成/暂无数据...等
    token:'',
    commentId:'',//要评价的圈子id
    commentContent:'',//评论输入内容

    isBackRefresh:false,//返回该页面是否刷新
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");
    var token = wx.getStorageSync('token');
    this.setData({token});
    this.getNewsPage();
    
    let _this = this;
    wx.getSystemInfo({
      success: function(res) {
        console.log(res);
          // const tabbarHeight = ( res.screenHeight - res.windowHeight - res.statusBarHeight - 44 ) * res.pixelRatio;
          const tabbarHeight = res.screenHeight - res.windowHeight - res.statusBarHeight - 44;
          _this.setData({
            tabbarHeight
          })
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var token = wx.getStorageSync('token');
    this.setData({token});
    if(this.data.isBackRefresh || app.globalData.isBackRefresh){
      this.refreshFunc();
      this.setData({isBackRefresh:false});
      app.globalData.isBackRefresh = false;
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let _this = this;
    if (_this.data.loading_more) {
      return;
    }
    // let queryData = _this.data.queryData;
    // let pageNum =  1;
    // queryData.pageNum = pageNum;
    // let newsLists = [];
    // let warn = '正在刷新';
    // _this.setData({queryData,newsLists,warn})
    // _this.getNewsPage();
    _this.refreshFunc()
  },
  refreshFunc(){
    let _this = this;
    let queryData = _this.data.queryData;
    let pageNum =  1;
    queryData.pageNum = pageNum;
    let newsLists = [];
    let warn = '正在刷新';
    _this.setData({queryData,newsLists,warn})
    _this.getNewsPage();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    let _this = this;
    if (_this.data.loading_more || _this.data.warn == '已全部加载完成') {
      return;
    }
    let queryData = _this.data.queryData;
    let pageNum =  queryData.pageNum +1;
    queryData.pageNum = pageNum;
    let warn = '正在加载';
    _this.setData({queryData,warn})
    _this.getNewsPage();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  toggleCommentArea(e){
    if(!this.data.token){
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }
    
    let showCommentArea = this.data.showCommentArea;
    this.setData({
      showCommentArea: !showCommentArea,
      commentId: e.currentTarget.dataset.id,
    })
  },
  commentAreaFocus(e) {//聚焦
    let commentAreaBottom = e.detail.height - this.data.tabbarHeight;
    this.setData({
      commentAreaBottom
    })
  },
  commentAreaBlur(e){//失去焦点
    this.setData({
      commentAreaBottom: 0,
      showCommentArea: false
    })
  },
  commentAreaInput(e){//值发生变化
    this.setData({
      commentContent: e.detail.value
    });
  },
  //发布圈子
  toComment(){
    if(!this.data.token){
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }

    wx.navigateTo({
      url: `/pages/comment/comment?type=circle`,
    })
  },
  //获取圈子列表
  getNewsPage(){
    let _this = this;
    _this.setData({loading_more:true})
    wx.request({
      method: "GET",
      url: config.dynamicPage_url,
      data: _this.data.queryData,
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res) {
        // console.log(res.data.data);
        if (res.data.code == "100") {//调用接口返回数据成功
          let warn = '';
          let newsLists = res.data.data.list;
          if(_this.data.queryData.pageNum==1 && (!res.data.data || !newsLists || newsLists.length<=0)){
            warn = '暂无数据';
            _this.setData({warn})
            return;
          }
          
          newsLists.map(item=>{
            item.formatCreateTime = formatYearDate(item.createTime);
            item.pic = JSON.parse(item.pic);
            if(item.commentList.length>2){
              item.commentList_part = item.commentList.slice(0,2);
              item.showMoreCom = true;
            }
          })
          if (_this.data.queryData.pageNum>1) {//如果不是第一页
            newsLists = _this.data.newsLists.concat(newsLists);
          }else{
            newsLists = newsLists
          }

          if(_this.data.queryData.pageNum == res.data.data.pages){//无下一页
            warn = '已全部加载完成'
          }
          _this.setData({
            newsLists,warn
          });
        }else{
           _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      },
      complete: function () {
        wx.stopPullDownRefresh();
        _this.setData({loading_more:false})
      }
    })
  },
  loadMoreComment(e){
    let _this = this;
    let id = e.currentTarget.dataset.id;
    let newsLists = _this.data.newsLists;
    newsLists.map(item => {
      if(item.id == id){
        item.showMoreCom = !item.showMoreCom;
      }
    })
    _this.setData({newsLists})
  },
  //发表圈子评论
  publishComment(){
    let _this = this,
        commentId = _this.data.commentId,
        commentContent = _this.data.commentContent;
    wx.request({
      method: "GET",
      url: config.addDynamicComment_url,
      data: {
        content: commentContent,
        id: commentId
      },
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res){
        console.log(res);
        if (res.data.code=="100"){//调用接口返回数据成功
          // _this.getNewsPage();
          let newsLists = _this.data.newsLists
          newsLists.map(item=>{
            if(item.id == commentId){
              let newComment = {
                content: commentContent,
                name: app.globalData.userInfo.nickname,
              }
              item.commentList.push(newComment)

              if(item.commentList.length>2){
                item.commentList_part = item.commentList.slice(0,2);
                // item.showMoreCom = true;
              }
            }
          })
          
          _this.setData({newsLists})
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  //收藏/取消收藏
  doCollection(e){
    if(!this.data.token){
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }

    let _this = this;
    wx.request({
      method: "GET",
      url: config.addOrDelCollection_url,
      data: {
        type: 3,
        id: e.currentTarget.dataset.id
      },
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res){
        // console.log(res);
        if (res.data.code=="100"){//调用接口返回数据成功
          // _this.getNewsPage();
          let newsLists = _this.data.newsLists;
          newsLists.map((item) => {
            if(item.id == e.currentTarget.dataset.id){
              return item.collection = !item.collection
            }
          })
          _this.setData({newsLists})
        }else{
          if(res.data.message && res.data.message.indexOf('登录')!=-1){// 未登录
            wx.removeStorageSync('token');
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }else{
            _this.dialog.showToast(res.data.message);//自定义弹窗组件
          }
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  //预览图片
  listenerButtonPreviewImage(e){
    let index = e.target.dataset.index,
        urls = e.target.dataset.urls;
    wx.previewImage({
      current: urls[index],
      urls: urls,
      success: function (res) {
        //console.log(res);
      },
      fail: function () {
        //console.log('fail')
      }
    })
  },

})