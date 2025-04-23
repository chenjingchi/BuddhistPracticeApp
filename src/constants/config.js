/**
 * 应用配置常量
 * 定义应用的各种配置参数
 */

// 应用信息
export const APP_INFO = {
  NAME: '佛法学修',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.buddhapractice.app',
};

// 存储键名
export const STORAGE_KEYS = {
  REMINDERS: 'reminders',
  CARDS: 'cards',
  PRACTICES: 'practices',
  RECORDS: 'records',
  TEACHINGS: 'teachings',
  IMAGES: 'images',
  SETTINGS: 'settings',
  FIRST_LAUNCH: 'first_launch',
  STREAK_DATA: 'streak_data',
  THEME: 'theme',
};

// 默认设置
export const DEFAULT_SETTINGS = {
  theme: 'light',
  language: 'zh-CN',
  dailyNotification: true,
  notificationTime: '08:00',
  soundEnabled: true,
  vibrationEnabled: true,
  autoBackup: false,
  backupFrequency: 'weekly', // daily, weekly, monthly
};

// 通知配置
export const NOTIFICATION_CONFIG = {
  CHANNEL_ID: 'buddhist-practice-reminders',
  CHANNEL_NAME: '佛法学修提醒',
  CHANNEL_DESC: '念诵和修行提醒',
  IMPORTANCE: 4, // 高重要性
  SOUND_NAME: 'temple_bell.mp3',
};

// 应用URL方案
export const URL_SCHEME = {
  PREFIX: 'buddhist-practice://',
  TYPES: {
    TEACHING: 'teaching',
    CARD: 'card',
    PRACTICE: 'practice',
    REMINDER: 'reminder',
  },
};

// 文件目录
export const DIRECTORIES = {
  IMAGES: 'images',
  THUMBNAILS: 'thumbnails',
  BACKUP: 'backup',
  TEMP: 'temp',
};

// 教言卡片配置
export const CARD_CONFIG = {
  DEFAULT_FONT_SIZE: 18,
  DEFAULT_TEXT_COLOR: '#ffffff',
  DEFAULT_TEXT_SHADOW: true,
  MAX_TEXT_LENGTH: 100,
};

// 念诵项目默认配置
export const PRACTICE_CONFIG = {
  DEFAULT_DAILY_TARGET: 21,
  DEFAULT_TOTAL_TARGET: 10000,
};

// 媒体查询断点
export const BREAKPOINTS = {
  SMALL: 375,
  MEDIUM: 768,
  LARGE: 1024,
};

// 动画配置
export const ANIMATION_CONFIG = {
  DURATION: 300,
  EASING: 'ease-in-out',
};

// API配置（如果将来实现社区功能）
export const API_CONFIG = {
  BASE_URL: 'https://api.buddhapractice.app',
  TIMEOUT: 10000, // 10秒
  RETRY_COUNT: 3,
};

// 缓存配置
export const CACHE_CONFIG = {
  IMAGE_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_CACHE_AGE: 7 * 24 * 60 * 60 * 1000, // 7天
};

// 错误代码
export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  STORAGE_ERROR: 'STORAGE_ERROR',
  FILE_ERROR: 'FILE_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
};

// 导出默认配置
export default {
  APP_INFO,
  STORAGE_KEYS,
  DEFAULT_SETTINGS,
  NOTIFICATION_CONFIG,
  URL_SCHEME,
  DIRECTORIES,
  CARD_CONFIG,
  PRACTICE_CONFIG,
  BREAKPOINTS,
  ANIMATION_CONFIG,
  API_CONFIG,
  CACHE_CONFIG,
  ERROR_CODES,
};
