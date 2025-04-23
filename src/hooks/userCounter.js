import { useCallback, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { AppContext } from '../contexts/AppContext';
import { formatDate } from '../utils/dateUtils';
import { generateUniqueId } from '../utils/idUtils';

/**
 * 念诵计数钩子
 * 管理修行念诵项目和计数
 */
const useCounter = () => {
  const { practices, records, addItem, updateItem, removeItem, updateData } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  
  // 今日日期
  const today = formatDate(new Date());
  
  // 获取指定项目今日的记录
  const getTodayRecords = useCallback((practiceId) => {
    return records.filter(record => record.date === today && record.practiceId === practiceId);
  }, [records, today]);
  
  // 获取今日计数总和
  const getTodayCount = useCallback((practiceId) => {
    const todayRecords = getTodayRecords(practiceId);
    return todayRecords.reduce((sum, record) => sum + record.count, 0);
  }, [getTodayRecords]);
  
  // 添加修行项目
  const addPractice = useCallback(async (practiceData) => {
    try {
      setIsLoading(true);
      
      // 创建修行项目对象
      const newPractice = {
        id: generateUniqueId(),
        ...practiceData,
        completed: 0,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };
      
      // 添加到上下文
      addItem('practices', newPractice);
      
      setIsLoading(false);
      return newPractice;
    } catch (error) {
      setIsLoading(false);
      console.error('添加修行项目失败:', error);
      Alert.alert('错误', '添加修行项目失败，请重试');
      throw error;
    }
  }, [addItem]);
  
  // 更新修行项目
  const updatePractice = useCallback(async (id, updatedData) => {
    try {
      setIsLoading(true);
      
      // 查找现有项目
      const existingPractice = practices.find(p => p.id === id);
      if (!existingPractice) {
        throw new Error('修行项目不存在');
      }
      
      // 更新项目对象
      const updatedPractice = {
        ...existingPractice,
        ...updatedData,
        lastUpdated: new Date().toISOString(),
      };
      
      // 更新上下文
      updateItem('practices', id, updatedData);
      
      setIsLoading(false);
      return updatedPractice;
    } catch (error) {
      setIsLoading(false);
      console.error('更新修行项目失败:', error);
      Alert.alert('错误', '更新修行项目失败，请重试');
      throw error;
    }
  }, [practices, updateItem]);
  
  // 删除修行项目
  const deletePractice = useCallback(async (id) => {
    try {
      setIsLoading(true);
      
      // 删除项目
      removeItem('practices', id);
      
      // 找出相关记录并删除
      const relatedRecords = records.filter(record => record.practiceId === id);
      
      if (relatedRecords.length > 0) {
        // 过滤出需要保留的记录
        const updatedRecords = records.filter(record => record.practiceId !== id);
        updateData('records', updatedRecords);
      }
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      console.error('删除修行项目失败:', error);
      Alert.alert('错误', '删除修行项目失败，请重试');
      throw error;
    }
  }, [records, removeItem, updateData]);
  
  // 增加计数
  const incrementCount = useCallback(async (practiceId, count = 1) => {
    try {
      // 查找项目
      const practice = practices.find(p => p.id === practiceId);
      if (!practice) {
        throw new Error('修行项目不存在');
      }
      
      // 创建新记录
      const newRecord = {
        id: generateUniqueId(),
        practiceId,
        date: today,
        count,
        timestamp: new Date().toISOString(),
      };
      
      // 添加记录
      addItem('records', newRecord);
      
      // 更新项目完成数
      updateItem('practices', practiceId, {
        completed: practice.completed + count,
        lastUpdated: new Date().toISOString(),
      });
      
      return true;
    } catch (error) {
      console.error('增加计数失败:', error);
      Alert.alert('错误', '增加计数失败，请重试');
      throw error;
    }
  }, [practices, today, addItem, updateItem]);
  
  // 减少计数
  const decrementCount = useCallback(async (practiceId, count = 1) => {
    try {
      // 查找项目
      const practice = practices.find(p => p.id === practiceId);
      if (!practice) {
        throw new Error('修行项目不存在');
      }
      
      // 获取今日记录
      const todayRecords = getTodayRecords(practiceId);
      
      if (todayRecords.length === 0) {
        return false; // 没有记录可以减少
      }
      
      // 按时间排序，找到最新的记录
      todayRecords.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // 要减少的数量
      let remainingCount = count;
      
      // 从最新的记录开始减少
      for (const record of todayRecords) {
        if (remainingCount <= 0) break;
        
        if (record.count <= remainingCount) {
          // 删除整个记录
          removeItem('records', record.id);
          remainingCount -= record.count;
        } else {
          // 减少记录中的计数
          updateItem('records', record.id, {
            count: record.count - remainingCount,
          });
          remainingCount = 0;
        }
      }
      
      // 实际减少的数量
      const actualDecrement = count - remainingCount;
      
      // 更新项目完成数
      if (actualDecrement > 0) {
        updateItem('practices', practiceId, {
          completed: Math.max(0, practice.completed - actualDecrement),
          lastUpdated: new Date().toISOString(),
        });
      }
      
      return actualDecrement > 0;
    } catch (error) {
      console.error('减少计数失败:', error);
      Alert.alert('错误', '减少计数失败，请重试');
      throw error;
    }
  }, [practices, getTodayRecords, removeItem, updateItem]);
  
  // 完成今日目标
  const completeDaily = useCallback(async (practiceId) => {
    try {
      // 查找项目
      const practice = practices.find(p => p.id === practiceId);
      if (!practice) {
        throw new Error('修行项目不存在');
      }
      
      // 获取今日已完成数量
      const todayCount = getTodayCount(practiceId);
      
      // 计算需要添加的数量
      const remaining = practice.dailyTarget - todayCount;
      
      if (remaining <= 0) {
        return false; // 今日目标已完成
      }
      
      // 创建新记录
      const newRecord = {
        id: generateUniqueId(),
        practiceId,
        date: today,
        count: remaining,
        timestamp: new Date().toISOString(),
      };
      
      // 添加记录
      addItem('records', newRecord);
      
      // 更新项目完成数
      updateItem('practices', practiceId, {
        completed: practice.completed + remaining,
        lastUpdated: new Date().toISOString(),
      });
      
      return true;
    } catch (error) {
      console.error('完成今日目标失败:', error);
      Alert.alert('错误', '完成今日目标失败，请重试');
      throw error;
    }
  }, [practices, today, getTodayCount, addItem, updateItem]);
  
  // 获取修行进度数据
  const getProgressData = useCallback(() => {
    return practices.map(practice => {
      const todayCount = getTodayCount(practice.id);
      const progress = (practice.completed / practice.totalTarget) * 100;
      const dailyProgress = (todayCount / practice.dailyTarget) * 100;
      
      return {
        ...practice,
        todayCount,
        progress,
        dailyProgress,
      };
    });
  }, [practices, getTodayCount]);
  
  // 获取特定日期的计数数据
  const getDateRecords = useCallback((date) => {
    const dateRecords = records.filter(record => record.date === date);
    
    return practices.map(practice => {
      const practiceRecords = dateRecords.filter(record => record.practiceId === practice.id);
      const totalCount = practiceRecords.reduce((sum, record) => sum + record.count, 0);
      
      return {
        practice,
        records: practiceRecords,
        totalCount,
      };
    });
  }, [practices, records]);
  
  // 获取日期范围内的统计数据
  const getDateRangeStats = useCallback((startDate, endDate) => {
    // 过滤日期范围内的记录
    const rangeRecords = records.filter(record => {
      return record.date >= startDate && record.date <= endDate;
    });
    
    // 按日期分组
    const dateGroups = {};
    rangeRecords.forEach(record => {
      if (!dateGroups[record.date]) {
        dateGroups[record.date] = [];
      }
      dateGroups[record.date].push(record);
    });
    
    // 转换为数组并计算每日总计数
    const result = Object.keys(dateGroups).map(date => {
      const dailyRecords = dateGroups[date];
      const totalCount = dailyRecords.reduce((sum, record) => sum + record.count, 0);
      
      // 按项目分组
      const practiceGroups = {};
      dailyRecords.forEach(record => {
        if (!practiceGroups[record.practiceId]) {
          practiceGroups[record.practiceId] = 0;
        }
        practiceGroups[record.practiceId] += record.count;
      });
      
      return {
        date,
        totalCount,
        practiceGroups,
      };
    });
    
    // 按日期排序
    result.sort((a, b) => a.date.localeCompare(b.date));
    
    return result;
  }, [records]);
  
  return {
    practices,
    records,
    isLoading,
    addPractice,
    updatePractice,
    deletePractice,
    incrementCount,
    decrementCount,
    completeDaily,
    getTodayCount,
    getProgressData,
    getDateRecords,
    getDateRangeStats,
  };
};

export default useCounter;
