import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useEffect, useState } from 'react';

// 亮色主题
const lightTheme = {
  primary: '#b45309', // 琥珀色主色调
  secondary: '#f59e0b', // 浅琥珀色
  background: '#f8ebd9', // 奶油色背景
  card: '#ffffff', // 白色卡片
  text: '#44403c', // 深棕色文字
  textSecondary: '#78716c', // 次要文字颜色
  border: '#e7d5b9', // 边框颜色
  success: '#65a30d', // 成功色
  warning: '#d97706', // 警告色
  error: '#b91c1c', // 错误色
  highlight: '#fbbf24', // 高亮色
};

// 暗色主题
const darkTheme = {
  primary: '#f59e0b', // 亮琥珀色主色调
  secondary: '#b45309', // 深琥珀色
  background: '#292524', // 深棕色背景
  card: '#44403c', // 暗色卡片
  text: '#f8ebd9', // 淡色文字
  textSecondary: '#d6d3d1', // 次要文字颜色
  border: '#57534e', // 边框颜色
  success: '#84cc16', // 成功色
  warning: '#f59e0b', // 警告色
  error: '#ef4444', // 错误色
  highlight: '#fbbf24', // 高亮色
};

// 创建主题上下文
export const ThemeContext = createContext();

// 主题提供者组件
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [colors, setColors] = useState(lightTheme);

  // 初始化主题
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setTheme(savedTheme);
          setColors(savedTheme === 'dark' ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error('加载主题出错:', error);
      }
    };

    loadTheme();
  }, []);

  // 切换主题
  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
      setColors(newTheme === 'dark' ? darkTheme : lightTheme);
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('保存主题出错:', error);
    }
  };

  // 提供的上下文值
  const contextValue = {
    theme,
    colors,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
