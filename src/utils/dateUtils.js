import { addDays, format, isSameDay, isToday, parseISO, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期为标准日期字符串 (yyyy-MM-dd)
 * 
 * @param {Date} date - 日期对象
 * @returns {String} 格式化的日期字符串
 */
export const formatDate = (date) => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * 格式化日期为友好显示格式 (yyyy年MM月dd日 星期x)
 * 
 * @param {Date|String} date - 日期对象或ISO日期字符串
 * @returns {String} 格式化的日期字符串
 */
export const formatDateDisplay = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'yyyy年MM月dd日 EEEE', { locale: zhCN });
};

/**
 * 格式化日期为时间显示格式 (HH:mm)
 * 
 * @param {Date|String} date - 日期对象或ISO日期字符串
 * @returns {String} 格式化的时间字符串
 */
export const formatTime = (date) => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'HH:mm');
};

/**
 * 获取当天日期字符串
 * 
 * @returns {String} 当天的日期字符串 (yyyy-MM-dd)
 */
export const getTodayString = () => {
  return formatDate(new Date());
};

/**
 * 获取过去N天的日期字符串数组
 * 
 * @param {Number} days - 天数
 * @returns {Array} 日期字符串数组
 */
export const getPastDaysArray = (days) => {
  const result = [];
  const today = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = subDays(today, i);
    result.push(formatDate(date));
  }
  
  return result;
};

/**
 * 获取当周的日期字符串数组
 * 
 * @returns {Array} 包含格式化和原始日期的对象数组
 */
export const getCurrentWeekDays = () => {
  const result = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0是周日，1是周一，以此类推
  
  // 计算本周的第一天(周日)
  const firstDayOfWeek = subDays(today, dayOfWeek);
  
  // 生成本周7天的日期
  for (let i = 0; i < 7; i++) {
    const date = addDays(firstDayOfWeek, i);
    result.push({
      date: date,
      dateString: formatDate(date),
      dayName: format(date, 'E', { locale: zhCN }), // 返回如"周一"、"周二"的短名称
      isToday: isToday(date)
    });
  }
  
  return result;
};

/**
 * 检查两个日期是否为同一天
 * 
 * @param {Date|String} date1 - 第一个日期
 * @param {Date|String} date2 - 第二个日期
 * @returns {Boolean} 是否为同一天
 */
export const isSameDate = (date1, date2) => {
  const date1Obj = typeof date1 === 'string' ? parseISO(date1) : date1;
  const date2Obj = typeof date2 === 'string' ? parseISO(date2) : date2;
  
  return isSameDay(date1Obj, date2Obj);
};

/**
 * 解析时间字符串为日期对象
 * 
 * @param {String} timeString - 时间字符串，格式为 "HH:MM"
 * @returns {Date} 设置了指定时间的日期对象
 */
export const parseTimeString = (timeString) => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  date.setMilliseconds(0);
  
  return date;
};

/**
 * 计算两个日期之间的天数差
 * 
 * @param {Date|String} startDate - 开始日期
 * @param {Date|String} endDate - 结束日期
 * @returns {Number} 天数差
 */
export const getDaysDifference = (startDate, endDate) => {
  const startObj = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const endObj = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  // 转换为天数时间戳并计算差值
  const diffTime = Math.abs(endObj.getTime() - startObj.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
