# Calculadora Digital en TypeScript

Calculadora web responsive desarrollada con TypeScript, Vite y CSS nativo. Implementa una interfaz de doble modalidad (básica de 4 columnas y científica de 10 columnas) con estilo visual retro de pantalla digital LCD.

Proyecto desarrollado para el módulo optativo de 2º de Desarrollo de Aplicaciones Web (DAW).

---

## Características Principales

- **Diseño responsive bidireccional**: Se adapta automáticamente en anchura y altura. En pantallas estrechas muestra el modo básico (4 columnas) y en pantallas anchas (>= 720px) o dispositivos móviles en orientación horizontal activa automáticamente el modo científico (10 columnas).
- **Alternancia manual de modo**: Botón inferior que permite alternar entre modo básico y científico de forma manual en cualquier resolución.
- **Funciones científicas**: Operaciones trigonométricas (con selector DEG/RAD y funciones inversas e hiperbólicas), potencias, raíces, logaritmos, constantes (pi, e), notación científica y cálculo de factoriales.
- **Gestión de expresiones y paréntesis**: Evaluación con pila de operaciones, soporte de paréntesis anidados y multiplicación implícita.
- **Control de errores matemáticos**: Manejo de divisiones por cero, raíces de índice par sobre números negativos, tangentes en asíntotas y normalización de precisión en punto flotante (IEEE 754).
- **Navegación por teclado físico**: Soporte completo para teclas numéricas, operadores (+, -, *, /), Enter/igual, Backspace, Escape y atajos de teclado.

---

## Requisitos Previos

- **Node.js**: Versión 18 o superior.
- **npm**: Versión 9 o superior.

---

## Instalación y Ejecución

### 1. Clonar o acceder al directorio del proyecto

```bash
cd Calculadora_TS
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar en modo desarrollo

Inicia el servidor local con recarga rápida:

```bash
npm run dev
```

La aplicación estará disponible por defecto en: `http://localhost:3000`.

### 4. Ejecutar pruebas unitarias e integrales

Ejecuta la suite de pruebas automatizadas con Vitest:

```bash
npm run test
```

Incluye 85 pruebas que validan el motor de cálculo, las funciones científicas, los límites de dominio, la resistencia ante casos límite (stress/fuzzing) y la interacción con el DOM y teclado.

### 5. Compilar para producción

Genera los archivos estáticos optimizados en la carpeta `dist/`:

```bash
npm run build
```

---

## Arquitectura del Proyecto

El código está estructurado siguiendo el principio de responsabilidad única y desacoplamiento entre la lógica de negocio y la interfaz de usuario:

1. **Capa de Dominio (`src/core/`)**:
   - Totalmente independiente del navegador y del DOM.
   - `types.ts`: Definición de tipos de operaciones, estado y constantes.
   - `mathOperations.ts`: Funciones matemáticas puras con normalización de precisión flotante.
   - `CalculatorEngine.ts`: Máquina de estados que gestiona la entrada de dígitos, la pila de operaciones y el historial.

2. **Capa de Interfaz (`src/ui/`)**:
   - `CalculatorUI.ts`: Controlador principal del DOM. Gestiona eventos de ratón, atajos de teclado físico, detección del viewport y sincronización de clases CSS.
   - `DisplayFormatter.ts`: Formateo de números con separadores de miles, redondeo y escalado dinámico de fuente para evitar desbordamientos visuales.

3. **Capa de Estilos (`src/styles/`)**:
   - `main.css`: Variables CSS globales, tipografía y resets.
   - `calculator.css`: Estructura del chasis, pantalla LCD y media queries para el modo básico y científico.
   - `buttons.css`: Estilos visuales de botones numéricos, operadores, funciones y estados activos.

---

## Estructura del Directorio

```
Calculadora_TS/
├── index.html                       # Estructura HTML semántica y accesible
├── package.json                     # Scripts del proyecto y dependencias
├── tsconfig.json                    # Configuración estricta de TypeScript
├── vite.config.ts                   # Configuración de empaquetado de Vite y HappyDOM
├── netlify.toml                     # Configuración de compilación y publicación en Netlify
├── src/
│   ├── main.ts                      # Punto de entrada de la aplicación
│   ├── core/
│   │   ├── types.ts                 # Interfaces y tipos del motor
│   │   ├── mathOperations.ts        # Operaciones matemáticas y corrección de precisión
│   │   └── CalculatorEngine.ts      # Máquina de estados desacoplada del DOM
│   ├── ui/
│   │   ├── CalculatorUI.ts          # Controlador de interfaz, eventos y responsividad
│   │   └── DisplayFormatter.ts      # Formateo numérico y autoescalado de texto
│   ├── styles/
│   │   ├── main.css                 # Variables globales y resets
│   │   ├── calculator.css           # Chasis, pantalla LCD y media queries
│   │   └── buttons.css              # Estilos de botones y estados
│   └── test/
│       ├── engine.test.ts           # 34 pruebas del motor y máquina de estados
│       ├── all_operations.test.ts   # 17 pruebas de operaciones matemáticas puras
│       ├── full_ui_interaction.test.ts # 17 pruebas de integración con DOM y teclado
│       └── stress_and_security.test.ts # 17 pruebas de casos límite, fuzzing y blindaje
```

---

## Despliegue en Netlify

El archivo `netlify.toml` en la raíz define el comando de compilación (`npm run build`) y la carpeta de publicación (`dist`).

### Opción 1: Conexión con Repositorio de GitHub

1. Sube el proyecto a tu cuenta de GitHub:
   ```bash
   git remote add origin git@github.com:TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```
2. Accede a Netlify (app.netlify.com).
3. Selecciona **Add new site** > **Import an existing project** y elige tu repositorio.
4. Netlify detectará automáticamente `netlify.toml` con la configuración:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Pulsa en **Deploy site**. Cada actualización enviada a la rama `main` generará un despliegue automático.

### Opción 2: Despliegue Directo con Netlify Drop

1. Compila el proyecto localmente:
   ```bash
   npm run build
   ```
2. Accede a `app.netlify.com/drop` en tu navegador.
3. Arrastra la carpeta `dist` generada a la zona indicada.
4. El sitio web se publicará de forma inmediata con una URL pública HTTPS.
