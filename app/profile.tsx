import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { useAppTheme } from './theme';
import BottomTabBar from './components/BottomTabBar';

export default function ProfileScreen() {
  const { themeName, theme, setThemeName } = useAppTheme();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const styles = createStyles(theme);

  const validatePassword = (password: string) => {
    const regex = /^\d{4,12}$/;
    return regex.test(password);
  };

  const handleSubmitPassword = async () => {
    if (!validatePassword(oldPassword)) {
      Alert.alert('错误', '旧密码必须为4-12位数字');
      return;
    }
    if (!validatePassword(newPassword)) {
      Alert.alert('错误', '新密码必须为4-12位数字');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('错误', '两次输入的新密码不一致');
      return;
    }
    try {
      await AsyncStorage.setItem('secure_password', newPassword);
      Alert.alert('成功', '成功更新密码！');
    } catch (error) {
      console.error('存储密码失败:', error);
      Alert.alert('错误', '密码修改失败，请重试');
      return;
    }
    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancelPassword = () => {
    setShowPasswordModal(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClearData = () => {
    Alert.alert(
      '确认清除',
      '确定要清除所有数据吗？这将删除所有添加的应用和密码设置。',
      [
        {
          text: '取消',
          style: 'cancel',
        },
        {
          text: '确认',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              Alert.alert('成功', '所有数据已清除');
            } catch (error) {
              console.error('清除数据失败:', error);
              Alert.alert('错误', '清除数据失败');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>我的</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>👤</Text>
          </View>
          <Text style={styles.profileName}>隐私保护助手</Text>
          <Text style={styles.profileSubtitle}>安全保护您的隐私</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>设置</Text>

          <TouchableOpacity 
            style={styles.sectionItem} 
            onPress={() => setThemeName(themeName === 'light' ? 'dark' : 'light')}
          >
            <Text style={styles.itemIcon}>🌙</Text>
            <Text style={styles.itemText}>主题切换</Text>
            <Text style={styles.itemValue}>{themeName === 'light' ? '浅色' : '深色'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sectionItem} onPress={() => setShowPasswordModal(true)}>
            <Text style={styles.itemIcon}>🔐</Text>
            <Text style={styles.itemText}>修改密码</Text>
            <Text style={styles.itemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关于</Text>
          
          <TouchableOpacity style={styles.sectionItem}>
            <Text style={styles.itemIcon}>ℹ️</Text>
            <Text style={styles.itemText}>关于我们</Text>
            <Text style={styles.itemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sectionItem}>
            <Text style={styles.itemIcon}>📄</Text>
            <Text style={styles.itemText}>隐私政策</Text>
            <Text style={styles.itemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.sectionItem}>
            <Text style={styles.itemIcon}>📱</Text>
            <Text style={styles.itemText}>版本信息</Text>
            <Text style={styles.itemValue}>v1.0.0</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.dangerItem} onPress={handleClearData}>
            <Text style={styles.dangerIcon}>🗑️</Text>
            <Text style={styles.dangerText}>清除所有数据</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>保护您的隐私，从这里开始</Text>
        </View>
      </ScrollView>
      <BottomTabBar />

      <Modal visible={showPasswordModal} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>修改密码</Text>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>旧密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入旧密码"
                secureTextEntry
                keyboardType="numeric"
                value={oldPassword}
                onChangeText={setOldPassword}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>新密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请输入新密码"
                secureTextEntry
                keyboardType="numeric"
                value={newPassword}
                onChangeText={setNewPassword}
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>确认密码</Text>
              <TextInput
                style={styles.input}
                placeholder="请再次输入新密码"
                secureTextEntry
                keyboardType="numeric"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancelPassword}>
                <Text style={styles.cancelButtonText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmitPassword}>
                <Text style={styles.submitButtonText}>确认修改</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    },
    profileCard: {
      marginHorizontal: 20,
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginBottom: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#007AFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 40,
    },
    profileName: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    profileSubtitle: {
      fontSize: 14,
      color: theme.secondaryText,
    },
    section: {
      marginHorizontal: 20,
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.secondaryText,
      marginBottom: 12,
    },
    sectionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    itemIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    itemText: {
      flex: 1,
      fontSize: 16,
      color: theme.text,
    },
    itemArrow: {
      fontSize: 20,
      color: theme.secondaryText,
    },
    itemValue: {
      fontSize: 14,
      color: '#007AFF',
      fontWeight: '500',
    },
    dangerItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    dangerIcon: {
      fontSize: 20,
      marginRight: 12,
    },
    dangerText: {
      flex: 1,
      fontSize: 16,
      color: '#FF3B30',
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 40,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 14,
      color: theme.secondaryText,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: theme.background,
    },
    modalHeader: {
      paddingHorizontal: 20,
      paddingTop: 60,
      paddingBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
    },
    modalContent: {
      padding: 20,
    },
    formGroup: {
      marginBottom: 20,
    },
    formLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 14,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 30,
    },
    cancelButton: {
      flex: 1,
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    cancelButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    submitButton: {
      flex: 1,
      backgroundColor: '#007AFF',
      borderRadius: 8,
      padding: 14,
      alignItems: 'center',
    },
    submitButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
    },
  });
