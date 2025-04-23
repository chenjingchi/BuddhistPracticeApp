import * as ImagePicker from 'expo-image-picker';
import React, { useContext, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import * as FileSystem from 'react-native-fs';
import { AppContext } from '../contexts/AppContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { generateUniqueId } from '../utils/idUtils';

const LibraryScreen = ({ navigation }) => {
  const { teachings, images, addItem, updateItem, removeItem, updateData } = useContext(AppContext);
  const { colors } = useContext(ThemeContext);
  
  // 状态管理
  const [activeTab, setActiveTab] = useState('teachings'); // teachings, images
  const [activeSubTab, setActiveSubTab] = useState('my'); // my, community
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState(''); // 'addTeaching', 'addImage', 'imageDetail'
  const [selectedItem, setSelectedItem] = useState(null);
  
  // 教言输入
  const [teachingContent, setTeachingContent] = useState('');
  const [teachingSource, setTeachingSource] = useState('');
  const [teachingTags, setTeachingTags] = useState('');
  
  // 权限请求
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          '需要权限',
          '请授予访问照片的权限以便导入图片。'
        );
      }
    })();
  }, []);
  
  // 过滤显示项目
  const filteredTeachings = teachings.filter(item => {
    return activeSubTab === 'my' ? !item.isPublic : item.isPublic;
  });
  
  const filteredImages = images.filter(item => {
    return activeSubTab === 'my' ? !item.isPublic : item.isPublic;
  });
  
  // 打开添加教言模态框
  const openAddTeachingModal = () => {
    setTeachingContent('');
    setTeachingSource('');
    setTeachingTags('');
    setModalType('addTeaching');
    setModalVisible(true);
  };
  
  // 添加教言
  const addTeaching = () => {
    if (!teachingContent.trim()) {
      Alert.alert('提示', '请输入教言内容');
      return;
    }
    
    const newTeaching = {
      id: generateUniqueId(),
      content: teachingContent.trim(),
      source: teachingSource.trim() || '未知来源',
      tags: teachingTags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isPublic: false,
      isDefault: false,
    };
    
    addItem('teachings', newTeaching);
    setModalVisible(false);
    Alert.alert('成功', '教言已添加到我的收藏');
  };
  
  // 收藏教言
  const favoriteTeaching = (teaching) => {
    const favTeaching = {
      ...teaching,
      id: generateUniqueId(),
      isPublic: false,
    };
    
    addItem('teachings', favTeaching);
    Alert.alert('成功', '教言已添加到我的收藏');
  };
  
  // 分享教言
  const shareTeaching = (teaching) => {
    // 将教言设为公开
    updateItem('teachings', teaching.id, { isPublic: true });
    Alert.alert('成功', '教言已分享到社区');
  };
  
  // 删除教言
  const deleteTeaching = (id) => {
    Alert.alert(
      '确认删除',
      '确定要删除这条教言吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: () => {
            removeItem('teachings', id);
            Alert.alert('成功', '教言已删除');
          }
        }
      ]
    );
  };
  
  // 打开添加图片模态框
  const openAddImageModal = () => {
    setModalType('addImage');
    setModalVisible(true);
  };
  
  // 打开图片详情模态框
  const openImageDetailModal = (image) => {
    setSelectedItem(image);
    setModalType('imageDetail');
    setModalVisible(true);
  };
  
  // 从相册选择图片
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    
    if (!result.canceled) {
      try {
        // 保存图片到应用目录
        const fileName = `image_${Date.now()}.jpg`;
        const destPath = `${FileSystem.DocumentDirectoryPath}/${fileName}`;
        
        await FileSystem.copyFile(result.assets[0].uri, destPath);
        
        // 创建缩略图
        const thumbnailName = `thumb_${fileName}`;
        const thumbnailPath = `${FileSystem.DocumentDirectoryPath}/${thumbnailName}`;
        
        // 在实际应用中使用图像处理库创建缩略图
        // 这里简化为直接复制原图
        await FileSystem.copyFile(result.assets[0].uri, thumbnailPath);
        
        // 添加新图片到集合
        const newImage = {
          id: generateUniqueId(),
          url: `file://${destPath}`,
          thumbnail: `file://${thumbnailPath}`,
          tags: [],
          isPublic: false,
          isDefault: false,
        };
        
        addItem('images', newImage);
        Alert.alert('成功', '图片已添加');
        setModalVisible(false);
      } catch (error) {
        console.error('保存图片出错:', error);
        Alert.alert('错误', '添加图片失败，请重试');
      }
    }
  };
  
  // 分享图片
  const shareImage = (image) => {
    // 将图片设为公开
    updateItem('images', image.id, { isPublic: true });
    Alert.alert('成功', '图片已分享到社区');
  };
  
  // 删除图片
  const deleteImage = (image) => {
    Alert.alert(
      '确认删除',
      '确定要删除这张图片吗？',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '删除', 
          style: 'destructive',
          onPress: async () => {
            try {
              // 删除文件
              const fileUri = image.url.replace('file://', '');
              const thumbUri = image.thumbnail.replace('file://', '');
              
              if (!image.isDefault) {
                await FileSystem.unlink(fileUri);
                await FileSystem.unlink(thumbUri);
              }
              
              // 删除记录
              removeItem('images', image.id);
              
              // 关闭模态框
              if (modalVisible && selectedItem?.id === image.id) {
                setModalVisible(false);
              }
              
              Alert.alert('成功', '图片已删除');
            } catch (error) {
              console.error('删除图片出错:', error);
              Alert.alert('错误', '删除图片失败，请重试');
            }
          }
        }
      ]
    );
  };
  
  // 使用图片
  const useImage = (image) => {
    // 跳转到卡片创建界面并传递选中的图片
    navigation.navigate('Cards', { selectedImageId: image.id });
  };
  
  // 渲染教言标签页
  const renderTeachingsTab = () => (
    <View style={styles.tabContent}>
      {/* 子标签切换 */}
      <View style={[styles.subTabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={[
            styles.subTab, 
            activeSubTab === 'my' && { 
              backgroundColor: colors.primary,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
            }
          ]}
          onPress={() => setActiveSubTab('my')}
        >
          <Text style={[
            styles.subTabText, 
            { color: activeSubTab === 'my' ? colors.background : colors.text }
          ]}>
            我的收藏
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.subTab, 
            activeSubTab === 'community' && { 
              backgroundColor: colors.primary,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            }
          ]}
          onPress={() => setActiveSubTab('community')}
        >
          <Text style={[
            styles.subTabText, 
            { color: activeSubTab === 'community' ? colors.background : colors.text }
          ]}>
            社区分享
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* 添加和导入按钮 */}
      {activeSubTab === 'my' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={openAddTeachingModal}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              + 添加教言
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.importButton, { backgroundColor: colors.secondary }]}
            onPress={() => {
              // 导入教言
              Alert.alert('提示', '功能开发中');
            }}
          >
            <Text style={[styles.buttonText, { color: colors.background }]}>
              导入
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* 教言列表 */}
      <ScrollView style={styles.listContainer}>
        {filteredTeachings.length > 0 ? (
          filteredTeachings.map(teaching => (
            <View 
              key={teaching.id} 
              style={[styles.teachingItem, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.teachingContent, { color: colors.text }]}>
                {teaching.content}
              </Text>
              
              <View style={styles.teachingFooter}>
                <Text style={[styles.teachingSource, { color: colors.textSecondary }]}>
                  —— {teaching.source}
                </Text>
                
                <View style={styles.teachingActions}>
                  {activeSubTab === 'my' ? (
                    <>
                      <TouchableOpacity 
                        style={[styles.actionButton, { borderColor: colors.primary }]}
                        onPress={() => {
                          // 使用教言创建卡片
                          navigation.navigate('Cards', { initialQuote: teaching.content });
                        }}
                      >
                        <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                          使用
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, { borderColor: colors.secondary }]}
                        onPress={() => shareTeaching(teaching)}
                      >
                        <Text style={[styles.actionButtonText, { color: colors.secondary }]}>
                          分享
                        </Text>
                      </TouchableOpacity>
                      
                      <TouchableOpacity 
                        style={[styles.actionButton, { borderColor: colors.error }]}
                        onPress={() => deleteTeaching(teaching.id)}
                      >
                        <Text style={[styles.actionButtonText, { color: colors.error }]}>
                          删除
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.actionButton, { borderColor: colors.primary }]}
                      onPress={() => favoriteTeaching(teaching)}
                    >
                      <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                        收藏
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))
        ) : (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {activeSubTab === 'my' 
                ? '您还没有收藏教言，点击"添加教言"按钮添加'
                : '暂无社区分享的教言'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
  
  // 渲染图片标签页
  const renderImagesTab = () => (
    <View style={styles.tabContent}>
      {/* 子标签切换 */}
      <View style={[styles.subTabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={[
            styles.subTab, 
            activeSubTab === 'my' && { 
              backgroundColor: colors.primary,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
            }
          ]}
          onPress={() => setActiveSubTab('my')}
        >
          <Text style={[
            styles.subTabText, 
            { color: activeSubTab === 'my' ? colors.background : colors.text }
          ]}>
            我的图片
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.subTab, 
            activeSubTab === 'community' && { 
              backgroundColor: colors.primary,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            }
          ]}
          onPress={() => setActiveSubTab('community')}
        >
          <Text style={[
            styles.subTabText, 
            { color: activeSubTab === 'community' ? colors.background : colors.text }
          ]}>
            社区分享
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* 添加按钮 */}
      {activeSubTab === 'my' && (
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={openAddImageModal}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            + 添加图片
          </Text>
        </TouchableOpacity>
      )}
      
      {/* 图片网格 */}
      <FlatList
        data={filteredImages}
        numColumns={3}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.imagesGrid}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.imageItem}
            onPress={() => openImageDetailModal(item)}
          >
            <Image 
              source={{ uri: item.thumbnail }}
              style={styles.thumbnail}
            />
          </TouchableOpacity>
        )}
        ListEmptyComponent={() => (
          <View style={[styles.emptyState, { borderColor: colors.border }]}>
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              {activeSubTab === 'my' 
                ? '您还没有添加图片，点击"添加图片"按钮添加'
                : '暂无社区分享的图片'
              }
            </Text>
          </View>
        )}
      />
    </View>
  );
  
  // 渲染添加教言模态框
  const renderAddTeachingModal = () => (
    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
      <Text style={[styles.modalTitle, { color: colors.text }]}>添加教言</Text>
      
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>教言内容</Text>
        <TextInput 
          style={[
            styles.textInput, 
            styles.textAreaInput,
            { 
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.background 
            }
          ]}
          multiline
          value={teachingContent}
          onChangeText={setTeachingContent}
          placeholder="输入教言内容..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>来源</Text>
        <TextInput 
          style={[
            styles.textInput, 
            { 
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.background 
            }
          ]}
          value={teachingSource}
          onChangeText={setTeachingSource}
          placeholder="如：佛经名称、大德名号等"
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.text }]}>标签</Text>
        <TextInput 
          style={[
            styles.textInput, 
            { 
              borderColor: colors.border,
              color: colors.text,
              backgroundColor: colors.background 
            }
          ]}
          value={teachingTags}
          onChangeText={setTeachingTags}
          placeholder="用逗号分隔，如：修行,智慧"
          placeholderTextColor={colors.textSecondary}
        />
      </View>
      
      <View style={styles.modalButtons}>
        <TouchableOpacity 
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={() => setModalVisible(false)}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>取消</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={addTeaching}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>保存</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // 渲染添加图片模态框
  const renderAddImageModal = () => (
    <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
      <Text style={[styles.modalTitle, { color: colors.text }]}>添加图片</Text>
      
      <Text style={[styles.modalText, { color: colors.textSecondary }]}>
        请选择一种方式添加图片：
      </Text>
      
      <View style={styles.modalButtons}>
        <TouchableOpacity 
          style={[styles.imageOptionButton, { backgroundColor: colors.primary }]}
          onPress={pickImage}
        >
          <Text style={[styles.buttonText, { color: colors.background }]}>
            从相册选择
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[styles.cancelModalButton, { borderColor: colors.border }]}
        onPress={() => setModalVisible(false)}
      >
        <Text style={[styles.buttonText, { color: colors.text }]}>取消</Text>
      </TouchableOpacity>
    </View>
  );
  
  // 渲染图片详情模态框
  const renderImageDetailModal = () => {
    if (!selectedItem) return null;
    
    return (
      <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
        <Image 
          source={{ uri: selectedItem.url }}
          style={styles.detailImage}
          resizeMode="cover"
        />
        
        <View style={styles.imageDetailActions}>
          {activeSubTab === 'my' ? (
            <>
              <TouchableOpacity 
                style={[styles.detailActionButton, { backgroundColor: colors.primary }]}
                onPress={() => {
                  setModalVisible(false);
                  useImage(selectedItem);
                }}
              >
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  用于卡片
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.detailActionButton, { backgroundColor: colors.secondary }]}
                onPress={() => {
                  shareImage(selectedItem);
                  setModalVisible(false);
                }}
              >
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  分享到社区
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.detailActionButton, { backgroundColor: colors.error }]}
                onPress={() => {
                  deleteImage(selectedItem);
                }}
              >
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  删除图片
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity 
              style={[styles.detailActionButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                // 收藏社区图片
                const newImage = {
                  ...selectedItem,
                  id: generateUniqueId(),
                  isPublic: false,
                };
                
                addItem('images', newImage);
                setModalVisible(false);
                Alert.alert('成功', '图片已添加到我的收藏');
              }}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                收藏图片
              </Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={() => setModalVisible(false)}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>关闭</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
  
  // 渲染对应的模态框内容
  const renderModalContent = () => {
    switch (modalType) {
      case 'addTeaching':
        return renderAddTeachingModal();
      case 'addImage':
        return renderAddImageModal();
      case 'imageDetail':
        return renderImageDetailModal();
      default:
        return null;
    }
  };
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* 主标签切换 */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'teachings' && { 
              backgroundColor: colors.primary,
              borderTopLeftRadius: 8,
              borderBottomLeftRadius: 8,
            }
          ]}
          onPress={() => setActiveTab('teachings')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'teachings' ? colors.background : colors.text }
          ]}>
            教言库
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'images' && { 
              backgroundColor: colors.primary,
              borderTopRightRadius: 8,
              borderBottomRightRadius: 8,
            }
          ]}
          onPress={() => setActiveTab('images')}
        >
          <Text style={[
            styles.tabText, 
            { color: activeTab === 'images' ? colors.background : colors.text }
          ]}>
            图片库
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* 标签内容 */}
      {activeTab === 'teachings' ? renderTeachingsTab() : renderImagesTab()}
      
      {/* 模态框 */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          {renderModalContent()}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 16,
    marginBottom: 0,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontWeight: 'bold',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  subTabContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 16,
  },
  subTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  subTabText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  addButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  importButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  buttonText: {
    fontWeight: 'bold',
  },
  listContainer: {
    flex: 1,
  },
  teachingItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  teachingContent: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  teachingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teachingSource: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  teachingActions: {
    flexDirection: 'row',
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    marginLeft: 8,
  },
  actionButtonText: {
    fontSize: 12,
  },
  imagesGrid: {
    paddingVertical: 8,
  },
  imageItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  emptyState: {
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  emptyStateText: {
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 16,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  textAreaInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 8,
  },
  imageOptionButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 12,
  },
  detailImage: {
    width: '100%',
    height: 240,
    borderRadius: 8,
    marginBottom: 16,
  },
  imageDetailActions: {
    width: '100%',
  },
  detailActionButton: {
    width: '100%',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
});

export default LibraryScreen;