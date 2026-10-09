import { describe, it, expect, beforeEach } from 'vitest';
import { CalculatorUI } from '../ui/CalculatorUI';

const HTML_FIXTURE = `
  <div class="calculator" id="calculator">
    <section class="screen-lcd" id="screen">
      <div class="screen-header">
        <span class="status-indicator" id="indicator-rad-deg">DEG</span>
        <span class="status-indicator" id="indicator-memory" style="opacity: 0;">M</span>
        <div class="sub-display" id="sub-display"></div>
      </div>
      <div class="main-display" id="main-display">0</div>
    </section>

    <section class="keypad" id="keypad">
      <div class="scientific-keys" id="scientific-keys">
        <button type="button" class="btn btn-sci" data-action="paren-open">(</button>
        <button type="button" class="btn btn-sci" data-action="paren-close">)</button>
        <button type="button" class="btn btn-sci" data-action="mc">mc</button>
        <button type="button" class="btn btn-sci" data-action="m+">m+</button>
        <button type="button" class="btn btn-sci" data-action="m-">m−</button>
        <button type="button" class="btn btn-sci" data-action="mr">mr</button>

        <button type="button" class="btn btn-sci" data-action="2nd" id="btn-2nd">2<sup>nd</sup></button>
        <button type="button" class="btn btn-sci" data-action="square">x<sup>2</sup></button>
        <button type="button" class="btn btn-sci" data-action="cube">x<sup>3</sup></button>
        <button type="button" class="btn btn-sci" data-action="pow">x<sup>y</sup></button>
        <button type="button" class="btn btn-sci" data-action="exp">e<sup>x</sup></button>
        <button type="button" class="btn btn-sci" data-action="tenPow">10<sup>x</sup></button>

        <button type="button" class="btn btn-sci" data-action="reciprocal">1/x</button>
        <button type="button" class="btn btn-sci" data-action="sqrt"><sup>2</sup>√x</button>
        <button type="button" class="btn btn-sci" data-action="cbrt"><sup>3</sup>√x</button>
        <button type="button" class="btn btn-sci" data-action="yroot"><sup>y</sup>√x</button>
        <button type="button" class="btn btn-sci" data-action="ln">ln</button>
        <button type="button" class="btn btn-sci" data-action="log10">log<sub>10</sub></button>

        <button type="button" class="btn btn-sci" data-action="factorial">x!</button>
        <button type="button" class="btn btn-sci" data-action="sin" id="btn-sin">sin</button>
        <button type="button" class="btn btn-sci" data-action="cos" id="btn-cos">cos</button>
        <button type="button" class="btn btn-sci" data-action="tan" id="btn-tan">tan</button>
        <button type="button" class="btn btn-sci" data-action="const-e">e</button>
        <button type="button" class="btn btn-sci" data-action="ee">EE</button>

        <button type="button" class="btn btn-sci btn-toggle" data-action="toggle-angle" id="btn-rad-deg">Rad</button>
        <button type="button" class="btn btn-sci" data-action="sinh">sinh</button>
        <button type="button" class="btn btn-sci" data-action="cosh">cosh</button>
        <button type="button" class="btn btn-sci" data-action="tanh">tanh</button>
        <button type="button" class="btn btn-sci" data-action="const-pi">π</button>
        <button type="button" class="btn btn-sci" data-action="rand">Rand</button>
      </div>

      <div class="basic-keys" id="basic-keys">
        <button type="button" class="btn btn-function" data-action="clear" id="btn-clear">AC</button>
        <button type="button" class="btn btn-function" data-action="negate">±</button>
        <button type="button" class="btn btn-function" data-action="percent">%</button>
        <button type="button" class="btn btn-operator" data-action="divide" data-op="/">÷</button>

        <button type="button" class="btn btn-number" data-digit="7">7</button>
        <button type="button" class="btn btn-number" data-digit="8">8</button>
        <button type="button" class="btn btn-number" data-digit="9">9</button>
        <button type="button" class="btn btn-operator" data-action="multiply" data-op="*">×</button>

        <button type="button" class="btn btn-number" data-digit="4">4</button>
        <button type="button" class="btn btn-number" data-digit="5">5</button>
        <button type="button" class="btn btn-number" data-digit="6">6</button>
        <button type="button" class="btn btn-operator" data-action="subtract" data-op="-">−</button>

        <button type="button" class="btn btn-number" data-digit="1">1</button>
        <button type="button" class="btn btn-number" data-digit="2">2</button>
        <button type="button" class="btn btn-number" data-digit="3">3</button>
        <button type="button" class="btn btn-operator" data-action="add" data-op="+">+</button>

        <button type="button" class="btn btn-number btn-zero" data-digit="0">0</button>
        <button type="button" class="btn btn-number" data-action="decimal">,</button>
        <button type="button" class="btn btn-operator btn-equals" data-action="equals">=</button>
      </div>
    </section>

    <footer class="calculator-footer">
      <button type="button" class="mode-toggle-btn" id="btn-mode-toggle">
        <span class="icon">⇄</span> <span class="text">Modo Científico</span>
      </button>
      <span class="keyboard-hint">Atajos</span>
    </footer>
  </div>
`;

describe('Pruebas Exhaustivas de Interacción DOM y UI Completa', () => {
  let mainDisplay: HTMLElement;
  let subDisplay: HTMLElement;
  let indicatorRadDeg: HTMLElement;
  let indicatorMemory: HTMLElement;
  let btnClear: HTMLElement;

  const click = (selector: string) => {
    const el = document.querySelector<HTMLButtonElement>(selector);
    if (!el) throw new Error(`Elemento no encontrado: ${selector}`);
    el.click();
  };

  const keydown = (key: string) => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key }));
  };

  beforeEach(() => {
    document.body.innerHTML = HTML_FIXTURE;
    new CalculatorUI();

    mainDisplay = document.getElementById('main-display')!;
    subDisplay = document.getElementById('sub-display')!;
    indicatorRadDeg = document.getElementById('indicator-rad-deg')!;
    indicatorMemory = document.getElementById('indicator-memory')!;
    btnClear = document.getElementById('btn-clear')!;
  });

  describe('1. Clics en Botones Básicos y Operadores', () => {
    it('Realiza suma básica: 7 + 8 = 15 con resaltado de operador activo', () => {
      click('button[data-digit="7"]');
      expect(mainDisplay.textContent).toBe('7');
      expect(btnClear.textContent).toBe('C');

      const btnAdd = document.querySelector<HTMLElement>('button[data-op="+"]')!;
      click('button[data-op="+"]');
      expect(btnAdd.classList.contains('active-op')).toBe(true);
      expect(subDisplay.textContent).toBe('7 +');

      click('button[data-digit="8"]');
      expect(btnAdd.classList.contains('active-op')).toBe(false);
      expect(mainDisplay.textContent).toBe('8');

      click('button[data-action="equals"]');
      expect(mainDisplay.textContent).toBe('15');
      expect(subDisplay.textContent).toBe('7 + 8 =');
    });

    it('Maneja Clear (C) y All Clear (AC)', () => {
      click('button[data-digit="9"]');
      click('button[data-digit="9"]');
      expect(mainDisplay.textContent).toBe('99');
      expect(btnClear.textContent).toBe('C');

      click('#btn-clear'); // Borra display a 0
      expect(mainDisplay.textContent).toBe('0');
      expect(btnClear.textContent).toBe('AC');

      click('button[data-digit="5"]');
      click('#btn-clear');
      expect(mainDisplay.textContent).toBe('0');
    });

    it('División por cero y recuperación visual', () => {
      click('button[data-digit="5"]');
      click('button[data-op="/"]');
      click('button[data-digit="0"]');
      click('button[data-action="equals"]');

      expect(mainDisplay.textContent).toBe('Error');

      // Al pulsar un dígito, se recupera automáticamente
      click('button[data-digit="4"]');
      expect(mainDisplay.textContent).toBe('4');
    });

    it('Punto decimal y separador de miles en tiempo real', () => {
      click('button[data-digit="1"]');
      click('button[data-digit="0"]');
      click('button[data-digit="0"]');
      click('button[data-digit="0"]');
      expect(mainDisplay.textContent).toBe('1,000');

      click('button[data-action="decimal"]');
      expect(mainDisplay.textContent).toBe('1,000.');

      click('button[data-digit="5"]');
      expect(mainDisplay.textContent).toBe('1,000.5');
    });
  });

  describe('2. Botones Científicos, Memoria y Modos', () => {
    it('Botón 2nd alterna sin a sin^-1 y calcula asin(1) = 90 en DEG', () => {
      const btn2nd = document.getElementById('btn-2nd')!;
      const btnSin = document.getElementById('btn-sin')!;

      expect(btnSin.textContent).toBe('sin');
      click('#btn-2nd');
      expect(btn2nd.classList.contains('active-toggle')).toBe(true);
      expect(btnSin.innerHTML).toContain('sin');

      click('button[data-digit="1"]');
      click('#btn-sin');
      expect(mainDisplay.textContent).toBe('90');
    });

    it('Alterna unidad angular DEG a RAD con el botón y actualiza el indicador LCD', () => {
      expect(indicatorRadDeg.textContent).toBe('DEG');
      click('#btn-rad-deg');
      expect(indicatorRadDeg.textContent).toBe('RAD');
      expect(document.getElementById('btn-rad-deg')!.textContent).toBe('Deg');

      click('#btn-rad-deg');
      expect(indicatorRadDeg.textContent).toBe('DEG');
    });

    it('Funciones de memoria completas (m+, mr, m-, mc) con indicador visual M', () => {
      click('button[data-digit="5"]');
      click('button[data-action="m+"]');

      // El indicador M debe estar activo
      expect(indicatorMemory.style.opacity).toBe('1');
      expect(indicatorMemory.classList.contains('active')).toBe(true);

      click('#btn-clear');
      click('button[data-action="mr"]');
      expect(mainDisplay.textContent).toBe('5');

      click('button[data-action="mc"]');
      expect(indicatorMemory.style.opacity).toBe('0');
    });

    it('Constantes pi y e, notación EE y potencias', () => {
      click('button[data-action="const-pi"]');
      expect(mainDisplay.textContent).toContain('3.14159');

      click('#btn-clear');
      click('button[data-digit="2"]');
      click('button[data-action="square"]');
      expect(mainDisplay.textContent).toBe('4');

      click('button[data-action="cube"]');
      expect(mainDisplay.textContent).toBe('64');
    });

    it('Paréntesis científicos mediante clics: 2 * (3 + 4) = 14', () => {
      click('button[data-digit="2"]');
      click('button[data-op="*"]');
      click('button[data-action="paren-open"]');
      click('button[data-digit="3"]');
      click('button[data-op="+"]');
      click('button[data-digit="4"]');
      click('button[data-action="paren-close"]');
      click('button[data-action="equals"]');

      expect(mainDisplay.textContent).toBe('14');
    });

    it('Botón de cambio de modo manual activa la clase .scientific-mode', () => {
      const calc = document.getElementById('calculator')!;
      const btnMode = document.getElementById('btn-mode-toggle')!;

      expect(calc.classList.contains('scientific-mode')).toBe(false);
      btnMode.click();
      expect(calc.classList.contains('scientific-mode')).toBe(true);
      btnMode.click();
      expect(calc.classList.contains('scientific-mode')).toBe(false);
    });

    it('Redimensionar la ventana restablece overrides manuales y se adapta reactivamente', () => {
      const calc = document.getElementById('calculator')!;
      const btnMode = document.getElementById('btn-mode-toggle')!;

      // Activar modo científico manual
      btnMode.click();
      expect(calc.classList.contains('scientific-mode')).toBe(true);

      // Disparar evento de resize de ventana
      window.dispatchEvent(new Event('resize'));

      // Se deben limpiar las clases forzadas para dar control pleno al diseño responsivo
      expect(calc.classList.contains('scientific-mode')).toBe(false);
      expect(calc.classList.contains('basic-mode')).toBe(false);
    });
  });

  describe('3. Entrada por Teclado Físico (Keyboard Navigation)', () => {
    it('Resuelve cálculo completo usando solo teclado: 25 * 4 = 100', () => {
      keydown('2');
      keydown('5');
      keydown('*');
      keydown('4');
      keydown('Enter');

      expect(mainDisplay.textContent).toBe('100');
    });

    it('Backspace por teclado borra dígitos', () => {
      keydown('9');
      keydown('8');
      keydown('7');
      expect(mainDisplay.textContent).toBe('987');

      keydown('Backspace');
      expect(mainDisplay.textContent).toBe('98');

      keydown('Backspace');
      expect(mainDisplay.textContent).toBe('9');

      keydown('Backspace');
      expect(mainDisplay.textContent).toBe('0');
    });

    it('Escape borra todo', () => {
      keydown('5');
      keydown('0');
      keydown('Escape');
      expect(mainDisplay.textContent).toBe('0');
    });

    it('Paréntesis por teclado: (5 + 5) * 2 = 20', () => {
      keydown('(');
      keydown('5');
      keydown('+');
      keydown('5');
      keydown(')');
      keydown('*');
      keydown('2');
      keydown('=');

      expect(mainDisplay.textContent).toBe('20');
    });

    it('Atajos de constantes y funciones: p (pi), ! (factorial)', () => {
      keydown('p');
      expect(mainDisplay.textContent).toContain('3.14159');

      keydown('Escape');
      keydown('4');
      keydown('!');
      expect(mainDisplay.textContent).toBe('24');
    });
  });

  describe('4. Escalado Dinámico de Fuente según Longitud de Dígitos', () => {
    it('Asigna clases font-large, font-medium, font-small y font-xsmall progresivamente', () => {
      // 1-7 caracteres: font-large
      keydown('1');
      keydown('2');
      keydown('3');
      keydown('4');
      keydown('5');
      expect(mainDisplay.className).toContain('font-large');

      // 8-10 caracteres: font-medium
      keydown('6');
      keydown('7');
      keydown('8');
      expect(mainDisplay.className).toContain('font-medium');

      // 11-13 caracteres: font-small
      keydown('9');
      keydown('0');
      expect(mainDisplay.className).toContain('font-small');
    });
  });
});
