// pages/my/my.js
//获取接口配置
const config = require('../../config/config')
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    listsData: [
      {iconPath:'../../image/my/list_icon1.png', name:'我的会议', linkPath:'/pages/my/meeting/meeting'},
      {iconPath:'../../image/my/list_icon2.png', name:'我的收藏', linkPath:'/pages/my/collection/collection'},
      {iconPath:'../../image/my/list_icon3.png', name:'我的评论', linkPath:'/pages/my/comment/comment'},
    ],

    token:'',
    myInfo: null,//存放我的信息：nickname昵称 headImg头像 vip是否为会员
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");
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
    this.setData({token})
    this.queryUserInfo()
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

  linkPage(e){
    if(!this.data.token || !this.data.myInfo){
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }

    wx.navigateTo({
      url: e.currentTarget.dataset.url,
    })
  },

  goToLogin: function(){
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  //获取用户信息
  queryUserInfo: function(){
    // if(!this.data.token){
    //   wx.navigateTo({
    //     url: '/pages/login/login',
    //   })
    //   return
    // }

    let _this = this;
    wx.request({
      method: "GET",
      url: config.queryUserInfo_url,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      success(res){
        if (res.data.code=="100"){//调用接口返回数据成功
          let myInfo = res.data.data || null;
          _this.setData({myInfo})
          app.globalData.userInfo = myInfo;
        }else{
          if(res.data.message && res.data.message.indexOf('登录')!=-1){//未登录
            wx.removeStorageSync('token');
          }

          // if(res.data.message && res.data.message.indexOf('登录')!=-1){//未登录
          //   wx.removeStorageSync('token');
          //   wx.navigateTo({
          //     url: '/pages/login/login',
          //   })
          // }else{
          //   _this.dialog.showToast(res.data.message);//自定义弹窗组件
          // }
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  }
})