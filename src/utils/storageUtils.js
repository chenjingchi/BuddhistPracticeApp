import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 存储工具类
 * 提供AsyncStorage的封装方法，简化数据的存取操作
 */

/**
 * 保存数据到存储
 * 
 * @param {String} key - 键名
 * @param {any} value - 值，将自动转换为JSON字符串
 * @returns {Promise} 保存操作的Promise
 */
export const saveData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`保存数据失败[${key}]:`, error);
    return false;
  }
};

/**
 * 从存储获取数据
 * 
 * @param {String} key - 键名
 * @returns {Promise} 解析后的数据，如果不存在则返回null
 */
export const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`获取数据失败[${key}]:`, error);
    return null;
  }
};

/**
 * 从存储中删除数据
 * 
 * @param {String} key - 键名
 * @returns {Promise} 删除操作的Promise
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`删除数据失败[${key}]:`, error);
    return false;
  }
};

/**
 * 清除所有存储数据
 * 
 * @returns {Promise} 清除操作的Promise
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('清除所有数据失败:', error);
    return false;
  }
};

/**
 * 获取所有存储的键名
 * 
 * @returns {Promise} 键名数组
 */
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('获取所有键名失败:', error);
    return [];
  }
};

/**
 * 合并现有数据
 * 
 * @param {String} key - 键名
 * @param {any} value - 要合并的值
 * @returns {Promise} 合并操作的Promise
 */
export const mergeData = async (key, value) => {
  try {
    // 获取现有数据
    const existingData = await getData(key);
    
    // 如果数据不存在，直接保存
    if (existingData === null) {
      return await saveData(key, value);
    }
    
    // 如果现有数据是数组
    if (Array.isArray(existingData)) {
      if (Array.isArray(value)) {
        // 合并两个数组
        return await saveData(key, [...existingData, ...value]);
      } else {
        // 添加新项到数组
        return await saveData(key, [...existingData, value]);
      }
    }
    
    // 如果现有数据是对象
    if (typeof existingData === 'object' && typeof value === 'object') {
      // 合并对象
      return await saveData(key, { ...existingData, ...value });
    }
    
    // 其他情况直接覆盖
    return await saveData(key, value);
  } catch (error) {
    console.error(`合并数据失败[${key}]:`, error);
    return false;
  }
};

/**
 * 批量获取多个键的数据
 * 
 * @param {Array} keys - 键名数组
 * @returns {Promise} 包含键值对的对象
 */
export const multiGet = async (keys) => {
  try {
    const results = await AsyncStorage.multiGet(keys);
    
    return results.reduce((obj, [key, value]) => {
      obj[key] = value !== null ? JSON.parse(value) : null;
      return obj;
    }, {});
  } catch (error) {
    console.error('批量获取数据失败:', error);
    return {};
  }
};
