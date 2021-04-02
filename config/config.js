// config.js
/**
 * 小程序后端接口配置文件
 */
var host = "https://fengming.ltb666.com"//服务域名
var fileHost = "https://fmcj.oss-cn-hangzhou.aliyuncs.com"

var config = {
  host,
  fileHost,
  uploadImageUrl: `${fileHost}`, //默认存在根目录，可根据需求改
  // AccessKeySecret: 'YNKyIvpmO3b84CpdSORa1lKOCK0dcT',
  // OSSAccessKeyId: 'LTAI4G49CnPPtz72StTc1Ee3',
  // timeout: 87600, //这个是上传文件时Policy的失效时间

  //GET 登录
  wxLogin_url: `${host}/mini-app/user/login`,
  // POST绑定手机号
  bindWechatPhone_url: `${host}/mini-app/user/wechatBindPhone.do`,
  //GET token换取用户信息
  queryUserInfo_url: `${host}/mini-app/user/user-info`,
  //GET 我的会议
  ownMeetPage_url: `${host}/mini-app/meet/own`,
  //GET 我的收藏 参数type:1资讯/2会议/3圈子
  collectionPage_url: `${host}/mini-app/collection/page`,
  //GET 我的评论 参数type:1资讯/2会议
  commentPage_url: `${host}/mini-app/comment/page`,

  //GET 首页轮播图
  indexBanner_url: `${host}/mini-app/banner/query`,
  //GET 首页推荐新闻
  indexNews_url: `${host}/mini-app/news/index`,
  //GET 首页会议
  indexMeet_url: `${host}/mini-app/meet/index`,

  //GET 新闻列表
  newsPage_url: `${host}/mini-app/news/page`,
  //GET 新闻详情 参数id
  newInfo_url: `${host}/mini-app/news/info`,
  //GET 新闻详情-相关阅读 参数id
  recommendNews_url: `${host}/mini-app/news/recommend`,
  //GET 新闻详情-新闻评论 参数id
  newComment_url: `${host}/mini-app/news/page-comment`,
  //GET 会议列表
  meetPage_url: `${host}/mini-app/meet/page`,
  //GET 会议详情 参数id
  meetInfo_url: `${host}/mini-app/meet/info`,
  //GET 圈子列表
  dynamicPage_url: `${host}/mini-app/dynamic/page`,

  //POST 发布圈子 参数content、pic
  addDynamic_url: `${host}/mini-app/dynamic/add`,
  //GET 新闻评论 参数content、id
  addNewsComment_url: `${host}/mini-app/news/add-comment`,
  //GET 圈子评论 参数content、id
  addDynamicComment_url: `${host}/mini-app/dynamic/add-comment`,
  //GET 阿里云上传图片授权
  imgUpload_url: `${host}/aliyun/query-sts`,

  //GET 收藏或取消收藏 参数id、type:1资讯/2会议/3圈子
  addOrDelCollection_url: `${host}/mini-app/collection/addOrDel`,

  //GET 生成微信预订单 参数meetId
  submitOrder_url: `${host}/mini-app/user/submit-order`,

  //GET 生成二维码
  buildWXCode_url: `${host}/mini-app/buildWxminima.do`,
};
//对外把对象config返回
module.exports = config