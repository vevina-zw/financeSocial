// pages/meeting/meetingDetail/meetingDetail.js
//获取接口配置
const config = require('../../../config/config')
const { formatTime } = require('../../../utils/util')
const WxParse = require('../../../wxParse/wxParse')
// 获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    meetId:'',//会议id
    token:'',
    meetInfo: null,

    bannerData:[
      // "http://img.zcool.cn/community/014056564bd8596ac7251c94eb5559.jpg",
      // "http://img.zcool.cn/community/01e03b58047e96a84a0e282b09e8fc.jpg",
      // "http://pic.90sjimg.com/back_pic/00/00/69/40/d678a42886e0232aaea0d6e69e9b1945.jpg",
    ],
    indicatorDots: true,// 是否显示面板指示点
    vertical: false,// 滑动方向是否为纵向
    autoplay: true,// 自动切换
    circular: true,// 采用衔接滑动
    interval: 3000,// 自动切换时间间隔2s
    duration: 500,// 滑动动画时长0.5s
    indicatorColor: "#CAD5DD",//指示点颜色
    indicatorActiveColor: "#F04848",//指示点颜色
    
    hideModal:true, //选择分享到好友/朋友圈 模态框的状态 true-隐藏 false-显示
    animationData:{},//

    imgDraw:null,//绘制图片
    drawImgPath:"",//绘制好的图片地址
    imgHidden: true,//是否展示绘制好的图片弹窗 true-隐藏 false-显示
    qrcodeUrl:'',//二维码地址
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.dialog = this.selectComponent("#toast");
    // let meetId = options.meetId || '';
    let meetId = '';
    if (options.scene) {//扫码进入
      // id=12345&type=meet => ["id=12345", "type=meet"]
      const queryArray = decodeURIComponent(options.scene).split('&');
      //["id=12345", "type=meet"] => {id: "12345", type: "meet"}
      let queryObj = {}
      queryArray.map(item => {
        let newArr = item.split('=')
        queryObj[newArr[0]] = newArr[1]
      })
      meetId = queryObj.id
    }else{
      meetId = options.meetId;
    }
    this.setData({meetId});
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

    this.getMeetInfo();
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

  getMeetInfo: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.meetInfo_url,
      data: {
        id: _this.data.meetId
      },
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res) {
        // console.log(res.data.data);
        if (res.data.code == "100") {//调用接口返回数据成功
          let meetInfo = res.data.data;
          meetInfo.formatStartTime = formatTime(meetInfo.startTime);
          meetInfo.formatEndTime = formatTime(meetInfo.endTime);
          // let bannerData = meetInfo.pic ? meetInfo.pic.split(',') : [];
          let bannerData = [],
          indicatorDots = true;
          if(meetInfo.pic){
            bannerData =  meetInfo.pic.split(',').map(el => el.trim()).filter(item => item.trim() != '');//以,分割 并去除空项
            if(bannerData.length<=1){
              indicatorDots = false;
            }
          }
          
          /**
          * WxParse.wxParse(bindName , type, data, target,imagePadding)
          * 1.bindName绑定的数据名(必填)
          * 2.type可以为html或者md(必填)
          * 3.data为传入的具体数据(必填)
          * 4.target为Page对象,一般为this(必填)
          * 5.imagePadding为当图片自适应是左右的单一padding(默认为0,可选)
          */
         let context = meetInfo.content;
         if(context){
          WxParse.wxParse('context', 'html', context, _this,15);
         }

          _this.setData({meetInfo,bannerData,indicatorDots})
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },

  toPay: function(e){
    if(!this.data.token){
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }
    let meetId = e.currentTarget.dataset.id;
    let _this = this;
    wx.request({
      method: "GET",
      url: config.submitOrder_url,
      data: {
        meetId
      },
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
            _this.wxPay(resData,meetId);
          }
        }else{
          if(res.data.message && res.data.message.indexOf('登录')!=-1){// 未登录
            wx.removeStorageSync('token');
            wx.navigateTo({
              url: '/pages/login/login',
            })
          }else if(res.data.message && res.data.message.indexOf('手机号')!=-1){// 缺少手机号
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
  wxPay: function(param,meetId) {
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
        _this.dialog.showToast('报名成功');//自定义弹窗组件
        _this.getMeetInfo();
        //修改上一页页面信息：该条会议hadBuy为true（已报名）
        let pages = getCurrentPages();
        let prevPage = pages[pages.length - 2];
        let newsLists = prevPage.data.newsLists;
        newsLists.map(item=>{
          if(item.id == meetId){
            item.hadBuy = true;
          }
        })
        prevPage.setData({newsLists})
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
  onShareAppMessage: function (res) {
    let _this = this;
    if (res.from === 'button') {//页面分享按钮
      
    }
    return {
      title: '转发',
      path: `/pages/meeting/meetingDetail/meetingDetail?meetId=${_this.data.meetId}`,
      success: function (res) {
      console.log('成功', res)
      }
    }
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
        type: 2,
        id: e.currentTarget.dataset.id
      },
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res){
        // console.log(res);
        if (res.data.code=="100"){//调用接口返回数据成功
          let meetInfo = _this.data.meetInfo;
          let collection = meetInfo.collection;
          meetInfo.collection = !collection;
          _this.setData({meetInfo})
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
  
  //生成文章二维码
  buildWXCode(e){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.buildWXCode_url,
      data: {
        type: 'meet',
        id: _this.data.meetId
      },
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res){
        // console.log(res);
        if (res.data.code=="100"){//调用接口返回数据成功
          let codeUrl = res.data.data;
          wx.getImageInfo({                       
            src:codeUrl,//服务器返回的带参数的小程序码地址
            success: function (res) {
                //res.path是网络图片的本地地址
                _this.setData({qrcodeUrl:res.path})
                _this.drawPicture();
            },
            fail: function (res) {
                //失败回调
            }
          });
        }else{
          _this.dialog.showToast(res.data.message || res.errMsg);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  drawPicture(){//绘制图片
    var that = this;
    wx.showLoading({
      title: '图片生成中'
    })
    that.setData({
      imgDraw: {
        width: '600px',
        height: '840px',
        background:"#fff",
        views: [
          {
            type: 'text',
            text: that.data.meetInfo.title,
            css: {
              top: '60px',
              left: '300px',
              width: '520px',
              fontSize: '30px',
              maxLines: '2',
              lineHeight: '36px',
              fontWeight: 'bold',
              align: 'center',
              color: '#3c3c3c'
            }
          },
          {
            type: 'image',
            url: that.data.meetInfo.icon,
            css: {
              top: '150px',
              left: '300px',
              align: 'center',
              width: '520px',
              height: '360px',
              mode: 'scaleToFill',
            }
          },
          {
            type: 'image',
            url: that.data.qrcodeUrl,
            css: {
              top: '590px',
              left: '40px',
              width: '200px',
              height: '200px',
            }
          },
          {
            type: 'text',
            text: '长按识别小程序码',
            css: {
              top: '650px',
              left: '280px',
              fontSize: '24px',
              color: '#3c3c3c'
            }
          },
          {
            type: 'text',
            text: '进入查看详情内容',
            css: {
              top: '690px',
              left: '280px',
              fontSize: '24px',
              color: '#3c3c3c'
            }
          },
        ]
      }
    })
  },
  onImgOK(e) {
    this.setData({
      drawImgPath: e.detail.path,
      imgHidden: false
    })
    this.saveImage();
    wx.hideLoading()
  },
  onImgErr(){
    wx.hideLoading()
    _this.dialog.showToast('图片生成失败');//自定义弹窗组件
  },
  saveImage() {
    if (this.data.drawImgPath && typeof this.data.drawImgPath === 'string') {
      wx.saveImageToPhotosAlbum({
        filePath: this.data.drawImgPath,
      });
    }
  },
  hidePreview(){
    this.setData({imgHidden:true})
  },

  // 显示遮罩层
 showModal: function () {
    var that=this;
    that.setData({hideModal:false})
    var animation = wx.createAnimation({
      duration: 300,//动画的持续时间 默认400ms 数值越大，动画越慢 数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation 
    setTimeout(function(){
      that.fadeIn();//调用显示动画
    },200) 
  },
  // 隐藏遮罩层
  hideModal: function () {
    var that=this; 
    var animation = wx.createAnimation({
      duration: 300,//动画的持续时间 默认400ms 数值越大，动画越慢 数值越小，动画越快
      timingFunction: 'ease',//动画的效果 默认值是linear
    })
    this.animation = animation
    that.fadeDown();//调用隐藏动画 
    setTimeout(function(){
      that.setData({hideModal:true}) 
    },200)//先执行下滑动画，再隐藏模块
  },
  //动画集
  fadeIn:function(){
    this.animation.translateY(0).step()
    this.setData({
      animationData: this.animation.export()//动画实例的export方法导出动画数据传递给组件的animation属性
    }) 
  },
  fadeDown:function(){
    this.animation.translateY(300).step()
    this.setData({
      animationData: this.animation.export(), 
    })
  }, 
})