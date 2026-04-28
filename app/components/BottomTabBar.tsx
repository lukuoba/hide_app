import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAppTheme } from '../theme';

type TabType = 'gallery' | 'internal' | 'profile';

interface TabItem {
  id: TabType;
  label: string;
  icon: string;
}

const tabs: TabItem[] = [
  { id: 'gallery', label: '私密相册', icon: '📷' },
  { id: 'internal', label: '应用锁', icon: '🔒' },
  { id: 'profile', label: '我的', icon: '👤' },
];

export default function BottomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);

  const currentTab = pathname.includes('internal') ? 'internal' : 
                    pathname.includes('profile') ? 'profile' : 'gallery';

  const handleTabPress = (tabId: TabType) => {
    if (currentTab !== tabId) {
      router.push(`/${tabId}`);
    }
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tabItem, currentTab === tab.id && styles.activeTab]}
          onPress={() => handleTabPress(tab.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabIcon, currentTab === tab.id && styles.activeIcon]}>
            {tab.icon}
          </Text>
          <Text style={[styles.tabLabel, currentTab === tab.id && styles.activeLabel]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: theme.card,
      paddingVertical: 12,
      paddingBottom: 24,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    activeTab: {
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      marginHorizontal: 8,
      borderRadius: 12,
    },
    tabIcon: {
      fontSize: 24,
      marginBottom: 4,
      opacity: 0.6,
    },
    activeIcon: {
      opacity: 1,
    },
    tabLabel: {
      fontSize: 12,
      color: theme.secondaryText,
    },
    activeLabel: {
      color: '#007AFF',
      fontWeight: '600',
    },
  });
