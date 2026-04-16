import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useAppTheme } from './theme';

export default function InternalScreen() {
  const router = useRouter();
  const { themeName, theme, setThemeName } = useAppTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const styles = createStyles(theme);

  const apps = [
    { name: 'PHOTOS', icon: '📷', color: '#3B82F6' },
    { name: 'MESSAGES', icon: '💬', color: '#10B981' },
    { name: 'NOTES', icon: '📝', color: '#F97316' },
    { name: 'CONTACTS', icon: '👥', color: '#8B5CF6' },
    { name: 'BACKUP', icon: '☁️', color: '#64748B' },
  ];

  const handleChangePassword = () => {
    setShowPasswordModal(true);
    setShowSettings(false);
  };

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
      // 存储新密码到本地存储
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

  const toggleTheme = () => {
    setThemeName(themeName === 'light' ? 'dark' : 'light');
  };

  return (
    <TouchableWithoutFeedback onPress={() => setShowSettings(false)}>
      <View style={styles.container}>
        {/* Top Navigation */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.push('/')}
          >
            <Text style={styles.backButtonIcon}>←</Text>
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setShowSettings(!showSettings)}
            >
              <Text style={styles.settingsIcon}>⚙️</Text>
            </TouchableOpacity>
          </TouchableWithoutFeedback>
          
          {/* Settings Dropdown */}
          {showSettings && (
            <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
              <View style={styles.settingsDropdown}>
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.dropdownItemText}>修改密码</Text>
                </TouchableOpacity>
                <View style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>主题风格</Text>
                  <TouchableOpacity 
                    style={styles.themeToggle}
                    onPress={toggleTheme}
                  >
                    <View style={[styles.toggleTrack, themeName === 'dark' && styles.toggleTrackActive]}>
                      <View style={[styles.toggleThumb, themeName === 'dark' && styles.toggleThumbActive]} />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Secure Content</Text>
            <Text style={styles.description}>Encrypted storage for your private applications and media.</Text>
          </View>

          {/* App Grid */}
          <View style={styles.appGrid}>
            {apps.map((app, index) => (
              <TouchableOpacity key={index} style={styles.appItem}>
                <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                  <Text style={styles.appIconText}>{app.icon}</Text>
                </View>
                <Text style={styles.appName}>{app.name}</Text>
              </TouchableOpacity>
            ))}
            {/* Add New Button */}
            <TouchableOpacity style={styles.addButton}>
              <View style={styles.addButtonIcon}>
                <Text style={styles.addButtonIconText}>+</Text>
              </View>
              <Text style={styles.addButtonText}>ADD NEW</Text>
            </TouchableOpacity>
          </View>

          {/* Security Tip Card */}
          <View style={styles.securityCard}>
            <View style={styles.securityCardContent}>
              <Text style={styles.securityTipLabel}>SECURITY TIP</Text>
              <Text style={styles.securityTipTitle}>Keep your vault clean</Text>
              <Text style={styles.securityTipDescription}>
                Regularly review your hidden applications to ensure maximum privacy and free up encrypted storage space.
              </Text>
            </View>
            <View style={styles.securityCardImage}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQRqWqs2Vj_gH9yVuZnXLCJ4opLvTaO145yE_MbzMkSk8ixPSc3tVS2wEb8Gi5853sFSLbcDEMt1wDKpEhboNPCQefT9ERqcCVJcIhh001GcPRYtk-4PRvOZz8oKQoJ3ig4UC_0cAhf2Utzx9rbjcryle8uJvg6V6KLtmIoqY6RG7efBKwhzZPWT3NzO0g02eNpFg4fTZnP_5u9YJ6xCO295hqxFWIyFT-a1niyiQVATFBQ4bYxBCODZeZnqy9AG-5eF0licxSjTU' }} 
                style={styles.securityImage}
              />
            </View>
          </View>
        </View>

        {/* Password Change Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showPasswordModal}
          onRequestClose={handleCancelPassword}
        >
          <TouchableWithoutFeedback onPress={handleCancelPassword}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>修改密码</Text>
                  
                  <TextInput
                    style={styles.input}
                    placeholder="旧密码"
                    placeholderTextColor={theme.secondaryText}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    keyboardType="numeric"
                    maxLength={12}
                    secureTextEntry={true}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="新密码"
                    placeholderTextColor={theme.secondaryText}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    keyboardType="numeric"
                    maxLength={12}
                    secureTextEntry={true}
                  />
                  
                  <TextInput
                    style={styles.input}
                    placeholder="确认新密码"
                    placeholderTextColor={theme.secondaryText}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    keyboardType="numeric"
                    maxLength={12}
                    secureTextEntry={true}
                  />
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={handleCancelPassword}
                    >
                      <Text style={styles.cancelButtonText}>取消</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.submitButton]}
                      onPress={handleSubmitPassword}
                    >
                      <Text style={styles.submitButtonText}>确认</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingTop: Platform.OS === 'ios' ? 50 : 30,
      paddingBottom: 20,
      backgroundColor: theme.background,
      zIndex: 1001,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 8,
      borderRadius: 8,
    },
    backButtonIcon: {
      fontSize: 18,
      marginRight: 4,
      color: theme.secondaryText,
    },
    backButtonText: {
      fontSize: 14,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: theme.secondaryText,
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    settingsIcon: {
      fontSize: 20,
      color: theme.secondaryText,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    headerSection: {
      marginBottom: 48,
    },
    title: {
      fontSize: 36,
      fontWeight: '800',
      color: theme.text,
      marginBottom: 8,
      fontFamily: Platform.OS === 'ios' ? 'Manrope' : 'sans-serif',
    },
    description: {
      fontSize: 16,
      color: theme.secondaryText,
      fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    },
    appGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 64,
    },
    appItem: {
      width: '30%',
      alignItems: 'center',
      marginBottom: 24,
    },
    appIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    appIconText: {
      fontSize: 24,
    },
    appName: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: theme.secondaryText,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    },
    addButton: {
      width: '30%',
      alignItems: 'center',
      marginBottom: 24,
      padding: 16,
      borderRadius: 16,
      borderWidth: 2,
      borderStyle: 'dashed',
      borderColor: theme.border,
    },
    addButtonIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 12,
    },
    addButtonIconText: {
      fontSize: 24,
      color: theme.secondaryText,
    },
    addButtonText: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      color: theme.secondaryText,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    },
    securityCard: {
      flexDirection: 'row',
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 32,
      borderLeftWidth: 6,
      borderLeftColor: theme.accent,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    securityCardContent: {
      flex: 1,
      marginRight: 24,
    },
    securityTipLabel: {
      fontSize: 10,
      fontWeight: '900',
      textTransform: 'uppercase',
      letterSpacing: 2,
      color: theme.accent,
      backgroundColor: `${theme.accent}20`,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      marginBottom: 12,
      fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    },
    securityTipTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 8,
      fontFamily: Platform.OS === 'ios' ? 'Manrope' : 'sans-serif',
    },
    securityTipDescription: {
      fontSize: 14,
      color: theme.secondaryText,
      lineHeight: 20,
      fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    },
    securityCardImage: {
      width: 120,
      height: 80,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: theme.card,
    },
    securityImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    settingsDropdown: {
      position: 'absolute',
      top: 80,
      right: 24,
      backgroundColor: 'transparent',
      borderRadius: 12,
      padding: 8,
      minWidth: 160,
      zIndex: 1002,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        },
        android: {
          elevation: 12,
        },
      }),
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: theme.card,
    },
    dropdownItemText: {
      fontSize: 14,
      color: theme.text,
      fontFamily: Platform.OS === 'ios' ? 'Inter' : 'sans-serif',
    },
    themeToggle: {
      padding: 4,
    },
    toggleTrack: {
      width: 48,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.border,
      padding: 2,
    },
    toggleTrackActive: {
      backgroundColor: theme.accent,
    },
    toggleThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: theme.text,
    },
    toggleThumbActive: {
      backgroundColor: theme.accentText,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 24,
      width: '80%',
      maxWidth: 320,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.25,
          shadowRadius: 16,
        },
        android: {
          elevation: 8,
        },
      }),
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.text,
      marginBottom: 20,
      textAlign: 'center',
      fontFamily: Platform.OS === 'ios' ? 'Manrope' : 'sans-serif',
    },
    input: {
      backgroundColor: theme.background,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 12,
      fontSize: 16,
      color: theme.text,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    modalButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 6,
    },
    cancelButton: {
      backgroundColor: theme.border,
    },
    cancelButtonText: {
      color: theme.text,
      fontSize: 16,
      fontWeight: '600',
    },
    submitButton: {
      backgroundColor: theme.accent,
    },
    submitButtonText: {
      color: theme.accentText,
      fontSize: 16,
      fontWeight: '600',
    },
  });
