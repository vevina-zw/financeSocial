// index.js
//获取接口配置
const config = require('../../config/config')
const { formatDate1,formatWeekDay } = require('../../utils/util');
// 获取应用实例
const app = getApp()

Page({
  data: {
    bannerData:[
      // "http://img.zcool.cn/community/014056564bd8596ac7251c94eb5559.jpg",
      // "http://img.zcool.cn/community/01e03b58047e96a84a0e282b09e8fc.jpg",
    ],
    indicatorDots: true,// 是否显示面板指示点
    vertical: false,// 滑动方向是否为纵向
    autoplay: true,// 自动切换
    circular: true,// 采用衔接滑动
    interval: 3000,// 自动切换时间间隔2s
    duration: 500,// 滑动动画时长0.5s
    indicatorColor: "#CAD5DD",//指示点颜色
    indicatorActiveColor: "#F04848",//指示点颜色

    newsData: [],
    meetData: [],
    today:1,//今日日期
  },
  onLoad() {
    this.dialog = this.selectComponent("#toast");
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getDay();
    this.getIndexBanner();
    this.getIndexNews();
    this.getIndexMeet();
  },
  getDay: function(){
    let today = new Date().getDate();//得到日期
    this.setData({today})
  },
  getIndexBanner: function(){
    let _this = this;
      wx.request({
        method: "GET",
        url: config.indexBanner_url,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success(res){
          console.log(res);
          if (res.data.code=="100"){//调用接口返回数据成功
            let data = res.data.data;
            // let bannerData = [];
            // data.forEach(item=>{
            //   bannerData.push(item.pic)
            // })
            _this.setData({bannerData:data})
          }else{
            _this.dialog.showToast(res.data.message);//自定义弹窗组件
          }
        },
        fail(res) {//连接服务失败
          _this.dialog.showToast(res.errMsg);//自定义弹窗组件
        }
      })
  },
  getIndexNews: function(){
    let _this = this;
      wx.request({
        method: "GET",
        url: config.indexNews_url,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success(res){
          console.log(res);
          if (res.data.code=="100"){//调用接口返回数据成功
            let data = res.data.data;
            // let newsData = [];
            // data.forEach(item=>{
            //   newsData.push(item)
            // })
            let newsData = data;
            _this.setData({newsData})
          }else{
            _this.dialog.showToast(res.data.message);//自定义弹窗组件
          }
        },
        fail(res) {//连接服务失败
          _this.dialog.showToast(res.errMsg);//自定义弹窗组件
        }
      })
  },
  getIndexMeet: function(){
    let _this = this;
    wx.request({
      method: "GET",
      url: config.indexMeet_url,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success(res){
        console.log(res);
        if (res.data.code=="100"){//调用接口返回数据成功
          let data = res.data.data;
          data.map(item=>{
            item.formatStartTime = formatDate1(item.startTime);
            item.formatWeekDay = formatWeekDay(item.startTime);
          })
          let meetData = [];
          data.forEach(item=>{
            meetData.push(item)
          })
          _this.setData({meetData})
        }else{
          _this.dialog.showToast(res.data.message);//自定义弹窗组件
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
  goToMeetDetail: function(e){
    wx.navigateTo({
      url: `/pages/meeting/meetingDetail/meetingDetail?meetId=${e.currentTarget.dataset.id}`
    })
  },
  bannerDetail: function(e){
    let type= e.currentTarget.dataset.type;
    let id = e.currentTarget.dataset.id;
    if(type == '1'){//新闻
      wx.navigateTo({
        url: `/pages/news/newDetail/newDetail?newId=${id}`
      })
    }else if(type == '2'){//会议
      wx.navigateTo({
        url: `/pages/meeting/meetingDetail/meetingDetail?meetId=${id}`
      })
    }else{//不跳转，仅图片
      return
    }
  }
})
