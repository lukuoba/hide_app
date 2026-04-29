import AsyncStorage from '@react-native-async-storage/async-storage';
import { ExpoAndroidAppList } from 'expo-android-app-list';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import BottomTabBar from './components/BottomTabBar';
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
  const [showRemoveMode, setShowRemoveMode] = useState(false);
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
      // 获取真实的安卓应用列表
      setIsLoading(true);
      try {
        const apps = await ExpoAndroidAppList.getAll();
        // 过滤出有名称和包名的应用
        const filteredApps = apps
          .filter(app => app.appName && app.packageName)
          .map(app => ({
            name: app.appName,
            packageName: app.packageName
          }));
        setAndroidApps(filteredApps);
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
      
      // iOS平台提示手动隐藏应用
      if (platform === 'ios') {
        Alert.alert('成功', `已添加应用: ${appName}\nScheme: ${formattedScheme}\n\niOS平台需要手动隐藏应用:\n1. 进入设置 -> 屏幕使用时间\n2. 点击内容和隐私访问限制\n3. 点击允许的应用\n4. 关闭要隐藏的应用\n\n注意：隐藏后应用不会在主屏幕显示，只能通过本应用打开`);
      } else if (platform === 'android') {
        Alert.alert('成功', `已添加应用: ${appName}\nScheme: ${formattedScheme}\n\n安卓平台需要手动隐藏应用:\n1. 进入设置 -> 应用\n2. 找到并点击该应用\n3. 点击"禁用"或"隐藏"选项\n\n注意：不同安卓版本操作可能有所不同`);
      } else {
        Alert.alert('成功', `已添加应用: ${appName}\nScheme: ${formattedScheme}`);
      }
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

  const handleRemoveApp = async (appId: string) => {
    try {
      // 从添加的应用列表中移除
      const updatedApps = addedApps.filter(app => app.id !== appId);
      setAddedApps(updatedApps);
      
      // 更新本地存储
      await AsyncStorage.setItem('added_apps', JSON.stringify(updatedApps));
      
      // 如果没有应用了，退出移除模式
      if (updatedApps.length === 0) {
        setShowRemoveMode(false);
      }
    } catch (error) {
      console.error('移除应用失败:', error);
      Alert.alert('错误', '移除应用失败，请重试');
    }
  };

  return (
    <TouchableWithoutFeedback onPress={() => {
      setShowSettings(false);
      setShowRemoveMode(false);
    }}>
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
                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={handleChangePassword}
                >
                  <Text style={styles.dropdownItemText}>修改密码</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.dropdownItem}
                  onPress={() => {
                    setShowRemoveMode(true);
                    setShowSettings(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>移除隐藏app</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>已添加应用</Text>
          </View>

          {/* App Grid */}
          <View style={styles.appGrid}>
            {/* Added Apps */}
            {addedApps.map((app) => (
              <TouchableOpacity 
                key={app.id} 
                style={styles.appItem}
                onPress={() => !showRemoveMode && handleAppPress(app.scheme)}
              >
                <View style={[styles.appIcon, { backgroundColor: app.color }]}>
                  <Text style={styles.appIconText}>📱</Text>
                  {showRemoveMode && (
                    <TouchableOpacity 
                      style={styles.removeButton}
                      onPress={() => handleRemoveApp(app.id)}
                    >
                      <Text style={styles.removeButtonText}>-</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.appName}>{app.name}</Text>
              </TouchableOpacity>
            ))}
            {/* Add New Button */}
            <TouchableOpacity style={styles.addButton} onPress={handleAddNew}>
              <View style={styles.addButtonIcon}>
                <Text style={styles.addButtonIconText}>+</Text>
              </View>
              <Text style={styles.addButtonText}>添加APP</Text>
            </TouchableOpacity>
          </View>

          {/* Security Tip Card */}
          {/* <View style={styles.securityCard}>
            <View style={styles.securityCardContent}>
              <Text style={styles.securityTipLabel}>联系客服</Text>
              <Text style={styles.securityTipTitle}>右侧学习视频</Text>
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
          </View> */}
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
                  <ScrollView 
                    style={[styles.modalContent, { width: '90%', maxHeight: '50%' }]}
                    keyboardShouldPersistTaps="handled"
                    contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
                  >
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
                      <ScrollView style={styles.appList} showsVerticalScrollIndicator={false}>
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
                  </ScrollView>
                </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
         <BottomTabBar />
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
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 15,
      position: 'relative',
      zIndex: 100,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButtonIcon: {
      fontSize: 24,
      color: theme.text,
      marginRight: 5,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    settingsButton: {
      padding: 8,
    },
    settingsIcon: {
      fontSize: 24,
    },
    settingsDropdown: {
      position: 'absolute',
      top: 70,
      right: 20,
      backgroundColor: theme.card,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      zIndex: 1000,
      minWidth: 200,
    },
    dropdownItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    dropdownItemText: {
      fontSize: 14,
      color: theme.text,
    },
    themeToggle: {
      width: 44,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.border,
      position: 'relative',
    },
    toggleTrack: {
      width: 44,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.border,
      position: 'relative',
    },
    toggleTrackActive: {
      backgroundColor: '#007AFF',
    },
    toggleThumb: {
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: '#fff',
      position: 'absolute',
      top: 2,
      left: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    toggleThumbActive: {
      left: 22,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
      zIndex: 1,
    },
    headerSection: {
      marginBottom: 30,
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
    appGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
      marginBottom: 30,
    },
    appItem: {
      width: 80,
      alignItems: 'center',
    },
    appIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
      position: 'relative',
    },
    appIconText: {
      fontSize: 28,
    },
    removeButton: {
      position: 'absolute',
      top: -8,
      right: -8,
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: 'rgba(255, 0, 0, 0.8)',
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    removeButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: 'bold',
      lineHeight: 16,
    },
    appName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.text,
      textAlign: 'center',
      // numberOfLines: 1,
    },
    addButton: {
      width: 80,
      alignItems: 'center',
    },
    addButtonIcon: {
      width: 64,
      height: 64,
      borderRadius: 16,
      backgroundColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    addButtonIconText: {
      fontSize: 32,
      color: theme.secondaryText,
    },
    addButtonText: {
      fontSize: 14,
      color: theme.secondaryText,
      textAlign: 'center',
    },
    securityCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    securityCardContent: {
      flex: 1,
    },
    securityTipLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: '#007AFF',
      marginBottom: 4,
    },
    securityTipTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 4,
    },
    securityTipDescription: {
      fontSize: 14,
      color: theme.secondaryText,
      lineHeight: 20,
    },
    securityCardImage: {
      marginLeft: 16,
    },
    securityImage: {
      width: 80,
      height: 80,
      borderRadius: 12,
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
      maxWidth: 400,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 20,
    },
    input: {
      backgroundColor: theme.background,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.text,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    modalButton: {
      flex: 1,
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginHorizontal: 4,
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
      backgroundColor: '#007AFF',
    },
    submitButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    appList: {
      maxHeight: 300,
      marginBottom: 12,
    },
    androidAppItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    androidAppName: {
      fontSize: 16,
      color: theme.text,
      marginBottom: 4,
    },
    androidAppPackage: {
      fontSize: 12,
      color: theme.secondaryText,
    },
    loadingText: {
      fontSize: 16,
      color: theme.secondaryText,
      textAlign: 'center',
      padding: 20,
    },
    noAppsText: {
      fontSize: 16,
      color: theme.secondaryText,
      textAlign: 'center',
      padding: 20,
    },
  });
