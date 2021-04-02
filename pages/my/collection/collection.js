// pages/my/collection/collection.js
//获取接口配置
const config = require('../../../config/config')
const { formatDate,formatYearDate } = require('../../../utils/util')
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    navTab: ['资讯','会议','圈子'],        
    currentTab: 0,
    warn:'',
    newsLists: [],//资讯列表
    meetLists: [],//会议列表
    circleLists: [],//圈子列表
    token:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");
    var token = wx.getStorageSync('token');
    if (token) {//登录状态
      this.setData({token})
    }
    this.getCollectionPage();
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  clickTab: function(e){
    if (this.data.currentTab == e.currentTarget.dataset.idx){
      return;
    }
    this.setData({
      currentTab: e.currentTarget.dataset.idx,
    })
    this.getCollectionPage()
  },

  getCollectionPage: function(){
    let _this = this;
    let type= _this.data.currentTab+1;// 资讯1/ 会议2/ 圈子3
    wx.request({
      method: "GET",
      url: config.collectionPage_url,
      data:{type},
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res) {
        // console.log(res.data.data);
        if (res.data.code == "100") {//调用接口返回数据成功
          let warn = '';
          let resData = res.data.data;
          if(!resData || resData.length<=0){
            warn = '暂无数据';
            _this.setData({warn})
            return;
          }

          if(type == 1){//资讯
            resData.map(item=>{
              item.formatModifyTime = formatYearDate(item.modifyTime);
            })
            _this.setData({
              newsLists: resData
            })
          }else if(type == 2){//会议
            resData.map(item=>{
              item.formatStartTime = formatDate(item.startTime);
              item.formatEndTime = formatDate(item.endTime);
            })
            _this.setData({
              meetLists: resData
            })
          }else if(type == 3){//圈子
            resData.map(item=>{
              item.formatCreateTime = formatYearDate(item.createTime);
              item.pic = JSON.parse(item.pic);
              if(item.commentList.length>2){
                item.commentList_part = item.commentList.slice(0,2);
                item.showMoreCom = true;
              }
            })
            _this.setData({
              circleLists: resData
            })
          }

        }else{
           _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  loadMoreComment(e){
    let _this = this;
    let id = e.currentTarget.dataset.id;
    let circleLists = _this.data.circleLists;
    circleLists.map(item => {
      if(item.id == id){
        item.showMoreCom = !item.showMoreCom;
      }
    })
    _this.setData({circleLists})
  },
  goToNewDetail: function(e){
    wx.navigateTo({
      url: `/pages/news/newDetail/newDetail?newId=${e.currentTarget.dataset.id}`
    })
  },
  goToMeetDetail: function(e){
    wx.navigateTo({
      url: `/pages/meeting/meetingDetail/meetingDetail?meetId=${e.currentTarget.dataset.id}`
    })
  },
})