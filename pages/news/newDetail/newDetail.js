// pages/news/newDetail/newDetail.js
//获取接口配置
const config = require('../../../config/config')
const { formatYearDate,formatTime } = require('../../../utils/util')
// const WxParse = require('../../../wxParse/wxParse')
// 获取应用实例
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newId:'',//新闻id
    token:'',
    newInfo: null,
    aboutNews: [],//相关阅读
    newComment: [],//新闻评论
    queryData:{
      "pageNum": 1,//第几页
      "pageSize": 10,//一页加载几条
    },
    loading_more: false,
    warn:'',//正在加载/已全部加载完成/暂无数据...等

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

    // let newId = options.newId || '';
    let newId = '';
    if (options.scene) {//扫码进入
      // id=12345&type=news => ["id=12345", "type=news"]
      const queryArray = decodeURIComponent(options.scene).split('&');
      //["id=12345", "type=news"] => {id: "12345", type: "news"}
      let queryObj = {}
      queryArray.map(item => {
        let newArr = item.split('=')
        queryObj[newArr[0]] = newArr[1]
      })
      newId = queryObj.id
    }else{
      newId = options.newId;
    }
    this.setData({newId});
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
    if (token) {//登录状态
      this.setData({token})
    }

    this.getNewInfo();
    this.getRecommend();
    this.getNewComment();
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
    _this.getNewComment();
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
    _this.getNewComment();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  getNewInfo: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.newInfo_url,
      data: {
        id: _this.data.newId
      },
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res) {
        // console.log(res.data.data);
        if (res.data.code == "100") {//调用接口返回数据成功
          //未完待续...
          let newInfo = res.data.data;
          newInfo.formatModifyTime = formatYearDate(newInfo.modifyTime);

          /**
          * WxParse.wxParse(bindName , type, data, target,imagePadding)
          * 1.bindName绑定的数据名(必填)
          * 2.type可以为html或者md(必填)
          * 3.data为传入的具体数据(必填)
          * 4.target为Page对象,一般为this(必填)
          * 5.imagePadding为当图片自适应是左右的单一padding(默认为0,可选)
          */
        //  let context = newInfo.content;
        //  if(context){
        //   WxParse.wxParse('context', 'html', context, _this,5);
        //  }

          /*使用rich-text解析富文本，正则匹配标签自定义样式*/
          // newInfo.content = newInfo.content.replace(/\<img/gi, '<img style="max-width:100%;height:auto;" ');
          // 如果img标签内无style，则加style属性 style="max-width:100%;height:auto;"
          newInfo.content = newInfo.content.replace(/(\<img\s+[^>]*style\s*\=\s*['"][^'"]*)(['"])/gi, '$1;max-width:100%;height:auto;$2');
          // 如果img标签内有style，则在style内增加追加max-width:100%;height:auto;
          newInfo.content = newInfo.content.replace(/(\<img\s+((?!style).)+?)(\/?>)/gi, '$1 style="max-width:100%;height:auto;" $3');
          newInfo.content = newInfo.content.replace(/\<h1/gi, '<h1 style="font-size:18px;" ');
          newInfo.content = newInfo.content.replace(/\<h2/gi, '<h2 style="font-size:17px;" ');
          newInfo.content = newInfo.content.replace(/\<h3/gi, '<h2 style="font-size:16px;" ');

          _this.setData({newInfo})
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  getRecommend: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.recommendNews_url,
      data: {
        id: _this.data.newId
      },
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res) {
        // console.log(res.data.data);
        if (res.data.code == "100") {//调用接口返回数据成功
          let aboutNews = res.data.data;
          aboutNews.map(item=>{
            item.formatModifyTime = formatYearDate(item.modifyTime);
          })
          _this.setData({aboutNews})
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
        }
      },
      fail(res) {//连接服务失败
        _this.dialog.showToast(res.errMsg);//自定义弹窗组件
      }
    })
  },
  // getNewComment: function(){
  //   let _this = this;
  //   wx.request({
  //     method: "GET",
  //     url: config.newComment_url,
  //     data: {
  //       id: _this.data.newId
  //     },
  //     header: {
  //       'content-type': 'application/json',
  //       'token': _this.data.token,
  //     },
  //     success(res) {
  //       // console.log(res.data.data);
  //       if (res.data.code == "100") {//调用接口返回数据成功
  //         let newComment = res.data.data;
  //         _this.setData({newComment})
  //       }else{
  //         _this.dialog.showToast(res.data.message);//自定义弹窗组件
  //       }
  //     },
  //     fail(res) {//连接服务失败
  //       _this.dialog.showToast(res.errMsg);//自定义弹窗组件
  //     }
  //   })
  // },
  getNewComment: function(){
    let _this = this;
    _this.setData({loading_more:true})
    let requestData = _this.data.queryData;
    requestData.id = _this.data.newId;
    wx.request({
      method: "GET",
      url: config.newComment_url,
      data: requestData,
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res) {
        // console.log(res.data.data)
        if (res.data.code == "100") {//调用接口返回数据成功
          let warn = '';
          let newComment = res.data.data.list;
          if(_this.data.queryData.pageNum==1 && (!res.data.data || !newComment || newComment.length<=0)){
            warn = '暂无数据';
            _this.setData({warn})
            return;
          }
          
          newComment.map(item=>{
            item.formatCreateTime = formatTime(item.createTime);
          })
          if (_this.data.queryData.pageNum>1) {//如果不是第一页
            newComment = _this.data.newComment.concat(newComment);
          }else{
            newComment = newComment
          }

          if(_this.data.queryData.pageNum == res.data.data.pages){//无下一页
            warn = '已全部加载完成'
          }

          _this.setData({newComment,warn});
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

  toComment(){
    if(!this.data.token){
      wx.navigateTo({
        url: '/pages/login/login',
      })
      return
    }
    wx.navigateTo({
      url: `/pages/comment/comment?type=new&id=${this.data.newId}`,
    })
  },

  onShareAppMessage: function (res) {
    let _this = this 
    if (res.from === 'button') {//页面分享按钮
      
    }
    return {
      title: '转发',
      path: `/pages/news/newDetail/newDetail?newId=${_this.data.newId}`,
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
        type: 1,
        id: e.currentTarget.dataset.id
      },
      header: {
        'content-type': 'application/json',
        'token': _this.data.token,
      },
      success(res){
        // console.log(res);
        if (res.data.code=="100"){//调用接口返回数据成功
          // _this.getNewInfo();
          let newInfo = _this.data.newInfo;
          let collection = newInfo.collection;
          newInfo.collection = !collection;
          _this.setData({newInfo})
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
  goToNewDetail: function(e){
    wx.navigateTo({
      url: `/pages/news/newDetail/newDetail?newId=${e.currentTarget.dataset.id}`
    })
  },


  //生成文章二维码
  buildWXCode(e){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.buildWXCode_url,
      data: {
        type: 'news',
        id: _this.data.newId
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
            text: that.data.newInfo.title,
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
            url: that.data.newInfo.icon,
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