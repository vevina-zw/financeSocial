//时间→年/月/日 时:分:秒
const formatTime = date => {
  var time = new Date(date);
  const year = time.getFullYear()
  const month = time.getMonth() + 1
  const day = time.getDate()
  const hour = time.getHours()
  const minute = time.getMinutes()
  const second = time.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

//时间→年/月/日
const formatYearDate = date => {
  var time = new Date(date);
  var year = time.getFullYear();
  const month = time.getMonth() + 1
  const day = time.getDate()
  var timeVal = year + '/' + month + '/' + day;
  return timeVal;
}

//时间2021-03-15T16:00:00.000+00:00 →月/日
const formatDate = date => {
  var time = new Date(date);
  var year = time.getFullYear();
  const month = time.getMonth() + 1
  const day = time.getDate()
  var timeVal = month + '/' + day;
  return timeVal;
}
//时间2021-03-16 00:00:00 →月/日
const formatDate1 = date => {
  // ios兼容：年-月-日 需转为 年/月/日
  let dateT = date.replace(/-/g,'/');
  var time = new Date(dateT);
  var year = time.getFullYear();
  const month = time.getMonth() + 1
  const day = time.getDate()
  var timeVal = month + '/' + day;
  return timeVal;
}

//时间→星期几
const formatWeekDay = date => {
  // ios兼容：年-月-日 需转为 年/月/日
  let dateT = date.replace(/-/g,'/');
  let datelist = ['周日','周一','周二','周三','周四','周五','周六',]
  return datelist[new Date(dateT).getDay()];
}

//日期转为刚刚、1分钟前、1小时前、1天前、其他为日期年/月/日
const formatDayTransform = date =>{
  var differenStr = ''
  var date3 = new Date().getTime() - new Date(date).getTime();   //时间差的毫秒数  
  //计算出相差天数
  var days=Math.floor(date3/(24*3600*1000))
  //计算出小时数
  var leave1=date3%(24*3600*1000)    //计算天数后剩余的毫秒数
  var hours=Math.floor(leave1/(3600*1000))
  //计算相差分钟数
  var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
  var minutes=Math.floor(leave2/(60*1000))
  //计算相差秒数
  var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
  var seconds=Math.round(leave3/1000)
  // console.log(" 相差 "+days+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒")
  // if(days==0 && hours ==0 && minutes>0){
  //   differenStr = '1分前'
  // }else if(days==0 && hours <24 && hours >0){
  //   differenStr = '1小时前'
  // }else if(days>0 && days<2){
  //   differenStr = '1天前'
  // }else if(days>1){
  //   differenStr = formatYearDate(date)
  // }else{
  //   differenStr = '刚刚'
  // }
  if(days==0 && hours>=0 && hours<2){//2小时之内显示 “刚刚”
    differenStr = '刚刚'
  }else if(days==0 && hours>=2 && hours<24){//2-24个小时显示 “*小时前”
    differenStr = `${hours+1}小时前`
  }else if(days>=1 && days<3){//1-3天显示“*天前”
    differenStr = `${days+1}天前`
  }else{//days>=3，大于3天显示日期
    differenStr = formatYearDate(date)
  }
  return differenStr;
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

module.exports = {
  formatTime,formatYearDate,formatDate,formatDate1,formatWeekDay,formatDayTransform
}
