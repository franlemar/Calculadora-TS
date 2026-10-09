/**
 * Formateador de números para la pantalla de la calculadora
 * Maneja separadores de miles, decimales mientras se escribe, notación científica y autoescalado de fuente.
 */
export class DisplayFormatter {
  /**
   * Formatea el valor actual para ser mostrado en el display LCD
   */
  public static format(valueStr: string): string {
    if (
      !valueStr ||
      valueStr === 'Error' ||
      valueStr === 'NaN' ||
      valueStr === 'Infinity' ||
      valueStr === '-Infinity'
    ) {
      return 'Error';
    }

    if (valueStr === '-0') {
      return '-0';
    }

    // Si ya viene en notación científica
    if (valueStr.includes('e') || valueStr.includes('E')) {
      const num = parseFloat(valueStr);
      if (Number.isNaN(num) || !Number.isFinite(num)) return 'Error';
      return num.toExponential(6).replace(/\.?0+e/, 'e').replace('e+', 'e');
    }

    // Si el usuario está escribiendo un punto al final: ej. "12."
    const hasTrailingDot = valueStr.endsWith('.');
    // Si tiene ceros a la derecha después del punto: ej. "12.000"
    const parts = valueStr.split('.');
    const integerPartStr = parts[0];
    const decimalPartStr = parts.length > 1 ? parts[1] : null;

    const numValue = parseFloat(valueStr);
    if (Number.isNaN(numValue) || !Number.isFinite(numValue)) {
      return 'Error';
    }

    // Números extremadamente grandes o minúsculos pasan a notación científica
    if (
      Math.abs(numValue) >= 1e12 ||
      (Math.abs(numValue) > 0 && Math.abs(numValue) < 1e-7 && !valueStr.startsWith('0.'))
    ) {
      return numValue.toExponential(6).replace(/\.?0+e/, 'e').replace('e+', 'e');
    }

    // Formatear la parte entera con separadores de miles (espacio fino para look digital LCD nítido)
    const formattedInteger = this.formatInteger(integerPartStr);

    if (decimalPartStr !== null) {
      return `${formattedInteger}.${decimalPartStr}`;
    }

    if (hasTrailingDot) {
      return `${formattedInteger}.`;
    }

    return formattedInteger;
  }

  /**
   * Agrega separadores de miles
   */
  private static formatInteger(str: string): string {
    const isNegative = str.startsWith('-');
    const cleanStr = isNegative ? str.slice(1) : str;
    const withSeparators = cleanStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return isNegative ? `-${withSeparators}` : withSeparators;
  }

  /**
   * Calcula el tamaño de fuente óptimo según la longitud del texto
   * para evitar cualquier desbordamiento visual.
   */
  public static getFontSizeClass(textLength: number): string {
    if (textLength <= 7) return 'font-large';
    if (textLength <= 10) return 'font-medium';
    if (textLength <= 13) return 'font-small';
    return 'font-xsmall';
  }
}
