import * as storageUtils from '../utils/storageUtils';

/**
 * 数据存储服务
 * 管理应用数据的持久化存储
 */
class StorageService {
  // 存储键名常量
  static KEYS = {
    REMINDERS: 'reminders',
    CARDS: 'cards',
    PRACTICES: 'practices',
    RECORDS: 'records',
    TEACHINGS: 'teachings',
    IMAGES: 'images',
    SETTINGS: 'settings',
    FIRST_LAUNCH: 'first_launch',
    STREAK_DATA: 'streak_data',
  };

  /**
   * 保存提醒数据
   * 
   * @param {Array} reminders - 提醒数据数组
   * @returns {Promise} 保存操作的Promise
   */
  saveReminders(reminders) {
    return storageUtils.saveData(StorageService.KEYS.REMINDERS, reminders);
  }

  /**
   * 获取所有提醒
   * 
   * @returns {Promise} 提醒数据数组
   */
  getReminders() {
    return storageUtils.getData(StorageService.KEYS.REMINDERS);
  }

  /**
   * 保存卡片数据
   * 
   * @param {Array} cards - 卡片数据数组
   * @returns {Promise} 保存操作的Promise
   */
  saveCards(cards) {
    return storageUtils.saveData(StorageService.KEYS.CARDS, cards);
  }

  /**
   * 获取所有卡片
   * 
   * @returns {Promise} 卡片数据数组
   */
  getCards() {
    return storageUtils.getData(StorageService.KEYS.CARDS);
  }

  /**
   * 保存修行项目数据
   * 
   * @param {Array} practices - 修行项目数据数组
   * @returns {Promise} 保存操作的Promise
   */
  savePractices(practices) {
    return storageUtils.saveData(StorageService.KEYS.PRACTICES, practices);
  }

  /**
   * 获取所有修行项目
   * 
   * @returns {Promise} 修行项目数据数组
   */
  getPractices() {
    return storageUtils.getData(StorageService.KEYS.PRACTICES);
  }

  /**
   * 保存念诵记录数据
   * 
   * @param {Array} records - 念诵记录数据数组
   * @returns {Promise} 保存操作的Promise
   */
  saveRecords(records) {
    return storageUtils.saveData(StorageService.KEYS.RECORDS, records);
  }

  /**
   * 获取所有念诵记录
   * 
   * @returns {Promise} 念诵记录数据数组
   */
  getRecords() {
    return storageUtils.getData(StorageService.KEYS.RECORDS);
  }

  /**
   * 保存教言数据
   * 
   * @param {Array} teachings - 教言数据数组
   * @returns {Promise} 保存操作的Promise
   */
  saveTeachings(teachings) {
    return storageUtils.saveData(StorageService.KEYS.TEACHINGS, teachings);
  }

  /**
   * 获取所有教言
   * 
   * @returns {Promise} 教言数据数组
   */
  getTeachings() {
    return storageUtils.getData(StorageService.KEYS.TEACHINGS);
  }

  /**
   * 保存图片数据
   * 
   * @param {Array} images - 图片数据数组
   * @returns {Promise} 保存操作的Promise
   */
  saveImages(images) {
    return storageUtils.saveData(StorageService.KEYS.IMAGES, images);
  }

  /**
   * 获取所有图片
   * 
   * @returns {Promise} 图片数据数组
   */
  getImages() {
    return storageUtils.getData(StorageService.KEYS.IMAGES);
  }

  /**
   * 保存设置数据
   * 
   * @param {Object} settings - 设置数据对象
   * @returns {Promise} 保存操作的Promise
   */
  saveSettings(settings) {
    return storageUtils.saveData(StorageService.KEYS.SETTINGS, settings);
  }

  /**
   * 获取设置数据
   * 
   * @returns {Promise} 设置数据对象
   */
  getSettings() {
    return storageUtils.getData(StorageService.KEYS.SETTINGS);
  }

  /**
   * 更新设置数据
   * 
   * @param {Object} updatedSettings - 更新的设置数据
   * @returns {Promise} 更新操作的Promise
   */
  async updateSettings(updatedSettings) {
    const currentSettings = await this.getSettings() || {};
    const newSettings = { ...currentSettings, ...updatedSettings };
    return this.saveSettings(newSettings);
  }

  /**
   * 保存连续修行记录数据
   * 
   * @param {Object} streakData - 连续修行数据
   * @returns {Promise} 保存操作的Promise
   */
  saveStreakData(streakData) {
    return storageUtils.saveData(StorageService.KEYS.STREAK_DATA, streakData);
  }

  /**
   * 获取连续修行记录数据
   * 
   * @returns {Promise} 连续修行数据
   */
  getStreakData() {
    return storageUtils.getData(StorageService.KEYS.STREAK_DATA);
  }

  /**
   * 检查是否首次启动应用
   * 
   * @returns {Promise<boolean>} 是否首次启动
   */
  async isFirstLaunch() {
    const value = await storageUtils.getData(StorageService.KEYS.FIRST_LAUNCH);
    return value === null;
  }

  /**
   * 标记应用已首次启动
   * 
   * @returns {Promise} 保存操作的Promise
   */
  markFirstLaunchComplete() {
    return storageUtils.saveData(StorageService.KEYS.FIRST_LAUNCH, false);
  }

  /**
   * 获取所有数据
   * 
   * @returns {Promise<Object>} 包含所有数据的对象
   */
  async getAllData() {
    try {
      const keys = Object.values(StorageService.KEYS);
      return await storageUtils.multiGet(keys);
    } catch (error) {
      console.error('获取所有数据失败:', error);
      return {};
    }
  }

  /**
   * 导出备份数据
   * 
   * @returns {Promise<string>} JSON格式的备份数据
   */
  async exportBackup() {
    try {
      const allData = await this.getAllData();
      return JSON.stringify(allData);
    } catch (error) {
      console.error('导出备份失败:', error);
      throw error;
    }
  }

  /**
   * 导入备份数据
   * 
   * @param {string} backupJson - JSON格式的备份数据
   * @returns {Promise<boolean>} 导入结果
   */
  async importBackup(backupJson) {
    try {
      const backupData = JSON.parse(backupJson);
      
      // 验证备份数据包含必要的键
      const requiredKeys = [
        StorageService.KEYS.CARDS,
        StorageService.KEYS.PRACTICES,
        StorageService.KEYS.TEACHINGS
      ];
      
      const hasRequiredKeys = requiredKeys.every(key => 
        backupData.hasOwnProperty(key)
      );
      
      if (!hasRequiredKeys) {
        throw new Error('备份数据格式无效');
      }
      
      // 保存所有数据
      for (const [key, value] of Object.entries(backupData)) {
        await storageUtils.saveData(key, value);
      }
      
      return true;
    } catch (error) {
      console.error('导入备份失败:', error);
      throw error;
    }
  }
  
  /**
   * 清除所有数据
   * 
   * @returns {Promise<boolean>} 清除结果
   */
  async clearAllData() {
    try {
      await storageUtils.clearAllData();
      return true;
    } catch (error) {
      console.error('清除所有数据失败:', error);
      return false;
    }
  }
}

// 导出服务实例
export default new StorageService();