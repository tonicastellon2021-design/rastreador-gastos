# Rastreador de Gastos Personales

Aplicación web para registrar gastos diarios, definir un ingreso total y visualizar en tiempo real cuánto queda disponible del presupuesto.

## Demo

🔗 [Ver demo en vivo](https://tonicastellon2021-design.github.io/rastreador-gastos/)

## Funcionalidades

- **Registro de ingreso total**, editable en cualquier momento.
- **Registro de gastos** con descripción, monto, fecha y categoría.
- **Validación de formularios** en tiempo real, con mensajes de error específicos por campo.
- **Reglas de negocio**: no se pueden registrar gastos sin un ingreso cargado, ni gastos que superen el saldo disponible.
- **Saldo disponible** actualizado automáticamente con cada movimiento.
- **Barra de salud del presupuesto**, con tres estados visuales (seguro / advertencia / peligro) según el porcentaje consumido.
- **Filtro de gastos por categoría**: Comida, Transporte, Diversión, Varios.
- **Eliminación de gastos individuales**, con confirmación previa.
- **Reinicio completo del presupuesto** (borra ingreso y gastos), con confirmación previa.
- **Persistencia local**: los datos se guardan en `localStorage` y se mantienen entre sesiones.
- **Diseño responsivo**, mobile-first, con sidebar colapsable en pantallas pequeñas.

## Tecnologías

- HTML5 semántico
- CSS3 (Flexbox, Grid, variables CSS, media queries)
- JavaScript (ES Modules, sin frameworks ni librerías de UI)
- [SweetAlert2](https://sweetalert2.github.io/) para confirmaciones y alertas

## Estructura del proyecto

```
├── index.html
├── css/
│   └── style.css
└── js/
    ├── event.js     # Manejo de eventos y delegación de acciones
    ├── ui.js         # Renderizado y manipulación del DOM
    └── store.js      # Estado de la aplicación y persistencia
```

## Cómo correrlo localmente

Al usar módulos de JavaScript (`type="module"`), el proyecto necesita servirse desde un servidor local (no funciona abriendo `index.html` directamente con doble click, por restricciones de seguridad del navegador ante el protocolo `file://`).

Con la extensión **Live Server** de VS Code, o cualquier servidor estático equivalente:

```bash
# Ejemplo con Python
python -m http.server 5500
```

Luego abrir `http://localhost:5500` en el navegador.

## Notas de diseño

La interfaz sigue un motivo visual de "ticket de recibo" para representar el saldo disponible, con tipografía monoespaciada para todas las cifras monetarias, buscando reforzar la asociación con comprobantes de compra reales.
