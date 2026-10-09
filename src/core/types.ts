export type BinaryOperation = '+' | '-' | '*' | '/' | 'pow' | 'yroot' | 'ee';

export type UnaryOperation =
  | 'negate'
  | 'percent'
  | 'sqrt'
  | 'cbrt'
  | 'square'
  | 'cube'
  | 'reciprocal'
  | 'factorial'
  | 'sin'
  | 'cos'
  | 'tan'
  | 'sinh'
  | 'cosh'
  | 'tanh'
  | 'asin'
  | 'acos'
  | 'atan'
  | 'ln'
  | 'log10'
  | 'exp'
  | 'tenPow'
  | 'rand';

export type MemoryOperation = 'mc' | 'm+' | 'm-' | 'mr';

export type AngleUnit = 'deg' | 'rad';

export interface ParenthesisFrame {
  previousValue: number | null;
  activeOperator: BinaryOperation | null;
  subDisplayPrefix: string;
}

export interface CalculatorState {
  displayValue: string;
  subDisplayValue: string;
  previousValue: number | null;
  activeOperator: BinaryOperation | null;
  waitingForSecondOperand: boolean;
  lastExecutedOperation: {
    op: BinaryOperation;
    operand: number;
  } | null;
  memory: number;
  hasMemory: boolean;
  angleUnit: AngleUnit;
  isError: boolean;
  isSecondMode: boolean;
  openParenthesesCount: number;
}

