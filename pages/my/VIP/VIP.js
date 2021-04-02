// pages/my/VIP/VIP.js
//获取接口配置
const config = require('../../../config/config')
//获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    statusBarHeight: 0,
    token:'',
    isvip: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */


  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");
    var _this = this;
    let isvip = (options.isvip && options.isvip != 'null') ? options.isvip : null;
    var token = wx.getStorageSync('token');
    _this.setData({token,isvip})
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        console.log(res.statusBarHeight)
        _this.setData({
          statusBarHeight: res.statusBarHeight
        })
      },
    })
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
  goBack(){
    wx.navigateBack({
      delta: 1,
    })
  },

  toPay: function(e){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.submitOrder_url,
      header: {
        'content-type': 'application/x-www-form-urlencoded',
        'token': _this.data.token,
      },
      success(res) {
        if (res.data.code == "100") {//调用接口返回数据成功
          let resData = res.data.data;
          if(resData.paySign == 'FREE'){//课程免费
            _this.dialog.showToast('报名成功');//自定义弹窗组件
          }else{//微信支付
            _this.wxPay(resData);
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
  wxPay: function(param) {
    let _this = this;
    wx.requestPayment({
      appId: param.appId,
      timeStamp: param.timeStamp,
      nonceStr: param.nonceStr,
      package: param.packageValue,
      signType: 'MD5',
      paySign: param.paySign,
      success: function (event) {
        // console.log(event);
        _this.dialog.showToast('支付成功');//自定义弹窗组件
        _this.goBack();
      },
      fail: function (error) {
        console.log(error)
        if(error.errMsg.indexOf('cancel') != -1){
          _this.dialog.showToast('取消支付');//自定义弹窗组件
        }else{
          _this.dialog.showToast('支付失败');//自定义弹窗组件
        }
      },
      complete: function () {
        console.log("pay complete")
      }
    });
  },
})