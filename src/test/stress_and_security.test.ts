import { describe, it, expect, beforeEach } from 'vitest';
import { CalculatorEngine } from '../core/CalculatorEngine';
import { DisplayFormatter } from '../ui/DisplayFormatter';
import { calculateFactorial, normalizeFloat } from '../core/mathOperations';

describe('Pruebas de Blindaje, Casos Límite y Resistencia ante Fallos (Fuzzing / Stress)', () => {
  let engine: CalculatorEngine;

  beforeEach(() => {
    engine = new CalculatorEngine();
  });

  describe('1. Protección Absoluta contra Errores Matemáticos y Singularidades', () => {
    it('Maneja división por cero pura y expresiones que evalúan a cero en denominador', () => {
      engine.inputDigit('8');
      engine.setOperator('/');
      engine.inputDigit('0');
      engine.calculate();
      expect(engine.getState().isError).toBe(true);
      expect(engine.getState().displayValue).toBe('Error');

      // Se recupera inmediatamente al pulsar un nuevo dígito
      engine.inputDigit('5');
      expect(engine.getState().isError).toBe(false);
      expect(engine.getState().displayValue).toBe('5');
    });

    it('Maneja cero elevado a exponente negativo (0^-2 = Error)', () => {
      engine.inputDigit('0');
      engine.setOperator('pow');
      engine.inputDigit('2');
      engine.executeUnary('negate');
      engine.calculate();
      expect(engine.getState().isError).toBe(true);
      expect(engine.getState().displayValue).toBe('Error');
    });

    it('Maneja asíntotas de tangente en todos los cuadrantes (90, 270, -90, 450 grados)', () => {
      const angles = [90, 270, -90, 450];
      for (const angle of angles) {
        engine.allClear();
        if (angle < 0) {
          engine.inputDigit(String(Math.abs(angle)));
          engine.executeUnary('negate');
        } else {
          for (const d of String(angle)) {
            engine.inputDigit(d);
          }
        }
        engine.executeUnary('tan');
        expect(engine.getState().isError).toBe(true);
        expect(engine.getState().displayValue).toBe('Error');
      }
    });

    it('Maneja límites de arco seno y arco coseno fuera de [-1, 1]', () => {
      engine.inputDigit('1');
      engine.inputDecimal();
      engine.inputDigit('0');
      engine.inputDigit('1'); // 1.01
      engine.toggleSecondMode();
      engine.executeUnary('asin');
      expect(engine.getState().isError).toBe(true);

      engine.allClear();
      engine.inputDigit('2');
      engine.toggleSecondMode();
      engine.executeUnary('acos');
      expect(engine.getState().isError).toBe(true);
    });

    it('Maneja logaritmos de cero y negativos', () => {
      engine.inputDigit('0');
      engine.executeUnary('ln');
      expect(engine.getState().isError).toBe(true);

      engine.allClear();
      engine.inputDigit('5');
      engine.executeUnary('negate');
      engine.executeUnary('log10');
      expect(engine.getState().isError).toBe(true);
    });

    it('Maneja factorial con límites extremos (negativo, decimal, mayor a 170)', () => {
      expect(() => calculateFactorial(-1)).toThrow('Error');
      expect(() => calculateFactorial(3.14)).toThrow('Error');
      expect(() => calculateFactorial(171)).toThrow('Error');
      expect(calculateFactorial(0)).toBe(1);
      expect(calculateFactorial(1)).toBe(1);
      expect(calculateFactorial(5)).toBe(120);
    });

    it('Maneja raíces de números negativos correctamente según paridad', () => {
      // Raíz cúbica de -27 es -3 (número real exacto)
      engine.inputDigit('2');
      engine.inputDigit('7');
      engine.executeUnary('negate');
      engine.executeUnary('cbrt');
      expect(engine.getState().displayValue).toBe('-3');

      // Raíz cuadrada de -16 es Error
      engine.allClear();
      engine.inputDigit('1');
      engine.inputDigit('6');
      engine.executeUnary('negate');
      engine.executeUnary('sqrt');
      expect(engine.getState().isError).toBe(true);

      // Raíz y de x: raíz 5 de -32 es -2
      engine.allClear();
      engine.inputDigit('3');
      engine.inputDigit('2');
      engine.executeUnary('negate');
      engine.setOperator('yroot');
      engine.inputDigit('5');
      engine.calculate();
      expect(engine.getState().displayValue).toBe('-2');

      // Raíz y de x: raíz 4 de -16 es Error
      engine.allClear();
      engine.inputDigit('1');
      engine.inputDigit('6');
      engine.executeUnary('negate');
      engine.setOperator('yroot');
      engine.inputDigit('4');
      engine.calculate();
      expect(engine.getState().isError).toBe(true);
    });
  });

  describe('2. Robustez de la Pila de Paréntesis y Expresiones Complejas', () => {
    it('Soporta hasta 25 niveles de anidamiento sin desbordar memoria', () => {
      for (let i = 0; i < 30; i++) {
        engine.openParenthesis();
      }
      expect(engine.getState().openParenthesesCount).toBeLessThanOrEqual(25);
      engine.inputDigit('2');
      engine.setOperator('+');
      engine.inputDigit('2');
      engine.calculate(); // auto-cierra todos
      expect(engine.getState().displayValue).toBe('4');
    });

    it('Ignora el cierre de paréntesis huérfano sin abrir', () => {
      engine.inputDigit('9');
      engine.closeParenthesis();
      expect(engine.getState().displayValue).toBe('9');
      expect(engine.getState().openParenthesesCount).toBe(0);
    });

    it('Multiplicación implícita en expresiones complejas: (2 + 3)(4 + 1) = 25', () => {
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
  });

  describe('3. Entrada Masiva de Dígitos y Teclado', () => {
    it('Trunca la entrada de dígitos a un máximo seguro de 16 caracteres', () => {
      for (let i = 0; i < 50; i++) {
        engine.inputDigit('9');
      }
      expect(engine.getState().displayValue.length).toBeLessThanOrEqual(16);
    });

    it('Ignora pulsaciones redundantes de punto decimal', () => {
      engine.inputDigit('3');
      engine.inputDecimal();
      engine.inputDecimal();
      engine.inputDecimal();
      engine.inputDigit('1');
      engine.inputDecimal();
      engine.inputDigit('4');
      expect(engine.getState().displayValue).toBe('3.14');
    });

    it('Backspace continuo no rompe el estado', () => {
      engine.inputDigit('1');
      engine.inputDigit('2');
      engine.backspace();
      expect(engine.getState().displayValue).toBe('1');
      engine.backspace();
      expect(engine.getState().displayValue).toBe('0');
      engine.backspace();
      expect(engine.getState().displayValue).toBe('0');
    });
  });

  describe('4. DisplayFormatter Blindado ante Valores Atípicos', () => {
    it('Nunca devuelve NaN, Infinity o valores no finitos al usuario', () => {
      expect(DisplayFormatter.format('NaN')).toBe('Error');
      expect(DisplayFormatter.format('Infinity')).toBe('Error');
      expect(DisplayFormatter.format('-Infinity')).toBe('Error');
      expect(DisplayFormatter.format('')).toBe('Error');
    });

    it('Convierte números gigantescos o minúsculos a notación científica', () => {
      expect(DisplayFormatter.format('1000000000000')).toBe('1e12');
      expect(DisplayFormatter.format('1e-8')).toBe('1e-8');
      expect(DisplayFormatter.format('2.5e15')).toBe('2.5e15');
    });

    it('Formatea enteros y decimales con separador de miles nítido', () => {
      expect(DisplayFormatter.format('987654321')).toBe('987,654,321');
      expect(DisplayFormatter.format('1234.5678')).toBe('1,234.5678');
    });
  });

  describe('5. Normalización Flotante IEEE 754', () => {
    it('Elimina ruido clásico de coma flotante en operaciones consecutivas', () => {
      expect(normalizeFloat(0.1 + 0.2)).toBe(0.3);
      expect(normalizeFloat(0.3 - 0.1)).toBe(0.2);
      expect(normalizeFloat(0.7 * 0.1)).toBe(0.07);
      expect(normalizeFloat(0.3 / 0.1)).toBe(3);
    });
  });
});
