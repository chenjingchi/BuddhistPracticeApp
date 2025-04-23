import { Platform } from 'react-native';
import * as FileSystem from 'react-native-fs';
import Share from 'react-native-share';

/**
 * 资源共享服务
 * 提供应用内容的分享和导出功能
 */
class SharingService {
  /**
   * 分享卡片图片
   * 
   * @param {Object} cardInfo - 卡片信息对象
   * @param {Object} options - 分享选项
   * @returns {Promise} 分享操作的Promise
   */
  async shareCard(cardInfo, options = {}) {
    try {
      // 确保URI是文件URI
      const fileUri = cardInfo.imageUri.startsWith('file://')
        ? cardInfo.imageUri
        : `file://${cardInfo.imageUri}`;
      
      // 默认分享选项
      const defaultOptions = {
        title: '分享佛法教言卡片',
        message: cardInfo.text,
        url: fileUri,
        type: 'image/jpeg',
      };
      
      // 合并选项
      const shareOptions = { ...defaultOptions, ...options };
      
      // 执行分享
      const result = await Share.open(shareOptions);
      return result;
    } catch (error) {
      console.error('分享卡片失败:', error);
      // 如果用户取消分享，不视为错误
      if (error.message === 'User did not share') {
        return { dismissed: true };
      }
      throw error;
    }
  }
  
  /**
   * 分享教言文本
   * 
   * @param {Object} teaching - 教言对象
   * @param {Object} options - 分享选项
   * @returns {Promise} 分享操作的Promise
   */
  async shareTeaching(teaching, options = {}) {
    try {
      // 构建分享文本
      const shareText = `${teaching.content}\n\n——${teaching.source || '佛法学修'}`;
      
      // 默认分享选项
      const defaultOptions = {
        title: '分享佛法教言',
        message: shareText,
      };
      
      // 合并选项
      const shareOptions = { ...defaultOptions, ...options };
      
      // 执行分享
      const result = await Share.open(shareOptions);
      return result;
    } catch (error) {
      console.error('分享教言失败:', error);
      if (error.message === 'User did not share') {
        return { dismissed: true };
      }
      throw error;
    }
  }
  
  /**
   * 设置壁纸
   * 实际上是将图片导出，方便用户设置为壁纸
   * 
   * @param {String} imageUri - 图片URI
   * @returns {Promise} 操作的Promise
   */
  async setAsWallpaper(imageUri) {
    try {
      // 由于React Native没有直接设置壁纸的API，我们只能分享图片让用户自己设置
      const shareOptions = {
        title: '设置为壁纸',
        message: '长按图片并选择"设为壁纸"',
        url: imageUri,
        type: 'image/jpeg',
      };
      
      const result = await Share.open(shareOptions);
      return result;
    } catch (error) {
      console.error('设置壁纸失败:', error);
      if (error.message === 'User did not share') {
        return { dismissed: true };
      }
      throw error;
    }
  }
  
  /**
   * 导出数据备份
   * 
   * @param {String} backupData - 备份数据JSON字符串
   * @returns {Promise} 导出操作的Promise
   */
  async exportBackup(backupData) {
    try {
      // 创建临时文件
      const fileName = `buddhist_practice_backup_${Date.now()}.json`;
      const tempFilePath = `${FileSystem.CachesDirectoryPath}/${fileName}`;
      
      // 写入备份数据
      await FileSystem.writeFile(tempFilePath, backupData, 'utf8');
      
      // 分享文件
      const shareOptions = {
        title: '导出佛法学修数据备份',
        message: '这是您的佛法学修应用数据备份',
        url: `file://${tempFilePath}`,
        type: 'application/json',
      };
      
      const result = await Share.open(shareOptions);
      
      // 分享后删除临时文件
      await FileSystem.unlink(tempFilePath);
      
      return result;
    } catch (error) {
      console.error('导出备份失败:', error);
      if (error.message === 'User did not share') {
        return { dismissed: true };
      }
      throw error;
    }
  }
  
  /**
   * 分享修行统计数据
   * 
   * @param {Object} statsData - 统计数据对象
   * @returns {Promise} 分享操作的Promise
   */
  async shareStats(statsData) {
    try {
      // 构建统计信息文本
      const { streakDays, totalCount, practices } = statsData;
      
      let statsText = `我已连续修行 ${streakDays} 天，总计念诵 ${totalCount} 次。\n\n`;
      
      if (practices && practices.length > 0) {
        statsText += '修行项目进度：\n';
        
        practices.forEach(practice => {
          const progress = ((practice.completed / practice.totalTarget) * 100).toFixed(1);
          statsText += `${practice.name}: ${practice.completed}/${practice.totalTarget} (${progress}%)\n`;
        });
      }
      
      statsText += '\n来自佛法学修应用';
      
      // 分享选项
      const shareOptions = {
        title: '分享修行统计',
        message: statsText,
      };
      
      // 执行分享
      const result = await Share.open(shareOptions);
      return result;
    } catch (error) {
      console.error('分享统计数据失败:', error);
      if (error.message === 'User did not share') {
        return { dismissed: true };
      }
      throw error;
    }
  }
  
  /**
   * 分享每日提醒
   * 
   * @param {Object} reminder - 提醒对象
   * @returns {Promise} 分享操作的Promise
   */
  async shareReminder(reminder) {
    try {
      // 构建提醒文本
      let reminderText = `${reminder.title || '修行提醒'}\n\n`;
      reminderText += `${reminder.message}\n\n`;
      
      if (reminder.time) {
        reminderText += `时间: ${reminder.time}\n`;
      }
      
      if (reminder.repeatType) {
        const repeatMap = {
          'day': '每天',
          'week': '每周',
          'month': '每月',
          'year': '每年',
        };
        
        reminderText += `重复: ${repeatMap[reminder.repeatType] || reminder.repeatType}\n`;
      }
      
      reminderText += '\n来自佛法学修应用';
      
      // 分享选项
      const shareOptions = {
        title: '分享修行提醒',
        message: reminderText,
      };
      
      // 执行分享
      const result = await Share.open(shareOptions);
      return result;
    } catch (error) {
      console.error('分享提醒失败:', error);
      if (error.message === 'User did not share') {
        return { dismissed: true };
      }
      throw error;
    }
  }
  
  /**
   * 导入数据
   * 辅助解析导入的数据文件
   * 
   * @param {String} fileUri - 文件URI
   * @returns {Promise} 包含解析后数据的Promise
   */
  async importDataFromFile(fileUri) {
    try {
      // 确保文件路径正确
      const filePath = fileUri.replace('file://', '');
      
      // 读取文件内容
      const content = await FileSystem.readFile(filePath, 'utf8');
      
      // 尝试解析JSON
      try {
        const data = JSON.parse(content);
        return {
          success: true,
          data,
        };
      } catch (parseError) {
        console.error('解析JSON失败:', parseError);
        return {
          success: false,
          error: '文件格式无效，无法解析为JSON',
        };
      }
    } catch (error) {
      console.error('读取导入文件失败:', error);
      return {
        success: false,
        error: `读取文件失败: ${error.message}`,
      };
    }
  }
  
  /**
   * 分享多个图片
   * 
   * @param {Array} imageUris - 图片URI数组
   * @param {String} message - 分享消息
   * @returns {Promise} 分享操作的Promise
   */
  async shareMultipleImages(imageUris, message = '') {
    try {
      // 检查平台支持
      if (Platform.OS === 'android') {
        // Android支持多图分享
        const shareOptions = {
          title: '分享图片',
          message: message,
          urls: imageUris,
        };
        
        const result = await Share.open(shareOptions);
        return result;
      } else {
        // iOS不直接支持多图分享，只分享第一张
        const shareOptions = {
          title: '分享图片',
          message: message,
          url: imageUris[0],
          type: 'image/jpeg',
        };
        
        const result = await Share.open(shareOptions);
        return result;
      }
    } catch (error) {
      console.error('分享多图失败:', error);
      if (error.message === 'User did not share') {
        return { dismissed: true };
      }
      throw error;
    }
  }
  
  /**
   * 创建分享URL（简化的URL方案）
   * 
   * @param {String} type - 分享类型
   * @param {String} id - 内容ID
   * @returns {String} 分享URL
   */
  createShareUrl(type, id) {
    // 创建应用URL方案
    return `buddhist-practice://${type}/${id}`;
  }
  
  /**
   * 解析分享URL
   * 
   * @param {String} url - 分享URL
   * @returns {Object} 解析结果
   */
  parseShareUrl(url) {
    try {
      // 检查URL是否匹配应用URL方案
      if (!url.startsWith('buddhist-practice://')) {
        return {
          valid: false,
          error: '无效的URL方案',
        };
      }
      
      // 解析路径部分
      const path = url.replace('buddhist-practice://', '');
      const [type, id] = path.split('/');
      
      return {
        valid: true,
        type,
        id,
      };
    } catch (error) {
      console.error('解析分享URL失败:', error);
      return {
        valid: false,
        error: `解析URL失败: ${error.message}`,
      };
    }
  }
  
  /**
   * 分享应用邀请
   * 
   * @returns {Promise} 分享操作的Promise
   */
  async shareAppInvitation() {
    try {
      const shareOptions = {
        title: '分享佛法学修应用',
        message: '我正在使用这款佛法学修应用，每日坚持修行。欢迎加入我的修行之旅！\n\n下载地址: [应用下载链接]',
      };
      
      const result = await Share.open(shareOptions);
      return result;
    } catch (error) {
      console.error('分享应用邀请失败:', error);
      if (error.message === 'User did not share') {
        return { dismissed: true };
      }
      throw error;
    }
  }
  
  /**
   * 导出修行记录为CSV格式
   * 
   * @param {Array} records - 记录数组
   * @param {Array} practices - 修行项目数组
   * @returns {Promise} 导出操作的Promise
   */
  async exportRecordsToCSV(records, practices) {
    try {
      // 构建CSV内容
      let csvContent = 'Date,Practice,Count\n';
      
      // 按日期排序
      const sortedRecords = [...records].sort((a, b) => a.date.localeCompare(b.date));
      
      // 添加记录行
      sortedRecords.forEach(record => {
        const practice = practices.find(p => p.id === record.practiceId);
        const practiceName = practice ? practice.name : '未知项目';
        
        csvContent += `${record.date},${practiceName},${record.count}\n`;
      });
      
      // 创建临时文件
      const fileName = `buddhist_practice_records_${Date.now()}.csv`;
      const tempFilePath = `${FileSystem.CachesDirectoryPath}/${fileName}`;
      
      // 写入CSV数据
      await FileSystem.writeFile(tempFilePath, csvContent, 'utf8');
      
      // 分享文件
      const shareOptions = {
        title: '导出修行记录',
        message: '这是您的佛法学修记录数据',
        url: `file://${tempFilePath}`,
        type: 'text/csv',
      };
      
      const result = await Share.open(shareOptions);
      
      // 分享后删除临时文件
      await FileSystem.unlink(tempFilePath);
      
      return result;
    } catch (error) {
      console.error('导出记录失败:', error);
      if (error.message === 'User did not share') {
        return { dismissed: true };
      }
      throw error;
    }
  }
}

// 导出服务实例
export default new SharingService();