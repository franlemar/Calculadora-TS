import { describe, it, expect } from 'vitest';
import { CalculatorEngine } from '../core/CalculatorEngine';
import { executeBinaryOperation, executeUnaryOperation, calculateFactorial } from '../core/mathOperations';

describe('Batería de Pruebas Total: Todas las Operaciones de la Calculadora', () => {

  describe('1. Operaciones Trigonométricas e Hiperbólicas', () => {
    it('Seno en ángulos notables y múltiplos en DEG y RAD', () => {
      expect(executeUnaryOperation(0, 'sin', 'deg')).toBe(0);
      expect(executeUnaryOperation(90, 'sin', 'deg')).toBe(1);
      expect(executeUnaryOperation(180, 'sin', 'deg')).toBe(0);
      expect(executeUnaryOperation(270, 'sin', 'deg')).toBe(-1);
      expect(executeUnaryOperation(360, 'sin', 'deg')).toBe(0);
      expect(executeUnaryOperation(-180, 'sin', 'deg')).toBe(0);

      expect(executeUnaryOperation(0, 'sin', 'rad')).toBe(0);
      expect(executeUnaryOperation(Math.PI / 2, 'sin', 'rad')).toBe(1);
      expect(executeUnaryOperation(Math.PI, 'sin', 'rad')).toBe(0);
      expect(executeUnaryOperation(2 * Math.PI, 'sin', 'rad')).toBe(0);
    });

    it('Coseno en ángulos notables y múltiplos en DEG y RAD', () => {
      expect(executeUnaryOperation(0, 'cos', 'deg')).toBe(1);
      expect(executeUnaryOperation(90, 'cos', 'deg')).toBe(0);
      expect(executeUnaryOperation(180, 'cos', 'deg')).toBe(-1);
      expect(executeUnaryOperation(270, 'cos', 'deg')).toBe(0);
      expect(executeUnaryOperation(360, 'cos', 'deg')).toBe(1);
      expect(executeUnaryOperation(-90, 'cos', 'deg')).toBe(0);

      expect(executeUnaryOperation(0, 'cos', 'rad')).toBe(1);
      expect(executeUnaryOperation(Math.PI / 2, 'cos', 'rad')).toBe(0);
      expect(executeUnaryOperation(Math.PI, 'cos', 'rad')).toBe(-1);
      expect(executeUnaryOperation(3 * Math.PI / 2, 'cos', 'rad')).toBe(0);
    });

    it('Tangente en ángulos válidos y asíntotas de error en DEG y RAD', () => {
      expect(executeUnaryOperation(0, 'tan', 'deg')).toBe(0);
      expect(executeUnaryOperation(45, 'tan', 'deg')).toBe(1);
      expect(executeUnaryOperation(180, 'tan', 'deg')).toBe(0);
      expect(() => executeUnaryOperation(90, 'tan', 'deg')).toThrow('Error');
      expect(() => executeUnaryOperation(270, 'tan', 'deg')).toThrow('Error');
      expect(() => executeUnaryOperation(-90, 'tan', 'deg')).toThrow('Error');

      expect(executeUnaryOperation(0, 'tan', 'rad')).toBe(0);
      expect(executeUnaryOperation(Math.PI / 4, 'tan', 'rad')).toBe(1);
      expect(executeUnaryOperation(Math.PI, 'tan', 'rad')).toBe(0);
      expect(() => executeUnaryOperation(Math.PI / 2, 'tan', 'rad')).toThrow('Error');
      expect(() => executeUnaryOperation(3 * Math.PI / 2, 'tan', 'rad')).toThrow('Error');
    });

    it('Trigonometría inversa (asin, acos, atan)', () => {
      expect(executeUnaryOperation(0, 'asin', 'deg')).toBe(0);
      expect(executeUnaryOperation(1, 'asin', 'deg')).toBe(90);
      expect(executeUnaryOperation(-1, 'asin', 'deg')).toBe(-90);
      expect(() => executeUnaryOperation(1.001, 'asin', 'deg')).toThrow('Error');
      expect(() => executeUnaryOperation(-1.001, 'asin', 'deg')).toThrow('Error');

      expect(executeUnaryOperation(1, 'acos', 'deg')).toBe(0);
      expect(executeUnaryOperation(0, 'acos', 'deg')).toBe(90);
      expect(executeUnaryOperation(-1, 'acos', 'deg')).toBe(180);
      expect(() => executeUnaryOperation(1.001, 'acos', 'deg')).toThrow('Error');

      expect(executeUnaryOperation(0, 'atan', 'deg')).toBe(0);
      expect(executeUnaryOperation(1, 'atan', 'deg')).toBe(45);
    });

    it('Funciones hiperbólicas (sinh, cosh, tanh)', () => {
      expect(executeUnaryOperation(0, 'sinh')).toBe(0);
      expect(executeUnaryOperation(0, 'cosh')).toBe(1);
      expect(executeUnaryOperation(0, 'tanh')).toBe(0);
      // Overflow
      expect(() => executeUnaryOperation(800, 'sinh')).toThrow('Error');
      expect(() => executeUnaryOperation(800, 'cosh')).toThrow('Error');
    });
  });

  describe('2. Potencias, Raíces, Exponenciales y Logaritmos', () => {
    it('Potencias binarias x^y', () => {
      expect(executeBinaryOperation(2, 3, 'pow')).toBe(8);
      expect(executeBinaryOperation(5, 0, 'pow')).toBe(1);
      expect(executeBinaryOperation(0, 0, 'pow')).toBe(1);
      expect(executeBinaryOperation(2, -2, 'pow')).toBe(0.25);
      expect(executeBinaryOperation(-2, 3, 'pow')).toBe(-8);
      expect(executeBinaryOperation(-2, 4, 'pow')).toBe(16);
      expect(() => executeBinaryOperation(0, -1, 'pow')).toThrow('Error');
      expect(() => executeBinaryOperation(-4, 0.5, 'pow')).toThrow('Error');
      expect(() => executeBinaryOperation(2, 10000, 'pow')).toThrow('Error');
    });

    it('Raíces yroot', () => {
      expect(executeBinaryOperation(8, 3, 'yroot')).toBe(2);
      expect(executeBinaryOperation(16, 4, 'yroot')).toBe(2);
      expect(executeBinaryOperation(-8, 3, 'yroot')).toBe(-2);
      expect(executeBinaryOperation(-32, 5, 'yroot')).toBe(-2);
      expect(() => executeBinaryOperation(-16, 2, 'yroot')).toThrow('Error');
      expect(() => executeBinaryOperation(8, 0, 'yroot')).toThrow('Error');
      expect(() => executeBinaryOperation(0, -2, 'yroot')).toThrow('Error');
    });

    it('Raíz cuadrada, cúbica, cuadrado y cubo', () => {
      expect(executeUnaryOperation(16, 'sqrt')).toBe(4);
      expect(executeUnaryOperation(0, 'sqrt')).toBe(0);
      expect(() => executeUnaryOperation(-16, 'sqrt')).toThrow('Error');

      expect(executeUnaryOperation(27, 'cbrt')).toBe(3);
      expect(executeUnaryOperation(-27, 'cbrt')).toBe(-3);
      expect(executeUnaryOperation(0, 'cbrt')).toBe(0);

      expect(executeUnaryOperation(5, 'square')).toBe(25);
      expect(executeUnaryOperation(-5, 'square')).toBe(25);
      expect(executeUnaryOperation(3, 'cube')).toBe(27);
      expect(executeUnaryOperation(-3, 'cube')).toBe(-27);
    });

    it('Inverso 1/x', () => {
      expect(executeUnaryOperation(4, 'reciprocal')).toBe(0.25);
      expect(executeUnaryOperation(-2, 'reciprocal')).toBe(-0.5);
      expect(() => executeUnaryOperation(0, 'reciprocal')).toThrow('Error');
    });

    it('Exponenciales e^x y 10^x', () => {
      expect(executeUnaryOperation(0, 'exp')).toBe(1);
      expect(executeUnaryOperation(1, 'exp')).toBeCloseTo(Math.E, 5);
      expect(() => executeUnaryOperation(1000, 'exp')).toThrow('Error');

      expect(executeUnaryOperation(0, 'tenPow')).toBe(1);
      expect(executeUnaryOperation(3, 'tenPow')).toBe(1000);
      expect(executeUnaryOperation(-2, 'tenPow')).toBe(0.01);
      expect(() => executeUnaryOperation(400, 'tenPow')).toThrow('Error');
    });

    it('Logaritmos ln y log10', () => {
      expect(executeUnaryOperation(1, 'ln')).toBe(0);
      expect(executeUnaryOperation(Math.E, 'ln')).toBe(1);
      expect(() => executeUnaryOperation(0, 'ln')).toThrow('Error');
      expect(() => executeUnaryOperation(-5, 'ln')).toThrow('Error');

      expect(executeUnaryOperation(1, 'log10')).toBe(0);
      expect(executeUnaryOperation(100, 'log10')).toBe(2);
      expect(() => executeUnaryOperation(0, 'log10')).toThrow('Error');
      expect(() => executeUnaryOperation(-10, 'log10')).toThrow('Error');
    });

    it('Notación científica EE (a * 10^b)', () => {
      expect(executeBinaryOperation(2, 3, 'ee')).toBe(2000);
      expect(executeBinaryOperation(1.5, -2, 'ee')).toBe(0.015);
      expect(() => executeBinaryOperation(1, 500, 'ee')).toThrow('Error');
    });
  });

  describe('3. Factorial y Constantes', () => {
    it('Factorial de 0 a 170 y errores', () => {
      expect(calculateFactorial(0)).toBe(1);
      expect(calculateFactorial(1)).toBe(1);
      expect(calculateFactorial(5)).toBe(120);
      expect(calculateFactorial(10)).toBe(3628800);
      expect(() => calculateFactorial(-1)).toThrow('Error');
      expect(() => calculateFactorial(3.14)).toThrow('Error');
      expect(() => calculateFactorial(171)).toThrow('Error');
    });
  });

  describe('4. Flujos Completos en CalculatorEngine', () => {
    it('Operaciones con porcentajes en sumas, restas y productos', () => {
      const engine = new CalculatorEngine();
      // 200 + 10% = 220
      engine.inputDigit('2');
      engine.inputDigit('0');
      engine.inputDigit('0');
      engine.setOperator('+');
      engine.inputDigit('1');
      engine.inputDigit('0');
      engine.executeUnary('percent');
      engine.calculate();
      expect(engine.getState().displayValue).toBe('220');

      // 150 - 20% = 120
      engine.inputDigit('1');
      engine.inputDigit('5');
      engine.inputDigit('0');
      engine.setOperator('-');
      engine.inputDigit('2');
      engine.inputDigit('0');
      engine.executeUnary('percent');
      engine.calculate();
      expect(engine.getState().displayValue).toBe('120');

      // 50% directo = 0.5
      engine.inputDigit('5');
      engine.inputDigit('0');
      engine.executeUnary('percent');
      expect(engine.getState().displayValue).toBe('0.5');
    });

    it('Paréntesis complejos y anidados', () => {
      const engine = new CalculatorEngine();
      // (10 - 2) / (2 + 2) = 2
      engine.openParenthesis();
      engine.inputDigit('1');
      engine.inputDigit('0');
      engine.setOperator('-');
      engine.inputDigit('2');
      engine.closeParenthesis();
      engine.setOperator('/');
      engine.openParenthesis();
      engine.inputDigit('2');
      engine.setOperator('+');
      engine.inputDigit('2');
      engine.closeParenthesis();
      engine.calculate();
      expect(engine.getState().displayValue).toBe('2');

      // Multiplicación implícita en paréntesis consecutivos: (2 + 3)(4 + 1) = 25
      engine.allClear();
      engine.openParenthesis();
      engine.inputDigit('2');
      engine.setOperator('+');
      engine.inputDigit('3');
      engine.closeParenthesis();
      engine.openParenthesis();
      engine.inputDigit('4');
      engine.setOperator('+');
      engine.inputDigit('1');
      engine.closeParenthesis();
      engine.calculate();
      expect(engine.getState().displayValue).toBe('25');
    });

    it('Recuperación limpia tras Error con cualquier tecla numérica o AC', () => {
      const engine = new CalculatorEngine();
      engine.inputDigit('5');
      engine.setOperator('/');
      engine.inputDigit('0');
      engine.calculate();
      expect(engine.getState().displayValue).toBe('Error');

      // Pulsar número recupera
      engine.inputDigit('9');
      expect(engine.getState().displayValue).toBe('9');
      expect(engine.getState().isError).toBe(false);

      // Provocar error de nuevo y limpiar con AC
      engine.executeUnary('negate');
      engine.executeUnary('sqrt');
      expect(engine.getState().displayValue).toBe('Error');

      engine.allClear();
      expect(engine.getState().displayValue).toBe('0');
      expect(engine.getState().isError).toBe(false);
    });

    it('Manejo de ceros y puntos mientras se escribe: 0.005', () => {
      const engine = new CalculatorEngine();
      engine.inputDigit('0');
      engine.inputDecimal();
      engine.inputDigit('0');
      engine.inputDigit('0');
      engine.inputDigit('5');
      expect(engine.getState().displayValue).toBe('0.005');

      engine.setOperator('+');
      engine.inputDigit('1');
      engine.calculate();
      expect(engine.getState().displayValue).toBe('1.005');
    });
  });
});
