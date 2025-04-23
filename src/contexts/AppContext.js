import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';
import { defaultImages, defaultTeachings } from '../assets/default-data';

// 创建应用上下文
export const AppContext = createContext();

// 初始状态
const initialState = {
  reminders: [],
  cards: [],
  practices: [],
  records: [],
  teachings: [],
  images: [],
  settings: {
    theme: 'light',
    language: 'zh-CN',
    dailyNotification: true,
    notificationTime: '08:00',
  }
};

// 应用状态提供者组件
export const AppProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  const [isLoading, setIsLoading] = useState(true);

  // 从存储加载数据
  useEffect(() => {
    const loadData = async () => {
      try {
        // 尝试从AsyncStorage加载所有数据
        const remindersData = await AsyncStorage.getItem('reminders');
        const cardsData = await AsyncStorage.getItem('cards');
        const practicesData = await AsyncStorage.getItem('practices');
        const recordsData = await AsyncStorage.getItem('records');
        const teachingsData = await AsyncStorage.getItem('teachings');
        const imagesData = await AsyncStorage.getItem('images');
        const settingsData = await AsyncStorage.getItem('settings');

        // 更新状态
        setState({
          reminders: remindersData ? JSON.parse(remindersData) : [],
          cards: cardsData ? JSON.parse(cardsData) : [],
          practices: practicesData ? JSON.parse(practicesData) : [],
          records: recordsData ? JSON.parse(recordsData) : [],
          teachings: teachingsData ? JSON.parse(teachingsData) : defaultTeachings,
          images: imagesData ? JSON.parse(imagesData) : defaultImages,
          settings: settingsData ? JSON.parse(settingsData) : initialState.settings,
        });
      } catch (error) {
        console.error('加载数据出错:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 保存数据到存储
  const saveData = async (key, data) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`保存${key}出错:`, error);
    }
  };

  // 更新单个数据集合
  const updateData = (key, newData) => {
    setState(prevState => {
      const updated = { ...prevState, [key]: newData };
      saveData(key, newData);
      return updated;
    });
  };

  // 添加项目到集合
  const addItem = (collection, item) => {
    setState(prevState => {
      const updated = [...prevState[collection], item];
      saveData(collection, updated);
      return { ...prevState, [collection]: updated };
    });
  };

  // 更新集合中的项目
  const updateItem = (collection, id, updates) => {
    setState(prevState => {
      const updated = prevState[collection].map(item => 
        item.id === id ? { ...item, ...updates } : item
      );
      saveData(collection, updated);
      return { ...prevState, [collection]: updated };
    });
  };

  // 从集合中删除项目
  const removeItem = (collection, id) => {
    setState(prevState => {
      const updated = prevState[collection].filter(item => item.id !== id);
      saveData(collection, updated);
      return { ...prevState, [collection]: updated };
    });
  };

  // 更新设置
  const updateSettings = (newSettings) => {
    setState(prevState => {
      const updated = { ...prevState.settings, ...newSettings };
      saveData('settings', updated);
      return { ...prevState, settings: updated };
    });
  };

  // 提供的上下文值
  const contextValue = {
    ...state,
    isLoading,
    updateData,
    addItem,
    updateItem,
    removeItem,
    updateSettings,
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
