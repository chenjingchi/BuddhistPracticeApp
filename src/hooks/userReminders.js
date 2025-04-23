import { useCallback, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { AppContext } from '../contexts/AppContext';
import notificationService from '../services/notification';
import { formatDate, parseTimeString } from '../utils/dateUtils';
import { generateUniqueId } from '../utils/idUtils';

/**
 * 提醒钩子
 * 管理应用提醒的创建、更新和删除
 */
const useReminders = () => {
  const { reminders, addItem, updateItem, removeItem } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);

  // 初始化通知权限
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        await notificationService.requestPermissions();
      } catch (error) {
        console.error('请求通知权限失败:', error);
      }
    };

    requestPermissions();
  }, []);

  // 添加提醒
  const addReminder = useCallback(async (reminderData) => {
    try {
      setIsLoading(true);

      // 创建提醒对象
      const newReminder = {
        id: generateUniqueId(),
        ...reminderData,
        createdAt: new Date().toISOString(),
        isActive: true,
      };

      // 添加到上下文
      addItem('reminders', newReminder);

      // 设置系统通知
      if (newReminder.time) {
        // 解析时间字符串为Date对象
        let notificationDate;
        if (newReminder.date) {
          // 如果有具体日期
          notificationDate = new Date(newReminder.date);
          const [hours, minutes] = newReminder.time.split(':').map(Number);
          notificationDate.setHours(hours);
          notificationDate.setMinutes(minutes);
          notificationDate.setSeconds(0);
        } else {
          // 只有时间，设置为今天的该时间
          notificationDate = parseTimeString(newReminder.time);
          
          // 如果时间已过，设置为明天
          if (notificationDate.getTime() < Date.now()) {
            notificationDate.setDate(notificationDate.getDate() + 1);
          }
        }

        if (newReminder.repeatType) {
          // 设置重复通知
          notificationService.scheduleDailyNotification(
            newReminder.id,
            newReminder.title || '修行提醒',
            newReminder.message,
            newReminder.time,
            { repeatType: newReminder.repeatType, data: { reminderId: newReminder.id } }
          );
        } else {
          // 设置单次通知
          notificationService.scheduleNotification(
            newReminder.id,
            newReminder.title || '修行提醒',
            newReminder.message,
            notificationDate,
            { data: { reminderId: newReminder.id } }
          );
        }
      }

      setIsLoading(false);
      return newReminder;
    } catch (error) {
      setIsLoading(false);
      console.error('添加提醒失败:', error);
      Alert.alert('错误', '添加提醒失败，请重试');
      throw error;
    }
  }, [addItem]);

  // 更新提醒
  const updateReminder = useCallback(async (id, updatedData) => {
    try {
      setIsLoading(true);

      // 查找现有提醒
      const existingReminder = reminders.find(r => r.id === id);
      if (!existingReminder) {
        throw new Error('提醒不存在');
      }

      // 更新提醒对象
      const updatedReminder = {
        ...existingReminder,
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };

      // 更新上下文
      updateItem('reminders', id, updatedData);

      // 取消现有通知
      notificationService.cancelNotification(id);

      // 如果提醒是激活状态，重新设置系统通知
      if (updatedReminder.isActive && updatedReminder.time) {
        // 解析时间字符串为Date对象
        let notificationDate;
        if (updatedReminder.date) {
          // 如果有具体日期
          notificationDate = new Date(updatedReminder.date);
          const [hours, minutes] = updatedReminder.time.split(':').map(Number);
          notificationDate.setHours(hours);
          notificationDate.setMinutes(minutes);
          notificationDate.setSeconds(0);
        } else {
          // 只有时间，设置为今天的该时间
          notificationDate = parseTimeString(updatedReminder.time);
          
          // 如果时间已过，设置为明天
          if (notificationDate.getTime() < Date.now()) {
            notificationDate.setDate(notificationDate.getDate() + 1);
          }
        }

        if (updatedReminder.repeatType) {
          // 设置重复通知
          notificationService.scheduleDailyNotification(
            updatedReminder.id,
            updatedReminder.title || '修行提醒',
            updatedReminder.message,
            updatedReminder.time,
            { repeatType: updatedReminder.repeatType, data: { reminderId: updatedReminder.id } }
          );
        } else {
          // 设置单次通知
          notificationService.scheduleNotification(
            updatedReminder.id,
            updatedReminder.title || '修行提醒',
            updatedReminder.message,
            notificationDate,
            { data: { reminderId: updatedReminder.id } }
          );
        }
      }

      setIsLoading(false);
      return updatedReminder;
    } catch (error) {
      setIsLoading(false);
      console.error('更新提醒失败:', error);
      Alert.alert('错误', '更新提醒失败，请重试');
      throw error;
    }
  }, [reminders, updateItem]);

  // 删除提醒
  const deleteReminder = useCallback(async (id) => {
    try {
      setIsLoading(true);

      // 删除上下文中的提醒
      removeItem('reminders', id);

      // 取消系统通知
      notificationService.cancelNotification(id);

      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      console.error('删除提醒失败:', error);
      Alert.alert('错误', '删除提醒失败，请重试');
      throw error;
    }
  }, [removeItem]);

  // 切换提醒激活状态
  const toggleReminderActive = useCallback(async (id) => {
    try {
      setIsLoading(true);

      // 查找现有提醒
      const existingReminder = reminders.find(r => r.id === id);
      if (!existingReminder) {
        throw new Error('提醒不存在');
      }

      // 切换激活状态
      const isActive = !existingReminder.isActive;

      // 更新上下文
      updateItem('reminders', id, { isActive });

      // 根据新状态设置或取消通知
      if (isActive) {
        if (existingReminder.time) {
          // 重新设置通知
          if (existingReminder.repeatType) {
            // 设置重复通知
            notificationService.scheduleDailyNotification(
              existingReminder.id,
              existingReminder.title || '修行提醒',
              existingReminder.message,
              existingReminder.time,
              { repeatType: existingReminder.repeatType, data: { reminderId: existingReminder.id } }
            );
          } else if (existingReminder.date) {
            // 设置单次通知
            const notificationDate = new Date(existingReminder.date);
            const [hours, minutes] = existingReminder.time.split(':').map(Number);
            notificationDate.setHours(hours);
            notificationDate.setMinutes(minutes);
            notificationDate.setSeconds(0);
            
            notificationService.scheduleNotification(
              existingReminder.id,
              existingReminder.title || '修行提醒',
              existingReminder.message,
              notificationDate,
              { data: { reminderId: existingReminder.id } }
            );
          }
        }
      } else {
        // 取消通知
        notificationService.cancelNotification(id);
      }

      setIsLoading(false);
      return { ...existingReminder, isActive };
    } catch (error) {
      setIsLoading(false);
      console.error('切换提醒状态失败:', error);
      Alert.alert('错误', '切换提醒状态失败，请重试');
      throw error;
    }
  }, [reminders, updateItem]);

  // 获取今日提醒
  const getTodayReminders = useCallback(() => {
    const today = formatDate(new Date());
    
    return reminders.filter(reminder => {
      // 如果是一次性提醒且日期是今天
      if (reminder.date && reminder.date === today) {
        return reminder.isActive;
      }
      
      // 如果是重复提醒
      if (reminder.repeatType) {
        return reminder.isActive;
      }
      
      return false;
    });
  }, [reminders]);

  // 获取即将到来的提醒
  const getUpcomingReminders = useCallback((days = 7) => {
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);
    
    const startDateStr = formatDate(now);
    const endDateStr = formatDate(endDate);
    
    return reminders.filter(reminder => {
      // 只过滤激活的提醒
      if (!reminder.isActive) return false;
      
      // 如果是重复提醒，总是显示
      if (reminder.repeatType) return true;
      
      // 如果是一次性提醒，检查日期是否在范围内
      if (reminder.date) {
        return reminder.date >= startDateStr && reminder.date <= endDateStr;
      }
      
      return false;
    });
  }, [reminders]);

  // 发送即时提醒
  const sendImmediateReminder = useCallback((message, title = '即时提醒') => {
    notificationService.sendImmediateNotification(title, message);
  }, []);

  return {
    reminders,
    isLoading,
    addReminder,
    updateReminder,
    deleteReminder,
    toggleReminderActive,
    getTodayReminders,
    getUpcomingReminders,
    sendImmediateReminder,
  };
};

export default useReminders;
