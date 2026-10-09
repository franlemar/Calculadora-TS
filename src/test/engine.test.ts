import { describe, it, expect, beforeEach } from 'vitest';
import { CalculatorEngine } from '../core/CalculatorEngine';
import { normalizeFloat } from '../core/mathOperations';
import { DisplayFormatter } from '../ui/DisplayFormatter';

describe('CalculatorEngine - Pruebas Unitarias Exhaustivas', () => {
  let engine: CalculatorEngine;

  beforeEach(() => {
    engine = new CalculatorEngine();
  });

  describe('Operaciones Aritméticas Básicas', () => {
    it('Suma correctamente: 12 + 8 = 20', () => {
      engine.inputDigit('1');
      engine.inputDigit('2');
      engine.setOperator('+');
      engine.inputDigit('8');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('20');
      expect(engine.getState().isError).toBe(false);
    });

    it('Resta correctamente: 45 - 15 = 30', () => {
      engine.inputDigit('4');
      engine.inputDigit('5');
      engine.setOperator('-');
      engine.inputDigit('1');
      engine.inputDigit('5');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('30');
    });

    it('Multiplica correctamente: 7 * 6 = 42', () => {
      engine.inputDigit('7');
      engine.setOperator('*');
      engine.inputDigit('6');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('42');
    });

    it('Divide correctamente: 84 / 2 = 42', () => {
      engine.inputDigit('8');
      engine.inputDigit('4');
      engine.setOperator('/');
      engine.inputDigit('2');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('42');
    });
  });

  describe('Control de Errores y Casos Límite ("No pete")', () => {
    it('Maneja división por cero limpiamente sin romper el estado: 10 / 0 = Error', () => {
      engine.inputDigit('1');
      engine.inputDigit('0');
      engine.setOperator('/');
      engine.inputDigit('0');
      engine.calculate();

      const state = engine.getState();
      expect(state.displayValue).toBe('Error');
      expect(state.isError).toBe(true);

      // Al pulsar un nuevo número se recupera automáticamente
      engine.inputDigit('5');
      expect(engine.getState().displayValue).toBe('5');
      expect(engine.getState().isError).toBe(false);
    });

    it('Maneja 0 / 0 dando Error', () => {
      engine.inputDigit('0');
      engine.setOperator('/');
      engine.inputDigit('0');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('Error');
      expect(engine.getState().isError).toBe(true);
    });

    it('Raíz cuadrada de número negativo produce Error sin lanzar excepción no controlada', () => {
      engine.inputDigit('9');
      engine.executeUnary('negate');
      expect(engine.getState().displayValue).toBe('-9');

      engine.executeUnary('sqrt');
      expect(engine.getState().displayValue).toBe('Error');
      expect(engine.getState().isError).toBe(true);
    });

    it('Logaritmo de 0 o número negativo produce Error', () => {
      engine.inputDigit('0');
      engine.executeUnary('log10');
      expect(engine.getState().displayValue).toBe('Error');

      engine.allClear();
      engine.inputDigit('5');
      engine.executeUnary('negate');
      engine.executeUnary('ln');
      expect(engine.getState().displayValue).toBe('Error');
    });

    it('Factorial de número negativo o no entero produce Error', () => {
      engine.inputDigit('3');
      engine.inputDecimal();
      engine.inputDigit('5');
      engine.executeUnary('factorial');
      expect(engine.getState().displayValue).toBe('Error');
    });

    it('Tangente de 90 grados produce Error', () => {
      engine.inputDigit('9');
      engine.inputDigit('0');
      engine.executeUnary('tan'); // por defecto en deg
      expect(engine.getState().displayValue).toBe('Error');
    });
  });

  describe('Precisión en Coma Flotante', () => {
    it('Resuelve 0.1 + 0.2 = 0.3 sin ruido IEEE 754', () => {
      engine.inputDigit('0');
      engine.inputDecimal();
      engine.inputDigit('1');
      engine.setOperator('+');
      engine.inputDigit('0');
      engine.inputDecimal();
      engine.inputDigit('2');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('0.3');
    });

    it('Resuelve 0.7 * 0.1 = 0.07 limpiamente', () => {
      engine.inputDigit('0');
      engine.inputDecimal();
      engine.inputDigit('7');
      engine.setOperator('*');
      engine.inputDigit('0');
      engine.inputDecimal();
      engine.inputDigit('1');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('0.07');
    });

    it('normalizeFloat evita -0', () => {
      expect(normalizeFloat(-0)).toBe(0);
    });
  });

  describe('Comportamiento Interactivo estilo Apple', () => {
    it('Permite un solo punto decimal por operando', () => {
      engine.inputDigit('3');
      engine.inputDecimal();
      engine.inputDecimal();
      engine.inputDigit('1');
      engine.inputDigit('4');
      engine.inputDecimal();

      expect(engine.getState().displayValue).toBe('3.14');
    });

    it('Reemplaza el operador si se pulsan dos seguidos sin escribir operando', () => {
      engine.inputDigit('5');
      engine.setOperator('+');
      engine.setOperator('-');
      engine.inputDigit('2');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('3');
    });

    it('Encadena operaciones intermedias automáticamente: 5 + 3 * 2 = 16', () => {
      engine.inputDigit('5');
      engine.setOperator('+');
      engine.inputDigit('3');
      engine.setOperator('*'); // calcula 5 + 3 = 8
      expect(engine.getState().displayValue).toBe('8');

      engine.inputDigit('2');
      engine.calculate();
      expect(engine.getState().displayValue).toBe('16');
    });

    it('Pulsación repetida de "=" repite la última operación', () => {
      engine.inputDigit('5');
      engine.setOperator('+');
      engine.inputDigit('3');
      engine.calculate(); // 8
      expect(engine.getState().displayValue).toBe('8');

      engine.calculate(); // 8 + 3 = 11
      expect(engine.getState().displayValue).toBe('11');

      engine.calculate(); // 11 + 3 = 14
      expect(engine.getState().displayValue).toBe('14');
    });

    it('Tecla Backspace borra el último dígito correctamente', () => {
      engine.inputDigit('1');
      engine.inputDigit('2');
      engine.inputDigit('3');
      expect(engine.getState().displayValue).toBe('123');

      engine.backspace();
      expect(engine.getState().displayValue).toBe('12');

      engine.backspace();
      expect(engine.getState().displayValue).toBe('1');

      engine.backspace();
      expect(engine.getState().displayValue).toBe('0');
    });

    it('Tecla Clear (C) borra el display actual pero conserva la operación', () => {
      engine.inputDigit('1');
      engine.inputDigit('0');
      engine.setOperator('+');
      engine.inputDigit('9');
      engine.inputDigit('9');

      engine.clear();
      expect(engine.getState().displayValue).toBe('0');
      expect(engine.getState().previousValue).toBe(10);
      expect(engine.getState().activeOperator).toBe('+');

      engine.inputDigit('5');
      engine.calculate();
      expect(engine.getState().displayValue).toBe('15');
    });

    it('Permite negar el segundo operando con ± mientras espera número (ej. 10 + -5 = 5)', () => {
      engine.inputDigit('1');
      engine.inputDigit('0');
      engine.setOperator('+');
      expect(engine.getState().waitingForSecondOperand).toBe(true);

      engine.executeUnary('negate');
      expect(engine.getState().displayValue).toBe('-0');

      engine.inputDigit('5');
      expect(engine.getState().displayValue).toBe('-5');

      engine.calculate();
      expect(engine.getState().displayValue).toBe('5');
    });

    it('Limpia la sub-pantalla al empezar a escribir un nuevo número tras calcular con =', () => {
      engine.inputDigit('4');
      engine.setOperator('+');
      engine.inputDigit('6');
      engine.calculate();
      expect(engine.getState().displayValue).toBe('10');
      expect(engine.getState().subDisplayValue).toBe('4 + 6 =');

      // Al teclear un nuevo número, el subdisplay se limpia
      engine.inputDigit('7');
      expect(engine.getState().displayValue).toBe('7');
      expect(engine.getState().subDisplayValue).toBe('');
    });
  });

  describe('Funciones Científicas y Memoria', () => {
    it('Potencia: 2 ^ 8 = 256', () => {
      engine.inputDigit('2');
      engine.setOperator('pow');
      engine.inputDigit('8');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('256');
    });

    it('Raíz impar de número negativo es matemáticamente correcta: 3√(-8) = -2', () => {
      engine.inputDigit('8');
      engine.executeUnary('negate');
      engine.setOperator('yroot');
      engine.inputDigit('3');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('-2');
    });

    it('Raíz par de número negativo da Error: 2√(-4) = Error', () => {
      engine.inputDigit('4');
      engine.executeUnary('negate');
      engine.setOperator('yroot');
      engine.inputDigit('2');
      engine.calculate();

      expect(engine.getState().displayValue).toBe('Error');
    });

    it('Tangente de pi/2 en radianes produce Error', () => {
      engine.toggleAngleUnit(); // pasa a rad
      expect(engine.getState().angleUnit).toBe('rad');

      engine.insertConstant('pi');
      engine.setOperator('/');
      engine.inputDigit('2');
      engine.calculate(); // pi / 2

      engine.executeUnary('tan');
      expect(engine.getState().displayValue).toBe('Error');
    });

    it('Evalúa expresiones con paréntesis usando pila: 2 * (3 + 4) = 14', () => {
      engine.inputDigit('2');
      engine.setOperator('*');
      engine.openParenthesis();
      engine.inputDigit('3');
      engine.setOperator('+');
      engine.inputDigit('4');
      engine.closeParenthesis();
      engine.calculate();

      expect(engine.getState().displayValue).toBe('14');
    });

    it('Evalúa paréntesis anidados y cierra paréntesis automáticamente con =: 2 * (3 + (4 * 2 = 22', () => {
      engine.inputDigit('2');
      engine.setOperator('*');
      engine.openParenthesis();
      engine.inputDigit('3');
      engine.setOperator('+');
      engine.openParenthesis();
      engine.inputDigit('4');
      engine.setOperator('*');
      engine.inputDigit('2');
      // No cerramos con ')', pulsamos '=' directamente
      engine.calculate();

      expect(engine.getState().displayValue).toBe('22');
    });

    it('Factorial: 5! = 120', () => {
      engine.inputDigit('5');
      engine.executeUnary('factorial');

      expect(engine.getState().displayValue).toBe('120');
    });

    it('Memoria m+, mr, m-, mc funciona adecuadamente', () => {
      engine.inputDigit('5');
      engine.executeMemory('m+');
      expect(engine.getState().hasMemory).toBe(true);

      engine.allClear();
      expect(engine.getState().hasMemory).toBe(true);

      engine.executeMemory('mr');
      expect(engine.getState().displayValue).toBe('5');

      engine.inputDigit('2');
      engine.executeMemory('m-');

      engine.executeMemory('mr');
      expect(engine.getState().displayValue).toBe('3');

      engine.executeMemory('mc');
      expect(engine.getState().hasMemory).toBe(false);
    });

    it('Inserta constantes pi y e', () => {
      engine.insertConstant('pi');
      expect(parseFloat(engine.getState().displayValue)).toBeCloseTo(Math.PI, 6);

      engine.allClear();
      engine.insertConstant('e');
      expect(parseFloat(engine.getState().displayValue)).toBeCloseTo(Math.E, 6);
    });
  });

  describe('DisplayFormatter', () => {
    it('Añade separadores de miles adecuadamente', () => {
      expect(DisplayFormatter.format('1000000')).toBe('1,000,000');
      expect(DisplayFormatter.format('12345.67')).toBe('12,345.67');
      expect(DisplayFormatter.format('-50000')).toBe('-50,000');
    });

    it('Conserva punto final mientras se escribe', () => {
      expect(DisplayFormatter.format('42.')).toBe('42.');
    });

    it('Muestra Error intacto', () => {
      expect(DisplayFormatter.format('Error')).toBe('Error');
    });

    it('Calcula clases de tamaño de fuente correctas para auto-scaling', () => {
      expect(DisplayFormatter.getFontSizeClass(5)).toBe('font-large');
      expect(DisplayFormatter.getFontSizeClass(9)).toBe('font-medium');
      expect(DisplayFormatter.getFontSizeClass(12)).toBe('font-small');
      expect(DisplayFormatter.getFontSizeClass(15)).toBe('font-xsmall');
    });
  });
});
