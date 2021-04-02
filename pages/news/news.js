// pages/news/news.js
//获取接口配置
const config = require('../../config/config')
const { formatYearDate,formatDayTransform } = require('../../utils/util')
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newsLists:[],
    queryData:{
      "pageNum": 1,//第几页
      "pageSize": 10,//一页加载几条
    },
    loading_more: false,
    warn:'',//正在加载/已全部加载完成/暂无数据...等
    token:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");
    var token = wx.getStorageSync('token');
    this.setData({token});
    this.getNewsPage();
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

  getNewsPage: function(){
    let _this = this;
    _this.setData({loading_more:true})
    wx.request({
      method: "GET",
      url: config.newsPage_url,
      data: _this.data.queryData,
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res) {
        // console.log(res.data.data)
        if (res.data.code == "100") {//调用接口返回数据成功
          let warn = '';
          let newsLists = res.data.data.list;
          if(_this.data.queryData.pageNum==1 && (!res.data.data || !newsLists || newsLists.length<=0)){
            warn = '暂无数据';
            _this.setData({warn})
            return;
          }
          
          newsLists.map(item=>{
            item.formatModifyTime = formatDayTransform(item.modifyTime);
          })
          if (_this.data.queryData.pageNum>1) {//如果不是第一页
            newsLists = _this.data.newsLists.concat(newsLists);
          }else{
            newsLists = newsLists
          }

          if(_this.data.queryData.pageNum == res.data.data.pages){//无下一页
            warn = '已全部加载完成'
          }

          _this.setData({newsLists,warn});
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

  goToNewDetail: function(e){
    wx.navigateTo({
      url: `/pages/news/newDetail/newDetail?newId=${e.currentTarget.dataset.id}`
    })
  },
})