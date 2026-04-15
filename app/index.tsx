import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';

const SPECIAL_CODES = ['4624', '4624774', '46247742'];

export default function CalculatorScreen() {
  const router = useRouter();
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

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

    // Check if display matches any special code
    if (SPECIAL_CODES.includes(display)) {
      // Navigate to internal screen
      router.push('/internal');
      return;
    }

    if (previousValue !== null && operation) {
      const result = calculate(previousValue, currentValue, operation);
      setDisplay(String(result));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
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
      <View style={styles.displayContainer}>
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

        {/* Row 4 */}
        <View style={styles.row}>
          <Button label="1" onPress={() => handleNumberPress('1')} />
          <Button label="2" onPress={() => handleNumberPress('2')} />
          <Button label="3" onPress={() => handleNumberPress('3')} />
          <Button
            label="="
            onPress={handleEquals}
            style={styles.equalsButton}
            textStyle={styles.equalsText}
          />
        </View>

        {/* Row 5 */}
        <View style={styles.row}>
          <Button
            label="0"
            onPress={() => handleNumberPress('0')}
            style={styles.zeroButton}
          />
          <Button label="." onPress={handleDecimal} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-end',
    padding: 10,
  },
  displayContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'flex-end',
    justifyContent: 'center',
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  display: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333',
  },
  buttonsContainer: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  operationButton: {
    backgroundColor: '#FF9500',
  },
  operationText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  equalsButton: {
    backgroundColor: '#4CAF50',
  },
  equalsText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  zeroButton: {
    flex: 2,
  },
});
