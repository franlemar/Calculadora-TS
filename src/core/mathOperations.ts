import { AngleUnit, BinaryOperation, UnaryOperation } from './types';

/**
 * Normaliza números de coma flotante para eliminar ruidos del estándar IEEE 754
 * como 0.1 + 0.2 = 0.30000000000000004
 */
export function normalizeFloat(value: number): number {
  if (!Number.isFinite(value)) return value;
  // Redondeo seguro a 12 dígitos significativos para absorber el ruido flotante
  const normalized = parseFloat(value.toPrecision(12));
  // Evitar -0
  return Object.is(normalized, -0) ? 0 : normalized;
}

/**
 * Convierte grados a radianes o viceversa según la unidad activa
 */
function toRadians(angle: number, unit: AngleUnit): number {
  return unit === 'deg' ? (angle * Math.PI) / 180 : angle;
}

function fromRadians(angle: number, unit: AngleUnit): number {
  return unit === 'deg' ? (angle * 180) / Math.PI : angle;
}

/**
 * Calcula factorial de forma segura
 */
export function calculateFactorial(n: number): number {
  if (n < 0 || !Number.isInteger(n) || n > 170) {
    throw new Error('Error');
  }
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}

/**
 * Ejecuta una operación binaria (dos operandos)
 */
export function executeBinaryOperation(
  a: number,
  b: number,
  op: BinaryOperation
): number {
  if (!Number.isFinite(a) || !Number.isFinite(b) || Number.isNaN(a) || Number.isNaN(b)) {
    throw new Error('Error');
  }

  let result: number;

  switch (op) {
    case '+':
      result = a + b;
      break;
    case '-':
      result = a - b;
      break;
    case '*':
      result = a * b;
      break;
    case '/':
      if (b === 0) {
        throw new Error('Error');
      }
      result = a / b;
      break;
    case 'pow':
      result = Math.pow(a, b);
      if (Number.isNaN(result)) throw new Error('Error');
      break;
    case 'yroot':
      if (b === 0) throw new Error('Error');
      if (a === 0 && b < 0) throw new Error('Error');
      if (a < 0) {
        // Si el índice b es un entero impar, la raíz impar de un negativo es real y negativa: -|a|^(1/b)
        if (Number.isInteger(b) && Math.abs(b) % 2 === 1) {
          result = -Math.pow(Math.abs(a), 1 / b);
        } else {
          throw new Error('Error');
        }
      } else {
        result = Math.pow(a, 1 / b);
      }
      if (Number.isNaN(result)) throw new Error('Error');
      break;
    case 'ee':
      result = a * Math.pow(10, b);
      break;
    default:
      throw new Error('Operador no soportado');
  }

  if (!Number.isFinite(result)) {
    throw new Error('Error');
  }

  return normalizeFloat(result);
}

/**
 * Ejecuta una operación unaria (un solo operando)
 */
export function executeUnaryOperation(
  value: number,
  op: UnaryOperation,
  angleUnit: AngleUnit = 'deg'
): number {
  if (!Number.isFinite(value) || Number.isNaN(value)) {
    throw new Error('Error');
  }

  let result: number;

  switch (op) {
    case 'negate':
      result = -value;
      break;
    case 'percent':
      result = value / 100;
      break;
    case 'sqrt':
      if (value < 0) throw new Error('Error');
      result = Math.sqrt(value);
      break;
    case 'cbrt':
      result = Math.cbrt(value);
      break;
    case 'square':
      result = value * value;
      break;
    case 'cube':
      result = value * value * value;
      break;
    case 'reciprocal':
      if (value === 0) throw new Error('Error');
      result = 1 / value;
      break;
    case 'factorial':
      result = calculateFactorial(value);
      break;
    case 'sin': {
      if (angleUnit === 'deg') {
        if (Math.abs(value % 180) < 1e-10) {
          result = 0;
          break;
        }
      } else {
        const radVal = Math.abs(value);
        const mod = radVal % Math.PI;
        if (mod < 1e-10 || Math.abs(mod - Math.PI) < 1e-10) {
          result = 0;
          break;
        }
      }
      const rad = toRadians(value, angleUnit);
      result = Math.sin(rad);
      break;
    }
    case 'cos': {
      if (angleUnit === 'deg') {
        if (Math.abs((Math.abs(value) - 90) % 180) < 1e-10) {
          result = 0;
          break;
        }
      } else {
        const radVal = Math.abs(value);
        const halfPi = Math.PI / 2;
        const mod = Math.abs((radVal - halfPi) % Math.PI);
        if (mod < 1e-10 || Math.abs(mod - Math.PI) < 1e-10) {
          result = 0;
          break;
        }
      }
      const rad = toRadians(value, angleUnit);
      result = Math.cos(rad);
      break;
    }
    case 'tan': {
      if (angleUnit === 'deg') {
        if (Math.abs((Math.abs(value) - 90) % 180) < 1e-10) {
          throw new Error('Error');
        }
        if (Math.abs(value % 180) < 1e-10) {
          result = 0;
          break;
        }
      } else {
        const radVal = Math.abs(value);
        const halfPi = Math.PI / 2;
        const mod = Math.abs((radVal - halfPi) % Math.PI);
        if (mod < 1e-10 || Math.abs(mod - Math.PI) < 1e-10) {
          throw new Error('Error');
        }
        const zeroMod = radVal % Math.PI;
        if (zeroMod < 1e-10 || Math.abs(zeroMod - Math.PI) < 1e-10) {
          result = 0;
          break;
        }
      }
      const rad = toRadians(value, angleUnit);
      result = Math.tan(rad);
      break;
    }
    case 'asin': {
      let val = value;
      if (Math.abs(val) > 1 && Math.abs(val) <= 1 + 1e-12) val = Math.sign(val);
      if (val < -1 || val > 1) throw new Error('Error');
      const rad = Math.asin(val);
      result = fromRadians(rad, angleUnit);
      break;
    }
    case 'acos': {
      let val = value;
      if (Math.abs(val) > 1 && Math.abs(val) <= 1 + 1e-12) val = Math.sign(val);
      if (val < -1 || val > 1) throw new Error('Error');
      const rad = Math.acos(val);
      result = fromRadians(rad, angleUnit);
      break;
    }
    case 'atan': {
      const rad = Math.atan(value);
      result = fromRadians(rad, angleUnit);
      break;
    }
    case 'sinh':
      result = Math.sinh(value);
      break;
    case 'cosh':
      result = Math.cosh(value);
      break;
    case 'tanh':
      result = Math.tanh(value);
      break;
    case 'ln':
      if (value <= 0) throw new Error('Error');
      result = Math.log(value);
      break;
    case 'log10':
      if (value <= 0) throw new Error('Error');
      result = Math.log10(value);
      break;
    case 'exp':
      result = Math.exp(value);
      break;
    case 'tenPow':
      result = Math.pow(10, value);
      break;
    case 'rand':
      result = Math.random();
      break;
    default:
      throw new Error('Operación no reconocida');
  }

  if (!Number.isFinite(result)) {
    throw new Error('Error');
  }

  return normalizeFloat(result);
}
