// pages/comment/comment.js
//获取接口配置
const config = require('../../config/config')
const uploadImage = require('../../utils/UploadAliyun2.js')
// 获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: "",//输入内容
    texts: "至少要输入5个字哦~",//提示文案
    min: 5,//最少字数
    max: 300, //最多字数
    isShowImgBox: true,//是否支持上传图片
    tempFilePaths: [],
    imgCount: 9,//可上传图片张数

    token:'',
    type:'',// new新闻/ circle圈子
    id:'',// 需要评论的新闻id
    ossFilePaths: [],//上传到阿里云oss返回的图片地址；
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");

    let type = options.type || '';
    let id = options.id || '';
    this.setData({type,id});
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

    /**
   * 字数限制
   */ 
  inputs: function (e) {
    // 获取输入框的内容
    var value = e.detail.value;
    // 获取输入框内容的长度
    var len = parseInt(value.length);
    //最少字数限制
    if (len <this.data.min){
      this.setData({
        texts: "至少要输入5个字哦~"
      })
    }else if (len >= this.data.min){
      this.setData({
        texts: ""
      })
    }
    //最多字数限制
    if (len > this.data.max) return;
    // 当输入框内容的长度大于最大长度限制（max)时，终止setData()的执行
    this.setData({
      currentWordNumber: len, //当前字数
      content: value
    });
  },
  /**
   * 上传图片方法
   */
  upload(){
    let that = this;
    wx.chooseImage({
      count: that.data.imgCount - that.data.tempFilePaths.length, // 一次可选择多少张
      sizeType: [ 'compressed'], // 可以指定是原图original还是压缩图compressed，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: res => {
        let tempFilePaths = that.data.tempFilePaths.concat(res.tempFilePaths);

        that.setData({
          tempFilePaths: tempFilePaths
        })
      }
    })
  },
  /**
   * 图片上传到服务器
   */
  // updateToServe(index){
  //   let _this = this,
  //       i = index || 0,
  //       tempFilePaths = _this.data.tempFilePaths;

  //   wx.request({
  //     method: "GET",
  //     url: config.imgUpload_url,
  //     success(res) {
  //       // console.log(res.data.data);
  //       if (res.data.code == "100") {//调用接口返回数据成功
  //         let resData = res.data.data;
  //         let accessKeyId = resData.accessKeyId,
  //             accessKeySecret = resData.accessKeySecret,
  //             securityToken = resData.securityToken,
  //             expiration = resData.expiration;
  //         uploadImage(
  //           {
  //             filePath: tempFilePaths[i],
  //             dir: "images/",
  //             accessKeyId,
  //             accessKeySecret,
  //             securityToken,
  //             expiration,
  //             success: function (res) {
  //               i++
  //               console.log(res);
  //               let ossFilePaths = _this.data.ossFilePaths;
  //               ossFilePaths.push(res);
  //               _this.setData({ossFilePaths})

  //               if(i == tempFilePaths.length){
  //                 let requestMethod = 'POST',
  //                     requestUrl = config.addDynamic_url,
  //                     requestData = {
  //                       content: _this.data.content,
  //                       pic: _this.data.ossFilePaths
  //                     }
  //                 _this.commentFunc(requestMethod,requestUrl,requestData)
  //               }else{
  //                 _this.updateToServe(i);
  //               }
  //             },
  //             fail: function (res) {
  //               _this.dialog.showToast(res);//自定义弹窗组件
  //             }
  //           })
  //       }else{
  //          _this.dialog.showToast(res.data.message);//自定义弹窗组件
  //       }
  //     },
  //     fail(res) {//连接服务失败
  //       _this.dialog.showToast(res.errMsg);//自定义弹窗组件
  //     }
  //   })
  // },
  updateToServe(){
    let _this = this,
        tempFilePaths = _this.data.tempFilePaths;

    wx.request({
      method: "GET",
      url: config.imgUpload_url,
      success(res) {
        // console.log(res.data.data);
        if (res.data.code == "100") {//调用接口返回数据成功
          let resData = res.data.data;
          // let accessKeyId = resData.accessKeyId,
          //     accessKeySecret = resData.accessKeySecret,
          //     securityToken = resData.securityToken,
          //     expiration = resData.expiration;
          // _this.uploadAliyun(tempFilePaths,accessKeyId,accessKeySecret,securityToken,expiration)
          _this.uploadAliyun(tempFilePaths,resData)
        }else{
           _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  uploadAliyun(tempFilePaths,accessData,index){
    let {accessKeyId,accessKeySecret,securityToken,expiration} = accessData;
    let _this = this,
        i = index || 0;
        uploadImage(
          {
            filePath: tempFilePaths[i],
            dir: "images/",
            accessKeyId,
            accessKeySecret,
            securityToken,
            expiration,
            success: function (res) {
              i++
              console.log(res);
              let ossFilePaths = _this.data.ossFilePaths;
              ossFilePaths.push(res);
              _this.setData({ossFilePaths})

              if(i == tempFilePaths.length){
                let requestMethod = 'POST',
                    requestUrl = config.addDynamic_url,
                    requestData = {
                      content: _this.data.content,
                      pic: _this.data.ossFilePaths
                    }
                _this.commentFunc(requestMethod,requestUrl,requestData)
              }else{
                _this.uploadAliyun(tempFilePaths,accessData,i)
              }
            },
            fail: function (res) {
              _this.dialog.showToast(res);//自定义弹窗组件
            }
          })
  },
  /**
   * 预览图片方法
   */
  listenerButtonPreviewImage(e) {
    let index = e.target.dataset.index;
    let _this = this;
    console.log(_this.data.tempFilePaths[index]);
    console.log(_this.data.tempFilePaths);
    wx.previewImage({
      current: _this.data.tempFilePaths[index],
      urls: _this.data.tempFilePaths,
      success: function (res) {
        //console.log(res);
      },
      fail: function () {
        //console.log('fail')
      }
    })
  },
  /**
   * 长按删除图片
   */
  deleteImage(e) {
    var that = this;
    var tempFilePaths = that.data.tempFilePaths;
    var index = e.currentTarget.dataset.index;//获取当前长按图片下标
    wx.showModal({
      title: '提示',
      content: '确定要删除此图片吗？',
      success: function (res) {
        if (res.confirm) {//点击确定
          tempFilePaths.splice(index, 1);
        } else if (res.cancel) {//点击取消
          return false;
        }
        that.setData({
          tempFilePaths
        });
      }
    })
  },

  publishComment(){
    if(!this.data.token){
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }
    wx.showLoading();
    let _this = this;
    let requestMethod = '',
        requestUrl = '',
        requestData = null;
    if(_this.data.type=='circle'){//发布圈子
      if(_this.data.tempFilePaths.length<=0){//无图
        requestMethod = 'POST';
        requestUrl = config.addDynamic_url;
        requestData = {
          content: _this.data.content,
          // pic:
        }
        _this.commentFunc(requestMethod,requestUrl,requestData);
      }else{//有图
        _this.updateToServe();
      }
    }else{//发表评论
      requestMethod = 'GET';
      requestUrl = config.addNewsComment_url;
      requestData = {
        content: _this.data.content,
        id: _this.data.id
      }
      _this.commentFunc(requestMethod,requestUrl,requestData);
    }
  },
  commentFunc(requestMethod,requestUrl,requestData){
    let _this = this;
    wx.request({
      method: requestMethod,
      url: requestUrl,
      data: requestData,
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res){
        console.log(res);
        if (res.data.code=="100"){//调用接口返回数据成功
          if(_this.data.type=='circle'){//发布圈子
            //修改上一页页面信息
            let pages = getCurrentPages();
            let prevPage = pages[pages.length - 2];
            prevPage.setData({
              queryData:{
                "pageNum": 1,//第几页
                "pageSize": 10,//一页加载几条
              },
              isBackRefresh: true,
            })
          }
          //返回上一页
          wx.navigateBack({
            delta: 1,
          })
        }else{
          if(res.data.message && res.data.message.indexOf('登录')!=-1){//未登录
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
      },
      complete(){
        wx.hideLoading();
      }
    })
  }
})