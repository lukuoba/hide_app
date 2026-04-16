import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemeValues, useAppTheme } from './theme';

const HISTORY_KEY = 'calculator_history';
const PASSWORD_KEY = 'secure_password';
// 默认密码
const DEFAULT_PASSWORD = '4624';

export default function CalculatorScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { theme } = useAppTheme();
  const styles = createStyles(theme);
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);

  useEffect(() => {
    loadHistory();
    loadPassword();
  }, []);

  const loadPassword = async () => {
    try {
      const savedPassword = await AsyncStorage.getItem(PASSWORD_KEY);
      if (savedPassword) {
        setPassword(savedPassword);
      }
    } catch (error) {
      console.warn('加载密码失败', error);
    }
  };

  const loadHistory = async () => {
    try {
      const saved = await AsyncStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (error) {
      console.warn('加载历史失败', error);
    }
  };

  const saveHistory = async (items: string[]) => {
    try {
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(items));
    } catch (error) {
      console.warn('保存历史失败', error);
    }
  };

  const addHistoryItem = async (item: string) => {
    setHistory(prev => {
      const next = [item, ...prev];
      saveHistory(next);
      return next;
    });
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      setHistory([]);
    } catch (error) {
      console.warn('清除历史失败', error);
    }
  };

  const handleNumberPress = (num: string) => {
    if (waitingForOperand) {
      setDisplay(String(num));
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? String(num) : display + num);
    }
  };

  const handleDecimal = () => {
    if (waitingForOperand) {
      setDisplay('0.');
      setWaitingForOperand(false);
    } else if (display.indexOf('.') === -1) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const currentValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(currentValue);
    } else if (operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(result);
    }

    setOperation(op);
    setWaitingForOperand(true);
  };

  const calculate = (prev: number, current: number, op: string): number => {
    switch (op) {
      case '+':
        return prev + current;
      case '-':
        return prev - current;
      case '*':
        return prev * current;
      case '/':
        return current !== 0 ? prev / current : 0;
      default:
        return current;
    }
  };

  const handleEquals = () => {
    const currentValue = parseFloat(display);

    // Check if display matches the password
    if (display === password) {
      // Navigate to internal screen
      router.push('/internal');
      return;
    }

    if (previousValue !== null && operation) {
      const result = calculate(previousValue, currentValue, operation);
      const expressionString = `${previousValue}${operation}${currentValue}=${result}`;
      setDisplay(String(result));
      setExpression(`${previousValue}${operation}${currentValue}`);
      addHistoryItem(expressionString);
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setExpression('');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(display.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const Button = ({ label, onPress, style, textStyle }: any) => (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.buttonText, textStyle]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={[styles.historyContainer, { marginTop: Math.max(insets.top, 12), maxHeight: Math.min(Math.max(windowHeight * 0.28, 120), 260) }]}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyTitle}>历史计算</Text>
          <TouchableOpacity style={styles.clearHistoryButton} onPress={clearHistory}>
            <Text style={styles.clearHistoryText}>清空列表</Text>
          </TouchableOpacity>
        </View>
        {history.length === 0 ? (
          <Text style={styles.noHistoryText}>暂无历史记录</Text>
        ) : (
          <ScrollView style={styles.historyList} nestedScrollEnabled>
            {history.map((item, index) => (
              <Text key={`${item}-${index}`} style={styles.historyItem}>
                {item}
              </Text>
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.displayContainer}>
        {expression ? <Text style={styles.expression}>{expression}</Text> : null}
        <Text style={styles.display}>{display}</Text>
      </View>

      <View style={styles.buttonsContainer}>
        {/* Row 1 */}
        <View style={styles.row}>
          <Button
            label="C"
            onPress={handleClear}
            style={styles.operationButton}
            textStyle={styles.operationText}
          />
          <Button
            label="⌫"
            onPress={handleDelete}
            style={styles.operationButton}
            textStyle={styles.operationText}
          />
          <Button
            label="/"
            onPress={() => handleOperation('/')}
            style={styles.operationButton}
            textStyle={styles.operationText}
          />
          <Button
            label="*"
            onPress={() => handleOperation('*')}
            style={styles.operationButton}
            textStyle={styles.operationText}
          />
        </View>

        {/* Row 2 */}
        <View style={styles.row}>
          <Button label="7" onPress={() => handleNumberPress('7')} />
          <Button label="8" onPress={() => handleNumberPress('8')} />
          <Button label="9" onPress={() => handleNumberPress('9')} />
          <Button
            label="-"
            onPress={() => handleOperation('-')}
            style={styles.operationButton}
            textStyle={styles.operationText}
          />
        </View>

        {/* Row 3 */}
        <View style={styles.row}>
          <Button label="4" onPress={() => handleNumberPress('4')} />
          <Button label="5" onPress={() => handleNumberPress('5')} />
          <Button label="6" onPress={() => handleNumberPress('6')} />
          <Button
            label="+"
            onPress={() => handleOperation('+')}
            style={styles.operationButton}
            textStyle={styles.operationText}
          />
        </View>

        {/* Row 4-5: Bottom layout with tall equals button */}
        <View style={styles.bottomLayout}>
          <View style={styles.leftButtonsGroup}>
            {/* Row 4 */}
            <View style={styles.row}>
              <Button label="1" onPress={() => handleNumberPress('1')} />
              <Button label="2" onPress={() => handleNumberPress('2')} />
              <Button label="3" onPress={() => handleNumberPress('3')} />
            </View>
            {/* Row 5 */}
            <View style={styles.row}>
              <Button
                label="0"
                onPress={() => handleNumberPress('0')}
                style={styles.zeroButton}
              />
              <Button label="." onPress={handleDecimal} style={styles.dotButton} />
            </View>
          </View>
          <Button
            label="="
            onPress={handleEquals}
            style={styles.equalsButton}
            textStyle={styles.equalsText}
          />
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: ThemeValues) =>
  StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
    justifyContent: 'flex-end',
    padding: 10,
  },
  displayContainer: {
    backgroundColor: theme.card,
    borderRadius: 18,
    padding: 24,
    marginBottom: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 6,
  },
  expression: {
    fontSize: 16,
    color: theme.secondaryText,
    textAlign: 'right',
    marginBottom: 8,
  },
  historyContainer: {
    backgroundColor: theme.historyCard,
    borderRadius: 18,
    padding: 16,
    marginTop: Math.max(12, 20),
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 4,
    maxHeight: '26%',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.historyTitle,
  },
  clearHistoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: theme.accent,
  },
  clearHistoryText: {
    color: theme.accentText,
    fontSize: 12,
    fontWeight: '700',
  },
  historyList: {
    maxHeight: 120,
  },
  historyItem: {
    fontSize: 15,
    color: theme.historyText,
    paddingVertical: 6,
  },
  noHistoryText: {
    color: theme.secondaryText,
    fontSize: 14,
  },
  display: {
    fontSize: 48,
    fontWeight: '800',
    color: theme.text,
  },
  buttonsContainer: {
    marginBottom: 20,
    flexDirection: 'column',
    gap: 10,
  },
  bottomLayout: {
    flexDirection: 'row',
    gap: 10,
  },
  leftButtonsGroup: {
    flex: 3.25,
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: 18,
    backgroundColor: theme.button,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.buttonText,
  },
  operationButton: {
    backgroundColor: theme.operator,
  },
  operationText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  equalsButton: {
    flex: 1,
    backgroundColor: theme.equal,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2, // 组件的阴影深度，值为2表示中等阴影效果
  },
  equalsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  zeroButton: {
    flex: 2.1,
  },
  dotButton: {
    flex: 1,
  },
  buttonPlaceholder: {
    flex: 1,
  },
});
