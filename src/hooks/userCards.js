import { useCallback, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { AppContext } from '../contexts/AppContext';
import imageService from '../services/imageService';
import sharingService from '../services/sharing';
import { generateUniqueId } from '../utils/idUtils';

/**
 * 卡片钩子
 * 管理教言卡片的创建、管理和分享
 */
const useCards = () => {
  const { cards, images, addItem, updateItem, removeItem } = useContext(AppContext);
  const [isLoading, setIsLoading] = useState(false);
  
  // 创建卡片
  const createCard = useCallback(async (cardData) => {
    try {
      setIsLoading(true);
      
      const { text, imageId, fontSize, textColor, textShadow } = cardData;
      
      // 查找背景图片
      const backgroundImage = images.find(img => img.id === imageId);
      if (!backgroundImage) {
        throw new Error('背景图片不存在');
      }
      
      // 生成卡片图片
      const cardImageInfo = await imageService.createCardImage(
        text,
        backgroundImage.url,
        {
          fontSize: fontSize || 18,
          textColor: textColor || '#ffffff',
          textShadow: textShadow !== undefined ? textShadow : true,
        }
      );
      
      // 创建卡片对象
      const newCard = {
        id: generateUniqueId(),
        text,
        imageId,
        imageUri: cardImageInfo.imageUri,
        fontSize: fontSize || 18,
        textColor: textColor || '#ffffff',
        textShadow: textShadow !== undefined ? textShadow : true,
        createdAt: new Date().toISOString(),
      };
      
      // 添加到上下文
      addItem('cards', newCard);
      
      setIsLoading(false);
      return newCard;
    } catch (error) {
      setIsLoading(false);
      console.error('创建卡片失败:', error);
      Alert.alert('错误', '创建卡片失败，请重试');
      throw error;
    }
  }, [images, addItem]);
  
  // 更新卡片
  const updateCard = useCallback(async (id, updatedData) => {
    try {
      setIsLoading(true);
      
      // 查找现有卡片
      const existingCard = cards.find(c => c.id === id);
      if (!existingCard) {
        throw new Error('卡片不存在');
      }
      
      // 如果更改了文本或图片，需要重新生成卡片图片
      if (updatedData.text !== undefined || updatedData.imageId !== undefined) {
        // 获取最新数据
        const newText = updatedData.text !== undefined ? updatedData.text : existingCard.text;
        const newImageId = updatedData.imageId !== undefined ? updatedData.imageId : existingCard.imageId;
        
        // 查找背景图片
        const backgroundImage = images.find(img => img.id === newImageId);
        if (!backgroundImage) {
          throw new Error('背景图片不存在');
        }
        
        // 生成新的卡片图片
        const cardImageInfo = await imageService.createCardImage(
          newText,
          backgroundImage.url,
          {
            fontSize: updatedData.fontSize !== undefined ? updatedData.fontSize : existingCard.fontSize,
            textColor: updatedData.textColor !== undefined ? updatedData.textColor : existingCard.textColor,
            textShadow: updatedData.textShadow !== undefined ? updatedData.textShadow : existingCard.textShadow,
          }
        );
        
        // 删除旧图片
        await imageService.deleteImage({ url: existingCard.imageUri });
        
        // 更新图片URI
        updatedData.imageUri = cardImageInfo.imageUri;
      }
      
      // 更新卡片
      updatedData.updatedAt = new Date().toISOString();
      updateItem('cards', id, updatedData);
      
      setIsLoading(false);
      return { ...existingCard, ...updatedData };
    } catch (error) {
      setIsLoading(false);
      console.error('更新卡片失败:', error);
      Alert.alert('错误', '更新卡片失败，请重试');
      throw error;
    }
  }, [cards, images, updateItem]);
  
  // 删除卡片
  const deleteCard = useCallback(async (id) => {
    try {
      setIsLoading(true);
      
      // 查找现有卡片
      const existingCard = cards.find(c => c.id === id);
      if (!existingCard) {
        throw new Error('卡片不存在');
      }
      
      // 删除卡片图片
      await imageService.deleteImage({ url: existingCard.imageUri });
      
      // 删除卡片
      removeItem('cards', id);
      
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      console.error('删除卡片失败:', error);
      Alert.alert('错误', '删除卡片失败，请重试');
      throw error;
    }
  }, [cards, removeItem]);
  
  // 分享卡片
  const shareCard = useCallback(async (id) => {
    try {
      setIsLoading(true);
      
      // 查找现有卡片
      const existingCard = cards.find(c => c.id === id);
      if (!existingCard) {
        throw new Error('卡片不存在');
      }
      
      // 分享卡片
      const result = await sharingService.shareCard(existingCard);
      
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      console.error('分享卡片失败:', error);
      if (error.message !== 'User did not share') {
        Alert.alert('错误', '分享卡片失败，请重试');
      }
      throw error;
    }
  }, [cards]);
  
  // 设置壁纸
  const setAsWallpaper = useCallback(async (id) => {
    try {
      setIsLoading(true);
      
      // 查找现有卡片
      const existingCard = cards.find(c => c.id === id);
      if (!existingCard) {
        throw new Error('卡片不存在');
      }
      
      // 设置壁纸
      const result = await sharingService.setAsWallpaper(existingCard.imageUri);
      
      setIsLoading(false);
      return result;
    } catch (error) {
      setIsLoading(false);
      console.error('设置壁纸失败:', error);
      if (error.message !== 'User did not share') {
        Alert.alert('错误', '设置壁纸失败，请重试');
      }
      throw error;
    }
  }, [cards]);
  
  // 设置提醒背景
  const setAsReminderBackground = useCallback(async (cardId, reminderId) => {
    try {
      // TODO: 实现设置提醒背景的功能
      // 这需要与提醒系统集成
      return true;
    } catch (error) {
      console.error('设置提醒背景失败:', error);
      Alert.alert('错误', '设置提醒背景失败，请重试');
      throw error;
    }
  }, []);
  
  // 根据标签过滤卡片
  const filterCardsByTags = useCallback((tags) => {
    if (!tags || tags.length === 0) {
      return cards;
    }
    
    return cards.filter(card => {
      // 这里假设卡片中有tags字段
      if (!card.tags) return false;
      
      // 查找任一标签匹配
      return tags.some(tag => card.tags.includes(tag));
    });
  }, [cards]);
  
  // 根据文本搜索卡片
  const searchCards = useCallback((searchText) => {
    if (!searchText) {
      return cards;
    }
    
    const lowerSearchText = searchText.toLowerCase();
    
    return cards.filter(card => {
      return card.text.toLowerCase().includes(lowerSearchText);
    });
  }, [cards]);
  
  return {
    cards,
    isLoading,
    createCard,
    updateCard,
    deleteCard,
    shareCard,
    setAsWallpaper,
    setAsReminderBackground,
    filterCardsByTags,
    searchCards,
  };
};

export default useCards;
