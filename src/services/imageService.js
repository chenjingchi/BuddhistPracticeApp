import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import * as FileSystem from 'react-native-fs';
import { generateUniqueId } from '../utils/idUtils';

/**
 * 图片处理服务
 * 提供图片相关的操作功能
 */
class ImageService {
  // 应用目录路径
  static APP_DIR = Platform.OS === 'android'
    ? `${FileSystem.DocumentDirectoryPath}/images`
    : `${FileSystem.DocumentDirectoryPath}/images`;
  
  // 缩略图目录路径
  static THUMBNAIL_DIR = `${ImageService.APP_DIR}/thumbnails`;
  
  /**
   * 初始化图片服务
   * 创建必要的目录
   * 
   * @returns {Promise} 初始化操作的Promise
   */
  async init() {
    try {
      // 检查并创建主图片目录
      const mainDirExists = await FileSystem.exists(ImageService.APP_DIR);
      if (!mainDirExists) {
        await FileSystem.mkdir(ImageService.APP_DIR);
      }
      
      // 检查并创建缩略图目录
      const thumbDirExists = await FileSystem.exists(ImageService.THUMBNAIL_DIR);
      if (!thumbDirExists) {
        await FileSystem.mkdir(ImageService.THUMBNAIL_DIR);
      }
      
      return true;
    } catch (error) {
      console.error('初始化图片服务失败:', error);
      return false;
    }
  }
  
  /**
   * 保存图片到应用目录
   * 
   * @param {String} uri - 图片URI
   * @returns {Promise} 包含保存图片信息的Promise
   */
  async saveImage(uri) {
    try {
      await this.init();
      
      // 生成唯一文件名
      const fileName = `image_${generateUniqueId()}.jpg`;
      const destPath = `${ImageService.APP_DIR}/${fileName}`;
      
      // 复制图片到应用目录
      await FileSystem.copyFile(uri, destPath);
      
      // 创建缩略图
      const thumbnailInfo = await this.createThumbnail(destPath);
      
      return {
        id: generateUniqueId(),
        url: `file://${destPath}`,
        thumbnail: `file://${thumbnailInfo.path}`,
        width: thumbnailInfo.width,
        height: thumbnailInfo.height,
        filename: fileName,
        thumbnailFilename: thumbnailInfo.filename,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('保存图片失败:', error);
      throw error;
    }
  }
  
  /**
   * 创建缩略图
   * 
   * @param {String} imagePath - 原图路径
   * @param {Object} options - 缩略图选项
   * @returns {Promise} 包含缩略图信息的Promise
   */
  async createThumbnail(imagePath, options = {}) {
    try {
      // 默认选项
      const defaultOptions = {
        width: 300,
        height: 300,
        quality: 0.7,
      };
      
      // 合并选项
      const { width, height, quality } = { ...defaultOptions, ...options };
      
      // 生成缩略图文件名
      const originalFilename = imagePath.split('/').pop();
      const thumbnailFilename = `thumb_${originalFilename}`;
      const thumbnailPath = `${ImageService.THUMBNAIL_DIR}/${thumbnailFilename}`;
      
      // 使用ImageManipulator调整图片大小
      const manipResult = await ImageManipulator.manipulateAsync(
        `file://${imagePath}`,
        [{ resize: { width, height } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      // 保存缩略图
      await FileSystem.copyFile(manipResult.uri, thumbnailPath);
      
      return {
        path: thumbnailPath,
        width: manipResult.width,
        height: manipResult.height,
        filename: thumbnailFilename,
      };
    } catch (error) {
      console.error('创建缩略图失败:', error);
      
      // 如果创建缩略图失败，则复制原图作为缩略图
      const originalFilename = imagePath.split('/').pop();
      const thumbnailFilename = `thumb_${originalFilename}`;
      const thumbnailPath = `${ImageService.THUMBNAIL_DIR}/${thumbnailFilename}`;
      
      await FileSystem.copyFile(imagePath, thumbnailPath);
      
      return {
        path: thumbnailPath,
        width: 0, // 未知宽度
        height: 0, // 未知高度
        filename: thumbnailFilename,
      };
    }
  }
  
  /**
   * 删除图片及其缩略图
   * 
   * @param {Object} imageInfo - 图片信息对象
   * @returns {Promise} 删除操作的Promise
   */
  async deleteImage(imageInfo) {
    try {
      // 如果是网络图片，不执行删除
      if (imageInfo.url.startsWith('http')) {
        return true;
      }
      
      // 删除原图
      const imagePath = imageInfo.url.replace('file://', '');
      if (await FileSystem.exists(imagePath)) {
        await FileSystem.unlink(imagePath);
      }
      
      // 删除缩略图
      const thumbnailPath = imageInfo.thumbnail.replace('file://', '');
      if (await FileSystem.exists(thumbnailPath)) {
        await FileSystem.unlink(thumbnailPath);
      }
      
      return true;
    } catch (error) {
      console.error('删除图片失败:', error);
      return false;
    }
  }
  
  /**
   * 创建卡片图片
   * 
   * @param {String} text - 卡片文本
   * @param {String} backgroundImageUri - 背景图片URI
   * @param {Object} options - 卡片选项
   * @returns {Promise} 包含卡片图片信息的Promise
   */
  async createCardImage(text, backgroundImageUri, options = {}) {
    try {
      await this.init();
      
      // 默认选项
      const defaultOptions = {
        fontSize: 18,
        textColor: '#ffffff',
        textShadow: true,
      };
      
      // 合并选项
      const cardOptions = { ...defaultOptions, ...options };
      
      // 生成卡片文件名
      const fileName = `card_${generateUniqueId()}.jpg`;
      const destPath = `${ImageService.APP_DIR}/${fileName}`;
      
      // 复制背景图片到应用目录
      await FileSystem.copyFile(backgroundImageUri, destPath);
      
      // 返回卡片信息
      return {
        id: generateUniqueId(),
        text,
        imageUri: `file://${destPath}`,
        ...cardOptions,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('创建卡片图片失败:', error);
      throw error;
    }
  }
  
  /**
   * 导出图片到相册
   * 
   * @param {String} imageUri - 图片URI
   * @returns {Promise} 导出操作的Promise
   */
  async exportToGallery(imageUri) {
    try {
      // 由于React Native FileSystem不直接支持保存到相册
      // 这里需要调用CameraRoll或其他插件的API
      // 此处为简化，仅复制文件到下载目录
      const fileName = imageUri.split('/').pop();
      const destPath = `${FileSystem.DownloadDirectoryPath}/${fileName}`;
      
      await FileSystem.copyFile(imageUri.replace('file://', ''), destPath);
      
      return {
        success: true,
        path: destPath,
      };
    } catch (error) {
      console.error('导出图片到相册失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
  
  /**
   * 读取图片目录
   * 获取应用中保存的所有图片信息
   * 
   * @returns {Promise} 包含图片信息数组的Promise
   */
  async readImageDirectory() {
    try {
      await this.init();
      
      // 读取目录下的所有文件
      const files = await FileSystem.readDir(ImageService.APP_DIR);
      
      // 过滤出图片文件
      const imageFiles = files.filter(file => {
        const extension = file.name.split('.').pop().toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif'].includes(extension);
      });
      
      // 构建图片信息数组
      const images = imageFiles.map(file => {
        // 查找对应的缩略图
        const thumbName = `thumb_${file.name}`;
        const thumbPath = `${ImageService.THUMBNAIL_DIR}/${thumbName}`;
        
        return {
          id: file.name.split('.')[0],
          url: `file://${file.path}`,
          thumbnail: `file://${thumbPath}`,
          filename: file.name,
          thumbnailFilename: thumbName,
          createdAt: file.mtime || new Date().toISOString(),
        };
      });
      
      return images;
    } catch (error) {
      console.error('读取图片目录失败:', error);
      return [];
    }
  }
  
  /**
   * 清理未使用的图片
   * 
   * @param {Array} usedImages - 使用中的图片信息数组
   * @returns {Promise} 清理操作的Promise
   */
  async cleanUnusedImages(usedImages) {
    try {
      await this.init();
      
      // 读取目录下的所有文件
      const files = await FileSystem.readDir(ImageService.APP_DIR);
      
      // 提取使用中的文件名
      const usedFilenames = usedImages.map(img => {
        const filename = img.url.split('/').pop();
        return filename;
      });
      
      // 找出未使用的文件
      const unusedFiles = files.filter(file => {
        return !usedFilenames.includes(file.name) && !file.name.startsWith('thumb_');
      });
      
      // 删除未使用的文件
      for (const file of unusedFiles) {
        await FileSystem.unlink(file.path);
        
        // 删除对应的缩略图
        const thumbName = `thumb_${file.name}`;
        const thumbPath = `${ImageService.THUMBNAIL_DIR}/${thumbName}`;
        
        if (await FileSystem.exists(thumbPath)) {
          await FileSystem.unlink(thumbPath);
        }
      }
      
      return {
        success: true,
        deletedCount: unusedFiles.length,
      };
    } catch (error) {
      console.error('清理未使用的图片失败:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

// 导出服务实例
export default new ImageService();
