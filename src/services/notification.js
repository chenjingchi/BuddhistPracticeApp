import PushNotificationIOS from '@react-native-community/push-notification-ios';
import { Platform } from 'react-native';
import PushNotification from 'react-native-push-notification';

/**
 * 通知服务类
 * 处理应用的各种本地推送通知
 */
class NotificationService {
  constructor() {
    this.init();
  }

  /**
   * 初始化通知配置
   */
  init() {
    // 配置通知
    PushNotification.configure({
      // 在iOS上需要用户授权
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      
      // 通知被点击时的回调
      onNotification: function(notification) {
        console.log('通知被点击:', notification);
        
        // iOS需要完成通知处理
        if (Platform.OS === 'ios') {
          notification.finish(PushNotificationIOS.FetchResult.NoData);
        }
      },
      
      // 不自动注册
      requestPermissions: false,
    });
    
    // 创建通知频道（仅Android需要）
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'buddhist-practice-reminders',
          channelName: '佛法学修提醒',
          channelDescription: '念诵和修行提醒',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`通知频道创建${created ? '成功' : '失败'}`)
      );
    }
  }

  /**
   * 请求通知权限
   */
  requestPermissions() {
    return PushNotification.requestPermissions();
  }

  /**
   * 发送立即通知
   * @param {string} title - 通知标题
   * @param {string} message - 通知内容
   * @param {Object} data - 附加数据
   */
  sendImmediateNotification(title, message, data = {}) {
    PushNotification.localNotification({
      channelId: 'buddhist-practice-reminders', // 仅Android需要
      title,
      message,
      userInfo: data,
      playSound: true,
      soundName: 'default',
      vibrate: true,
    });
  }

  /**
   * 预定定时通知
   * @param {string} id - 通知唯一ID
   * @param {string} title - 通知标题
   * @param {string} message - 通知内容
   * @param {Date} date - 通知触发时间
   * @param {Object} data - 附加数据
   */
  scheduleNotification(id, title, message, date, data = {}) {
    PushNotification.localNotificationSchedule({
      id,
      channelId: 'buddhist-practice-reminders', // 仅Android需要
      title,
      message,
      date,
      userInfo: data,
      playSound: true,
      soundName: 'default',
      vibrate: true,
      // 重复选项: 'day', 'week', 'month', 'year'
      repeatType: data.repeatType,
    });
  }

  /**
   * 预定每日定时通知
   * @param {string} id - 通知唯一ID
   * @param {string} title - 通知标题
   * @param {string} message - 通知内容
   * @param {string} time - 通知时间，格式为 'HH:MM'
   * @param {Object} data - 附加数据
   */
  scheduleDailyNotification(id, title, message, time, data = {}) {
    const [hours, minutes] = time.split(':').map(Number);
    
    const notificationDate = new Date();
    notificationDate.setHours(hours);
    notificationDate.setMinutes(minutes);
    notificationDate.setSeconds(0);
    
    // 如果设定时间已过，则安排在明天
    if (notificationDate.getTime() < Date.now()) {
      notificationDate.setDate(notificationDate.getDate() + 1);
    }
    
    this.scheduleNotification(
      id,
      title,
      message,
      notificationDate,
      { ...data, repeatType: 'day' }
    );
  }

  /**
   * 取消指定ID的通知
   * @param {string} id - 通知ID
   */
  cancelNotification(id) {
    PushNotification.cancelLocalNotification(id);
  }

  /**
   * 取消所有通知
   */
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  /**
   * 获取所有预定通知
   * @returns {Promise} 返回所有预定的通知
   */
  getScheduledNotifications() {
    return new Promise((resolve) => {
      PushNotification.getScheduledLocalNotifications(resolve);
    });
  }
}

// 导出服务实例
export default new NotificationService();
