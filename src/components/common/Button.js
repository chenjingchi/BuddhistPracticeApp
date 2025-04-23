import React, { useContext } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * 通用按钮组件
 * 提供多种样式的按钮，支持自定义样式
 * 
 * @param {String} title - 按钮文字
 * @param {Function} onPress - 点击事件处理函数
 * @param {String} type - 按钮类型: 'primary', 'secondary', 'outline', 'text'
 * @param {Boolean} disabled - 是否禁用
 * @param {Boolean} loading - 是否显示加载中状态
 * @param {Object} style - 自定义样式
 * @param {Object} textStyle - 自定义文字样式
 */
const Button = ({
  title,
  onPress,
  type = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { colors } = useContext(ThemeContext);
  
  // 根据类型设置按钮样式
  const getButtonStyle = () => {
    switch (type) {
      case 'primary':
        return {
          backgroundColor: disabled ? colors.primary + '80' : colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: disabled ? colors.secondary + '80' : colors.secondary,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: disabled ? colors.primary + '80' : colors.primary,
        };
      case 'text':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
          paddingHorizontal: 0,
          paddingVertical: 4,
        };
      default:
        return {
          backgroundColor: disabled ? colors.primary + '80' : colors.primary,
          borderWidth: 0,
        };
    }
  };
  
  // 根据类型设置文本样式
  const getTextStyle = () => {
    switch (type) {
      case 'primary':
      case 'secondary':
        return { color: colors.background };
      case 'outline':
        return { color: disabled ? colors.primary + '80' : colors.primary };
      case 'text':
        return { color: disabled ? colors.primary + '80' : colors.primary };
      default:
        return { color: colors.background };
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={type === 'outline' || type === 'text' ? colors.primary : colors.background}
        />
      ) : (
        <Text style={[styles.text, getTextStyle(), textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Button;
