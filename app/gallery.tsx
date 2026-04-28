import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useAppTheme } from './theme';
import BottomTabBar from './components/BottomTabBar';

export default function GalleryScreen() {
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>私密相册</Text>
          <Text style={styles.description}>加密存储您的私密照片和视频</Text>
        </View>

        <View style={styles.emptyState}>
          <Image
            source={{ uri: 'https://neeko-copilot.bytedance.net/api/text_to_image?prompt=private%20photo%20album%20icon%20with%20lock%20symbol%20minimalist%20design&image_size=square' }}
            style={styles.emptyImage}
          />
          <Text style={styles.emptyTitle}>暂无私密照片</Text>
          <Text style={styles.emptyDescription}>点击下方按钮添加您的私密照片</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => {}}>
            <Text style={styles.addButtonText}>添加照片</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityTip}>
          <Text style={styles.securityTipTitle}>🔒 安全提示</Text>
          <Text style={styles.securityTipContent}>您的照片将被加密存储，只有输入正确密码才能访问</Text>
        </View>
      </ScrollView>
      <BottomTabBar />
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    mainContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 30,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
    },
    description: {
      fontSize: 16,
      color: theme.secondaryText,
      lineHeight: 24,
    },
    emptyState: {
      alignItems: 'center',
      paddingHorizontal: 40,
      paddingVertical: 60,
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
    securityTip: {
      margin: 20,
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
    },
    securityTipTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    securityTipContent: {
      fontSize: 14,
      color: theme.secondaryText,
      lineHeight: 20,
    },
  });
