import AsyncStorage from '@react-native-async-storage/async-storage';
import { ResizeMode, Video } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import BottomTabBar from './components/BottomTabBar';
import { useAppTheme } from './theme';

const MEDIA_KEY = 'gallery_media';
const MEDIA_DIR = FileSystem.documentDirectory + 'gallery/';

interface MediaItem {
  id: string;
  uri: string;
  name: string;
  type: 'image' | 'video';
  timestamp: number;
  duration?: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function GalleryScreen() {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showBackButton, setShowBackButton] = useState(false);
  const videoRef = useRef<Video>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    loadMediaItems();
    ensureMediaDirectory();
  }, []);

  useEffect(() => {
    if (selectedItem) {
      setShowBackButton(false);
      setIsPlaying(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: false });
      }, 100);
    }
  }, [selectedItem]);

  const ensureMediaDirectory = async () => {
    const dirInfo = await FileSystem.getInfoAsync(MEDIA_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
    }
  };

  const loadMediaItems = async () => {
    try {
      const storedMedia = await AsyncStorage.getItem(MEDIA_KEY);
      if (storedMedia) {
        setMediaItems(JSON.parse(storedMedia));
      }
    } catch (error) {
      console.error('加载媒体失败:', error);
    }
  };

  const saveMediaItems = async (newItems: MediaItem[]) => {
    try {
      await AsyncStorage.setItem(MEDIA_KEY, JSON.stringify(newItems));
      setMediaItems(newItems);
    } catch (error) {
      console.error('保存媒体失败:', error);
    }
  };

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const handleAddMedia = async () => {
    const hasPermission = await requestPermission();
    if (!hasPermission) {
      Alert.alert('权限不足', '需要相册权限才能选择照片和视频');
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets) {
        const newItems: MediaItem[] = [];
        let imageCount = 0;
        let videoCount = 0;
        
        for (const asset of result.assets) {
          const isVideo = asset.type === 'video';
          const extension = isVideo ? '.mp4' : '.jpg';
          const fileName = `${isVideo ? 'video' : 'photo'}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${extension}`;
          const destinationUri = MEDIA_DIR + fileName;
          
          await FileSystem.copyAsync({
            from: asset.uri,
            to: destinationUri,
          });

          const mediaItem: MediaItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            uri: destinationUri,
            name: fileName,
            type: isVideo ? 'video' : 'image',
            timestamp: Date.now(),
            duration: asset.duration ?? undefined,
          };
          newItems.push(mediaItem);
          
          if (isVideo) {
            videoCount++;
          } else {
            imageCount++;
          }
        }

        const updatedItems = [...mediaItems, ...newItems];
        await saveMediaItems(updatedItems);
        
        let message = '导入成功';
        if (imageCount > 0) message += `\n照片: ${imageCount} 张`;
        if (videoCount > 0) message += `\n视频: ${videoCount} 个`;
        Alert.alert('导入完成', message);
      }
    } catch (error) {
      console.error('导入媒体失败:', error);
      Alert.alert('导入失败', '媒体导入过程中出现错误');
    }
  };

  const handleDeleteItem = async (item: MediaItem) => {
    Alert.alert(
      '确认删除',
      `确定要删除这个${item.type === 'video' ? '视频' : '照片'}吗？删除后将无法恢复。`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              if (item.type === 'video' && videoRef.current) {
                await videoRef.current.pauseAsync();
                setIsPlaying(false);
              }
              
              await FileSystem.deleteAsync(item.uri, { idempotent: true });
              
              const updatedItems = mediaItems.filter(m => m.id !== item.id);
              await saveMediaItems(updatedItems);
              
              if (selectedItem?.id === item.id) {
                setSelectedItem(null);
                setIsPlaying(false);
              }
            } catch (error) {
              console.error('删除失败:', error);
              Alert.alert('删除失败', '删除过程中出现错误');
            }
          },
        },
      ]
    );
  };

  const handleClosePreview = () => {
    setSelectedItem(null);
    setIsPlaying(false);
    setShowBackButton(false);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderMediaItem = ({ item }: { item: MediaItem }) => (
    <TouchableOpacity 
      style={styles.mediaItem}
      onPress={() => {
        setSelectedItem(item);
        setIsPlaying(false);
      }}
      onLongPress={() => handleDeleteItem(item)}
    >
      {item.type === 'video' ? (
        <View style={styles.videoContainer}>
          <Video
            source={{ uri: item.uri }}
            style={styles.mediaImage}
            resizeMode={ResizeMode.COVER}
            shouldPlay={false}
            isLooping={false}
            isMuted={true}
          />
          <View style={styles.videoOverlay}>
            <Text style={styles.playIcon}>▶️</Text>
            {item.duration && (
              <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
            )}
          </View>
        </View>
      ) : (
        <Image source={{ uri: item.uri }} style={styles.mediaImage} />
      )}
    </TouchableOpacity>
  );

  const imageCount = mediaItems.filter(m => m.type === 'image').length;
  const videoCount = mediaItems.filter(m => m.type === 'video').length;

  return (
    <View style={styles.mainContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>私密相册</Text>
        <Text style={styles.description}>
          导入后即可查看您的私密照片和视频，即使在相册中删除，这里也可以查看
        </Text>
      </View>

      {mediaItems.length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={{ uri: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=private%20photo%20album%20icon%20with%20lock%20symbol%20minimalist%20design&image_size=square' }}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>暂无私密内容</Text>
          <Text style={styles.emptyDescription}>点击下方按钮添加您的私密照片和视频</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddMedia}>
            <Text style={styles.addButtonText}>添加照片/视频</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.mediaGridContainer}>
          <View style={styles.mediaGridHeader}>
            <View>
              <Text style={styles.mediaCount}>
                共 {mediaItems.length} 项内容
              </Text>
              <Text style={styles.mediaSubCount}>
                {imageCount > 0 && `${imageCount} 张照片 `}
                {videoCount > 0 && `${videoCount} 个视频`}
              </Text>
            </View>
            <TouchableOpacity style={styles.addButtonSmall} onPress={handleAddMedia}>
              <Text style={styles.addButtonSmallText}>+ 添加</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={mediaItems}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            contentContainerStyle={styles.mediaGrid}
            showsVerticalScrollIndicator={false}
          />
          <Text style={styles.tipText}>长按可删除</Text>
        </View>
      )}

      <BottomTabBar />

      {/* 全屏预览模态框 */}
      <Modal
        visible={selectedItem !== null}
        transparent={false}
        animationType="fade"
        statusBarTranslucent={true}
        onRequestClose={handleClosePreview}
      >
        <View style={styles.previewContainer}>
          {/* 顶部返回按钮 */}
          <View style={[styles.backButtonContainer, { opacity: showBackButton ? 1 : 0 }]}>
            <TouchableOpacity style={styles.backButton} onPress={handleClosePreview}>
              <Text style={styles.backButtonText}>← 返回</Text>
            </TouchableOpacity>
          </View>

          {/* 媒体内容 */}
          <TouchableOpacity
            style={styles.mediaContent}
            onPress={() => {
              if (selectedItem?.type === 'image') {
                handleClosePreview();
              } else {
                setShowBackButton(!showBackButton);
              }
            }}
            activeOpacity={1}
          >
            {selectedItem && (
              selectedItem.type === 'video' ? (
                <Video
                  ref={videoRef}
                  source={{ uri: selectedItem.uri }}
                  style={styles.fullscreenVideo}
                  resizeMode={ResizeMode.CONTAIN}
                  shouldPlay={isPlaying}
                  isLooping={true}
                  useNativeControls={true}
                  onPlaybackStatusUpdate={(status) => {
                    if (status.isLoaded && !status.isPlaying && (status.durationMillis ?? 0) > 0 && status.positionMillis === 0) {
                      setIsPlaying(true);
                    }
                  }}
                />
              ) : (
                <ScrollView
                  ref={scrollViewRef}
                  style={styles.zoomScrollView}
                  maximumZoomScale={3}
                  minimumZoomScale={1}
                  showsHorizontalScrollIndicator={false}
                  showsVerticalScrollIndicator={false}
                  bouncesZoom={true}
                  contentContainerStyle={styles.zoomContentContainer}
                >
                  <Image
                    source={{ uri: selectedItem.uri }}
                    style={styles.fullscreenImage}
                    resizeMode="contain"
                  />
                </ScrollView>
              )
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    description: {
      fontSize: 14,
      color: theme.secondaryText,
      lineHeight: 20,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 40,
    },
    emptyImage: {
      width: 120,
      height: 120,
      borderRadius: 20,
      marginBottom: 24,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    emptyDescription: {
      fontSize: 14,
      color: theme.secondaryText,
      textAlign: 'center',
      marginBottom: 24,
    },
    addButton: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 40,
      paddingVertical: 12,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    mediaGridContainer: {
      flex: 1,
      paddingHorizontal: 10,
    },
    mediaGridHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 10,
      paddingBottom: 10,
    },
    mediaCount: {
      fontSize: 14,
      color: theme.text,
      fontWeight: '600',
    },
    mediaSubCount: {
      fontSize: 12,
      color: theme.secondaryText,
      marginTop: 2,
    },
    addButtonSmall: {
      backgroundColor: '#007AFF',
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
    },
    addButtonSmallText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    mediaGrid: {
      paddingBottom: 100,
    },
    mediaItem: {
      flex: 1,
      aspectRatio: 1,
      margin: 4,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: theme.card,
    },
    mediaImage: {
      width: '100%',
      height: '100%',
    },
    videoContainer: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    videoOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    playIcon: {
      fontSize: 32,
    },
    durationText: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      color: '#fff',
      fontSize: 10,
      fontWeight: '600',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 2,
    },
    tipText: {
      textAlign: 'center',
      fontSize: 12,
      color: theme.secondaryText,
      marginBottom: 80,
    },
    previewContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    backButtonContainer: {
      position: 'absolute',
      top: 40,
      left: 16,
      zIndex: 100,
    },
    backButton: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    backButtonText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
    mediaContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullscreenImage: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
    zoomScrollView: {
      flex: 1,
    },
    zoomContentContainer: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullscreenVideo: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
  });
