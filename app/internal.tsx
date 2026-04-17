import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import appSchemes from './data/app-schemes.json';
import { useAppTheme } from './theme';

export default function InternalScreen() {
  const router = useRouter();
  const { themeName, theme, setThemeName } = useAppTheme();
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAddNewModal, setShowAddNewModal] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const platform = Platform.OS;
  const [appName, setAppName] = useState('');
  const [appScheme, setAppScheme] = useState('');
  const [androidApps, setAndroidApps] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [addedApps, setAddedApps] = useState<any[]>([]);
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const styles = createStyles(theme);

  useEffect(() => {
    // 存储平台信息到本地存储
    AsyncStorage.setItem('device_platform', Platform.OS);
    // 加载已添加的应用
    loadAddedApps();
  }, []);

  const loadAddedApps = async () => {
    try {
      const storedApps = await AsyncStorage.getItem('added_apps');
      if (storedApps) {
        setAddedApps(JSON.parse(storedApps));
      }
    } catch (error) {
      console.error('加载已添加应用失败:', error);
    }
  };

  // 初始化时不包含默认应用数据
  const apps: any[] = [];

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

  const handleAddNew = async () => {
    if (platform === 'android') {
      // 模拟获取安卓应用列表
      setIsLoading(true);
      try {
        // 这里应该使用实际的安卓API获取应用列表
        // 暂时模拟一些数据
        const mockApps = [
          { name: '微信', packageName: 'com.tencent.mm' },
          { name: '支付宝', packageName: 'com.eg.android.AlipayGphone' },
          { name: 'QQ', packageName: 'com.tencent.mobileqq' },
          { name: '淘宝', packageName: 'com.taobao.taobao' },
          { name: '抖音', packageName: 'com.ss.android.ugc.aweme' },
        ];
        setAndroidApps(mockApps);
      } catch (error) {
        console.error('获取应用列表失败:', error);
        Alert.alert('错误', '获取应用列表失败');
      } finally {
        setIsLoading(false);
      }
    }
    setShowAddNewModal(true);
  };

  const handleAppNameChange = async (text: string) => {
    setAppName(text);
    
    // 清除之前的定时器
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // 设置新的定时器，300ms后执行匹配
    debounceTimer.current = setTimeout(() => {
      if (text.length > 1) {
        try {
          // 在 appSchemes 中查找匹配的应用
          const matchingApp = appSchemes.apps.find(app => 
            app.name.toLowerCase().includes(text.toLowerCase())
          );
          if (matchingApp) {
            setAppScheme(matchingApp.scheme);
          } else {
            setAppScheme('');
          }
        } catch (error) {
          console.error('匹配应用失败:', error);
        }
      } else {
        setAppScheme('');
      }
    }, 300);
  };

  const handleAddApp = async () => {
    if (platform === 'ios' || platform === 'web') {
      if (!appName || !appScheme) {
        Alert.alert('错误', '请填写应用名称和 Scheme');
        return;
      }
    }
    
    // 验证并格式化 URL Scheme
    let formattedScheme = appScheme.trim();
    if (!formattedScheme.includes('://')) {
      formattedScheme = formattedScheme + '://';
    }
    
    // 创建新应用对象
    const newApp = {
      id: Date.now().toString(),
      name: appName.trim(),
      scheme: formattedScheme,
      color: `hsl(${Math.random() * 360}, 70%, 60%)` // 随机颜色
    };
    
    try {
      // 更新添加的应用列表
      const updatedApps = [...addedApps, newApp];
      setAddedApps(updatedApps);
      
      // 存储到本地存储
      await AsyncStorage.setItem('added_apps', JSON.stringify(updatedApps));
      
      Alert.alert('成功', `已添加应用: ${appName}\nScheme: ${formattedScheme}`);
    } catch (error) {
      console.error('存储应用失败:', error);
      Alert.alert('错误', '添加应用失败，请重试');
      return;
    }
    
    setShowAddNewModal(false);
    setAppName('');
    setAppScheme('');
    setAndroidApps([]);
  };

  const handleCancelAdd = () => {
    setShowAddNewModal(false);
    setAppName('');
    setAppScheme('');
    setAndroidApps([]);
  };

  const handleAppPress = async (scheme: string) => {
    try {
      // 先尝试直接打开，让 iOS 系统判断应用是否安装
      await Linking.openURL(scheme);
    } catch (error) {
      console.error('打开应用失败:', error);
      Alert.alert('错误', '无法打开应用，请确保应用已安装');
    }
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
            {/* Added Apps */}
            {addedApps.map((app) => (
              <TouchableOpacity 
                key={app.id} 
                style={styles.appItem}
                onPress={() => handleAppPress(app.scheme)}
              >
                <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                  <Text style={styles.appIconText}>📱</Text>
                </View>
                <Text style={styles.appName}>{app.name}</Text>
              </TouchableOpacity>
            ))}
            {/* Add New Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
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

        {/* Add New App Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showAddNewModal}
          onRequestClose={handleCancelAdd}
        >
          <TouchableWithoutFeedback onPress={handleCancelAdd}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
                <View style={[styles.modalContent, { width: '90%', maxHeight: '80%' }]}>
                  <Text style={styles.modalTitle}>
                    {platform === 'ios' || platform === 'web' ? '添加新应用' : '选择应用'}
                  </Text>
                  
                  {platform === 'ios' || platform === 'web' ? (
                    <View>
                      <TextInput
                        style={styles.input}
                        placeholder="应用名称"
                        placeholderTextColor={theme.secondaryText}
                        value={appName}
                        onChangeText={handleAppNameChange}
                      />
                      <TextInput
                        style={styles.input}
                        placeholder="App URL Scheme"
                        placeholderTextColor={theme.secondaryText}
                        value={appScheme}
                        onChangeText={setAppScheme}
                      />
                    </View>
                  ) : (
                    <ScrollView style={styles.appList}>
                      {isLoading ? (
                        <Text style={styles.loadingText}>加载中...</Text>
                      ) : androidApps.length > 0 ? (
                        androidApps.map((app, index) => (
                          <TouchableOpacity 
                            key={index} 
                            style={styles.androidAppItem}
                            onPress={() => {
                              setAppName(app.name);
                              setAppScheme(`${app.packageName}://`);
                            }}
                          >
                            <Text style={styles.androidAppName}>{app.name}</Text>
                            <Text style={styles.androidAppPackage}>{app.packageName}</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        <Text style={styles.noAppsText}>未找到应用</Text>
                      )}
                    </ScrollView>
                  )}
                  
                  <View style={styles.modalButtons}>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={handleCancelAdd}
                    >
                      <Text style={styles.cancelButtonText}>取消</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.submitButton]}
                      onPress={handleAddApp}
                    >
                      <Text style={styles.submitButtonText}>添加</Text>
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
    appList: {
      maxHeight: 300,
      marginBottom: 16,
    },
    androidAppItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    androidAppName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
    },
    androidAppPackage: {
      fontSize: 12,
      color: theme.secondaryText,
    },
    loadingText: {
      textAlign: 'center',
      padding: 20,
      color: theme.secondaryText,
    },
    noAppsText: {
      textAlign: 'center',
      padding: 20,
      color: theme.secondaryText,
    },
  });
