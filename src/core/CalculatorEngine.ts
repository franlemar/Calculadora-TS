import {
  BinaryOperation,
  CalculatorState,
  MemoryOperation,
  ParenthesisFrame,
  UnaryOperation,
} from './types';
import {
  executeBinaryOperation,
  executeUnaryOperation,
  normalizeFloat,
} from './mathOperations';

export class CalculatorEngine {
  private state: CalculatorState;
  private parenthesisStack: ParenthesisFrame[] = [];

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): CalculatorState {
    return {
      displayValue: '0',
      subDisplayValue: '',
      previousValue: null,
      activeOperator: null,
      waitingForSecondOperand: false,
      lastExecutedOperation: null,
      memory: 0,
      hasMemory: false,
      angleUnit: 'deg',
      isError: false,
      isSecondMode: false,
      openParenthesesCount: 0,
    };
  }

  public getState(): Readonly<CalculatorState> {
    return { ...this.state };
  }

  /**
   * Resetea el motor a un estado limpio
   */
  public allClear(): void {
    const memory = this.state.memory;
    const hasMemory = this.state.hasMemory;
    const angleUnit = this.state.angleUnit;
    const isSecondMode = this.state.isSecondMode;
    this.parenthesisStack = [];

    this.state = {
      ...this.getInitialState(),
      memory,
      hasMemory,
      angleUnit,
      isSecondMode,
      openParenthesesCount: 0,
    };
  }

  /**
   * Borra el número actual (Clear) manteniendo la operación pendiente
   */
  public clear(): void {
    if (this.state.isError) {
      this.allClear();
      return;
    }
    this.state.displayValue = '0';
  }

  /**
   * Borra el último dígito ingresado (Backspace)
   */
  public backspace(): void {
    if (this.state.isError || this.state.waitingForSecondOperand) {
      return;
    }

    if (this.state.displayValue === '-0') {
      this.state.displayValue = '0';
      this.state.waitingForSecondOperand = true;
      return;
    }

    if (
      this.state.displayValue.length === 1 ||
      (this.state.displayValue.length === 2 && this.state.displayValue.startsWith('-'))
    ) {
      this.state.displayValue = '0';
    } else {
      this.state.displayValue = this.state.displayValue.slice(0, -1);
    }
  }

  /**
   * Introduce un dígito numérico (0-9)
   */
  public inputDigit(digit: string): void {
    if (this.state.isError) {
      this.allClear();
    }

    // Si acabamos de calcular con '=' y el usuario empieza a escribir, inicia un nuevo cálculo limpio
    if (this.state.lastExecutedOperation !== null && this.state.waitingForSecondOperand) {
      this.state.subDisplayValue = '';
      this.state.lastExecutedOperation = null;
    }

    // Límite de longitud para evitar desbordamientos numéricos extremos
    if (!this.state.waitingForSecondOperand && this.state.displayValue.replace(/[-.]/g, '').length >= 16) {
      return;
    }

    // Manejo de '-0' (tras pulsar ± mientras esperaba segundo operando)
    if (this.state.displayValue === '-0') {
      this.state.displayValue = `-${digit}`;
      return;
    }

    if (this.state.waitingForSecondOperand) {
      this.state.displayValue = digit;
      this.state.waitingForSecondOperand = false;
    } else {
      if (this.state.displayValue === '0') {
        this.state.displayValue = digit;
      } else {
        this.state.displayValue += digit;
      }
    }
  }

  /**
   * Introduce el punto decimal
   */
  public inputDecimal(): void {
    if (this.state.isError) {
      this.allClear();
    }

    if (this.state.lastExecutedOperation !== null && this.state.waitingForSecondOperand) {
      this.state.subDisplayValue = '';
      this.state.lastExecutedOperation = null;
    }

    if (this.state.displayValue === '-0') {
      this.state.displayValue = '-0.';
      return;
    }

    if (this.state.waitingForSecondOperand) {
      this.state.displayValue = '0.';
      this.state.waitingForSecondOperand = false;
      return;
    }

    if (!this.state.displayValue.includes('.')) {
      this.state.displayValue += '.';
    }
  }

  /**
   * Establece un operador binario (+, -, *, /, etc.)
   */
  public setOperator(op: BinaryOperation): void {
    if (this.state.isError) return;

    const currentValue = parseFloat(this.state.displayValue);

    // Si ya hay un operador seleccionado y el usuario aún no ha escrito el segundo número,
    // simplemente cambiamos de operador.
    if (this.state.activeOperator !== null && this.state.waitingForSecondOperand) {
      this.state.activeOperator = op;
      this.updateSubDisplay(this.state.previousValue!, op);
      return;
    }

    // Si ya teníamos un primer operando y un operador, calculamos el resultado intermedio
    if (this.state.previousValue !== null && this.state.activeOperator !== null) {
      try {
        const result = executeBinaryOperation(
          this.state.previousValue,
          currentValue,
          this.state.activeOperator
        );
        this.state.displayValue = String(result);
        this.state.previousValue = result;
      } catch {
        this.setErrorState();
        return;
      }
    } else {
      this.state.previousValue = currentValue;
    }

    this.state.activeOperator = op;
    this.state.waitingForSecondOperand = true;
    this.state.lastExecutedOperation = null;
    this.updateSubDisplay(this.state.previousValue, op);
  }

  /**
   * Abre un paréntesis y apila el contexto en la pila
   */
  public openParenthesis(): void {
    if (this.state.isError) return;
    if (this.parenthesisStack.length >= 25) return;

    if (this.state.lastExecutedOperation !== null) {
      this.allClear();
    }

    // Multiplicación implícita si se pulsa '(' tras un número o tras cerrar un paréntesis previo
    const shouldImplicitMultiply =
      (!this.state.waitingForSecondOperand && this.state.displayValue !== '0' && this.state.activeOperator === null) ||
      (this.state.subDisplayValue.trimEnd().endsWith(')') && this.state.activeOperator === null);

    if (shouldImplicitMultiply) {
      this.setOperator('*');
    }

    this.parenthesisStack.push({
      previousValue: this.state.previousValue,
      activeOperator: this.state.activeOperator,
      subDisplayPrefix: this.state.subDisplayValue,
    });

    const currentSub = this.state.subDisplayValue;
    this.state.subDisplayValue = currentSub ? `${currentSub} (` : '(';
    this.state.previousValue = null;
    this.state.activeOperator = null;
    this.state.waitingForSecondOperand = true;
    this.state.openParenthesesCount = this.parenthesisStack.length;
  }

  /**
   * Cierra un paréntesis y evalúa la expresión interna
   */
  public closeParenthesis(): void {
    if (this.state.isError || this.parenthesisStack.length === 0) return;

    let current = parseFloat(this.state.displayValue);

    // Resolver operación binaria pendiente dentro del paréntesis
    if (this.state.previousValue !== null && this.state.activeOperator !== null) {
      try {
        current = executeBinaryOperation(
          this.state.previousValue,
          current,
          this.state.activeOperator
        );
      } catch {
        this.setErrorState();
        return;
      }
    }

    const frame = this.parenthesisStack.pop()!;
    this.state.openParenthesesCount = this.parenthesisStack.length;
    this.state.previousValue = frame.previousValue;
    this.state.activeOperator = frame.activeOperator;
    this.state.displayValue = String(current);
    this.state.waitingForSecondOperand = true;

    const prefix = frame.subDisplayPrefix;
    this.state.subDisplayValue = prefix
      ? `${prefix} (${this.formatDisplayForSub(current)})`
      : `(${this.formatDisplayForSub(current)})`;
  }

  /**
   * Ejecuta el cálculo al pulsar '='
   */
  public calculate(): void {
    if (this.state.isError) return;

    // Si hay paréntesis pendientes, cerrarlos todos ordenadamente
    while (this.parenthesisStack.length > 0) {
      this.closeParenthesis();
      if (this.state.isError) return;
    }

    const current = parseFloat(this.state.displayValue);

    // Caso 1: Operación binaria normal en curso
    if (this.state.previousValue !== null && this.state.activeOperator !== null) {
      try {
        const result = executeBinaryOperation(
          this.state.previousValue,
          current,
          this.state.activeOperator
        );

        this.state.lastExecutedOperation = {
          op: this.state.activeOperator,
          operand: current,
        };

        const prev = this.state.previousValue;
        const op = this.state.activeOperator;

        this.state.displayValue = String(result);
        this.state.subDisplayValue = `${this.formatDisplayForSub(prev)} ${this.getOperatorSymbol(op)} ${this.formatDisplayForSub(current)} =`;
        this.state.previousValue = null;
        this.state.activeOperator = null;
        this.state.waitingForSecondOperand = true;
      } catch {
        this.setErrorState();
      }
      return;
    }

    // Caso 2: Pulsación repetida de '=' (repite la última operación con el mismo operando)
    if (this.state.lastExecutedOperation !== null) {
      try {
        const { op, operand } = this.state.lastExecutedOperation;
        const result = executeBinaryOperation(current, operand, op);

        this.state.subDisplayValue = `${this.formatDisplayForSub(current)} ${this.getOperatorSymbol(op)} ${this.formatDisplayForSub(operand)} =`;
        this.state.displayValue = String(result);
        this.state.waitingForSecondOperand = true;
      } catch {
        this.setErrorState();
      }
    }
  }

  /**
   * Ejecuta una operación unaria (cambio de signo, porcentaje, funciones científicas)
   */
  public executeUnary(op: UnaryOperation): void {
    if (this.state.isError) return;

    // Negación con ±
    if (op === 'negate') {
      if (this.state.waitingForSecondOperand) {
        this.state.displayValue = '-0';
        this.state.waitingForSecondOperand = false;
        return;
      }
      if (this.state.displayValue === '-0') {
        this.state.displayValue = '0';
        this.state.waitingForSecondOperand = true;
        return;
      }
      const current = parseFloat(this.state.displayValue);
      const result = -current;
      this.state.displayValue = String(result);
      return;
    }

    if (op === 'rand') {
      const randomVal = normalizeFloat(Math.random());
      this.state.displayValue = String(randomVal);
      this.state.waitingForSecondOperand = true;
      return;
    }

    const current = parseFloat(this.state.displayValue);

    // Trato especial para porcentaje cuando hay una suma/resta previa (ej. 100 + 10% = 110)
    if (op === 'percent' && this.state.previousValue !== null && (this.state.activeOperator === '+' || this.state.activeOperator === '-')) {
      const percentageValue = normalizeFloat((this.state.previousValue * current) / 100);
      this.state.displayValue = String(percentageValue);
      return;
    }

    try {
      const result = executeUnaryOperation(current, op, this.state.angleUnit);
      this.state.subDisplayValue = `${this.getUnarySymbol(op, current)}`;
      this.state.displayValue = String(result);
      this.state.waitingForSecondOperand = true;
    } catch {
      this.setErrorState();
    }
  }

  /**
   * Manejo de la memoria de la calculadora
   */
  public executeMemory(op: MemoryOperation): void {
    if (this.state.isError) return;

    const current = parseFloat(this.state.displayValue);

    switch (op) {
      case 'mc':
        this.state.memory = 0;
        this.state.hasMemory = false;
        break;
      case 'm+':
        this.state.memory = normalizeFloat(this.state.memory + current);
        this.state.hasMemory = true;
        this.state.waitingForSecondOperand = true;
        break;
      case 'm-':
        this.state.memory = normalizeFloat(this.state.memory - current);
        this.state.hasMemory = true;
        this.state.waitingForSecondOperand = true;
        break;
      case 'mr':
        if (this.state.hasMemory) {
          this.state.displayValue = String(this.state.memory);
          this.state.waitingForSecondOperand = true;
        }
        break;
    }
  }

  /**
   * Alterna entre Radianes y Grados
   */
  public toggleAngleUnit(): void {
    this.state.angleUnit = this.state.angleUnit === 'deg' ? 'rad' : 'deg';
  }

  /**
   * Alterna la función '2nd' para funciones inversas
   */
  public toggleSecondMode(): void {
    this.state.isSecondMode = !this.state.isSecondMode;
  }

  /**
   * Inserta una constante matemática (pi, e)
   */
  public insertConstant(name: 'pi' | 'e'): void {
    if (this.state.isError) {
      this.allClear();
    }
    const val = name === 'pi' ? Math.PI : Math.E;
    this.state.displayValue = String(normalizeFloat(val));
    this.state.waitingForSecondOperand = true;
  }

  private setErrorState(): void {
    this.state.isError = true;
    this.state.displayValue = 'Error';
    this.state.subDisplayValue = '';
    this.state.previousValue = null;
    this.state.activeOperator = null;
    this.state.lastExecutedOperation = null;
    this.state.waitingForSecondOperand = true;
    this.parenthesisStack = [];
    this.state.openParenthesesCount = 0;
  }

  private updateSubDisplay(val: number, op: BinaryOperation): void {
    this.state.subDisplayValue = `${this.formatDisplayForSub(val)} ${this.getOperatorSymbol(op)}`;
  }

  private getOperatorSymbol(op: BinaryOperation): string {
    switch (op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      case 'pow': return '^';
      case 'yroot': return 'ʸ√';
      case 'ee': return 'EE';
      default: return '';
    }
  }

  private getUnarySymbol(op: UnaryOperation, val: number): string {
    const formatted = this.formatDisplayForSub(val);
    switch (op) {
      case 'sqrt': return `√(${formatted})`;
      case 'cbrt': return `³√(${formatted})`;
      case 'square': return `sqr(${formatted})`;
      case 'cube': return `cube(${formatted})`;
      case 'reciprocal': return `1/(${formatted})`;
      case 'factorial': return `${formatted}!`;
      case 'sin': return `sin(${formatted})`;
      case 'cos': return `cos(${formatted})`;
      case 'tan': return `tan(${formatted})`;
      case 'asin': return `asin(${formatted})`;
      case 'acos': return `acos(${formatted})`;
      case 'atan': return `atan(${formatted})`;
      case 'ln': return `ln(${formatted})`;
      case 'log10': return `log(${formatted})`;
      case 'exp': return `e^(${formatted})`;
      case 'tenPow': return `10^(${formatted})`;
      case 'percent': return `${formatted}%`;
      case 'negate': return `negate(${formatted})`;
      default: return formatted;
    }
  }

  private formatDisplayForSub(val: number): string {
    if (Math.abs(val) >= 1e9 || (Math.abs(val) < 1e-4 && val !== 0)) {
      return val.toExponential(4);
    }
    return String(val);
  }
}
