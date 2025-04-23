/**
 * 主题常量定义
 * 定义应用的颜色方案和其他样式常量
 */

// 亮色主题
export const lightTheme = {
  // 主要颜色
  primary: '#b45309', // 琥珀色主色调
  secondary: '#f59e0b', // 浅琥珀色
  background: '#f8ebd9', // 奶油色背景
  card: '#ffffff', // 白色卡片背景
  
  // 文本颜色
  text: '#44403c', // 深棕色文字
  textSecondary: '#78716c', // 次要文字颜色
  
  // 边框颜色
  border: '#e7d5b9', // 边框颜色
  
  // 状态颜色
  success: '#65a30d', // 成功色
  warning: '#d97706', // 警告色
  error: '#b91c1c', // 错误色
  highlight: '#fbbf24', // 高亮色
  
  // 透明度变体
  primaryTransparent: 'rgba(180, 83, 9, 0.1)',
  secondaryTransparent: 'rgba(245, 158, 11, 0.1)',
};

// 暗色主题
export const darkTheme = {
  // 主要颜色
  primary: '#f59e0b', // 亮琥珀色主色调
  secondary: '#b45309', // 深琥珀色
  background: '#292524', // 深棕色背景
  card: '#44403c', // 暗色卡片背景
  
  // 文本颜色
  text: '#f8ebd9', // 淡色文字
  textSecondary: '#d6d3d1', // 次要文字颜色
  
  // 边框颜色
  border: '#57534e', // 边框颜色
  
  // 状态颜色
  success: '#84cc16', // 成功色
  warning: '#f59e0b', // 警告色
  error: '#ef4444', // 错误色
  highlight: '#fbbf24', // 高亮色
  
  // 透明度变体
  primaryTransparent: 'rgba(245, 158, 11, 0.1)',
  secondaryTransparent: 'rgba(180, 83, 9, 0.1)',
};

// 字体大小
export const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// 间距
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// 圆角
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};

// 阴影
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
};

// 动画时间
export const animationDurations = {
  short: 150,
  medium: 300,
  long: 500,
};

// 通用样式
export const commonStyles = {
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    justifyContent: 'space-between',
  },
  card: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadows.md,
  },
};

// 导出默认主题
export default {
  light: lightTheme,
  dark: darkTheme,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  animationDurations,
  commonStyles,
};
