import React, { useContext } from 'react';
import { Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../../contexts/ThemeContext';

/**
 * 图片选择器组件
 * 用于在创建教言卡片时选择背景图片
 * 
 * @param {Array} images - 可选图片数组
 * @param {String} selectedImageId - 当前选中图片ID
 * @param {Function} onSelect - 选中图片回调
 */
const ImageSelector = ({ images, selectedImageId, onSelect }) => {
  const { colors } = useContext(ThemeContext);
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {images.map(image => (
        <TouchableOpacity
          key={image.id}
          style={[
            styles.imageContainer,
            selectedImageId === image.id && { 
              borderColor: colors.primary,
              borderWidth: 2,
            }
          ]}
          onPress={() => onSelect(image.id)}
        >
          <Image
            source={{ uri: image.thumbnail }}
            style={styles.image}
          />
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  imageContainer: {
    width: 70,
    height: 70,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
});

export default ImageSelector;
