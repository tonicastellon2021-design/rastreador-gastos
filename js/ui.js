export const $contenedorPrincipal = document.querySelector(".app-shell");
export const $sidebar = document.querySelector('[data-el="sidebar"]');
export const $overlay = document.querySelector(".sidebar-overlay");
export const $formGasto = document.querySelector(".form-gasto"); 
export const contenedorEstadoVacio = document.getElementById("contenedor_estado_vacio");
const $spanErrorDescripcion = document.getElementById("spanErrorDescripcion");
const $spanErrorFecha = document.getElementById("spanErrorFecha");
const $spanErrorMonto = document.getElementById("spanErrorMonto");  
const $contenedorLista = document.querySelector(".lista-gastos");
const $contadorMovimientos = document.querySelector(".panel-lista__contador");
const $pSaldoDisponible = document.querySelector('[data-field="saldo-disponible"]');
const $strongIngreso = document.querySelector('[data-field="resumen-ingreso"]');
const $strongGastado = document.querySelector('[data-field="resumen-gastado"]');
import {objetoEstado, guardarEstado, calcularResumen, reiniciarPresupuesto} from "./store.js";

/*funcion que verifica si los datos de el formulario son validos */
export function validarForm(objetoDataForm, inputDescripcion, inputFecha, inputMonto, inputCategoria) {
  let esValido = true;

  // --- Descripción ---
  if (objetoDataForm.descripcion.trim() === "") {
    $spanErrorDescripcion.classList.add("campo__error--visible");
    $spanErrorDescripcion.textContent = "Ingrese la descripción";
    inputDescripcion.classList.add("campo--error");
    esValido = false;
  } else {
    $spanErrorDescripcion.classList.remove("campo__error--visible");
    $spanErrorDescripcion.textContent = "";
    inputDescripcion.classList.remove("campo--error");
  }

  // --- Fecha ---
  if (objetoDataForm.fecha.trim() === "") {
    $spanErrorFecha.classList.add("campo__error--visible");
    $spanErrorFecha.textContent = "Seleccione una fecha";
    inputFecha.classList.add("campo--error");
    esValido = false;
  } else {
    $spanErrorFecha.classList.remove("campo__error--visible");
    $spanErrorFecha.textContent = "";
    inputFecha.classList.remove("campo--error");
  }

  // --- Monto ---
  const montoNumerico = Number(objetoDataForm.monto);
  const $contenedorMonto = inputMonto.closest('.input-currency');

  if (isNaN(montoNumerico) || montoNumerico <= 0) {
    $spanErrorMonto.classList.add("campo__error--visible");
    $spanErrorMonto.textContent = "Ingrese un monto válido mayor a 0";
    $contenedorMonto.classList.add("campo--error");
    esValido = false;
  } else {
    $spanErrorMonto.classList.remove("campo__error--visible");
    $spanErrorMonto.textContent = "";
    $contenedorMonto.classList.remove("campo--error");
  }

  return esValido;
} 

export function renderGastos(lista = objetoEstado.gastos){  
   $contenedorLista.innerHTML = "";
   const template = document.querySelector('[data-template="gasto-item"]');
   if(lista.length <= 0){
     contenedorEstadoVacio.removeAttribute("hidden");
   }
   else {
    contenedorEstadoVacio.setAttribute("hidden", "");
   }
   //
   const cantidad = lista.length;
   // Determina si usar singular o plural según la cantidad para no mostrar "1 movimientos" en la UI
   const textoMovimientos = cantidad === 1 ? "1 movimiento" : `${cantidad} movimientos`;
 
   $contadorMovimientos.textContent = textoMovimientos;

   lista.forEach(gasto =>{
    //creacion del clon
    const clon = template.content.cloneNode(true);

     // Lo  relleno usando los data-field que están ADENTRO del clon
    clon.querySelector('.gasto-item').setAttribute('data-id', gasto.id);
    clon.querySelector('[data-field="categoria"]').textContent = gasto.categoria;
    clon.querySelector('[data-field="categoria"]').classList.add(`badge--${gasto.categoria}`);
    clon.querySelector('[data-field="descripcion"]').textContent = gasto.descripcion;
    clon.querySelector('[data-field="monto"]').textContent = `L. ${gasto.monto.toFixed(2)}`;
    clon.querySelector('[data-field="fecha"]').textContent = gasto.fecha;
    
    // configuro el botón de borrar del clon
    const botonBorrar = clon.querySelector('[data-action="eliminar-gasto"]');
    botonBorrar.setAttribute('data-id', gasto.id);
    
    // inyeccion el clon ya inflado con datos en tu contenedor principal
    $contenedorLista.appendChild(clon);
   })
} 

export function eliminarGasto(idItem, descripcionGasto) {
    Swal.fire({
    title: '¿Estás seguro?',
    text: `Vas a eliminar tu gasto  "${descripcionGasto}". Esta acción no se puede deshacer.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Sí, bórralo',
    cancelButtonText: 'Cancelar'
}).then((result) => {
    if (result.isConfirmed) {

        objetoEstado.gastos = objetoEstado.gastos.filter(gasto => gasto.id !== idItem);  

        guardarEstado();
        filtrarGasto(objetoEstado.filtroActivo);

        const resumen = calcularResumen();
        renderResumenFinanciero(resumen);
        renderSaludPresupuesto(resumen.porcentajeConsumido);

        Swal.fire(
            '¡Eliminado!',
            'El gasto ha sido borrado con éxito.',
            'success'
        );
    }
});
}

export function filtrarGasto(categoria) { 
  // Guardás en el estado global cuál es la categoría seleccionada actualmente
  objetoEstado.filtroActivo = categoria;

  const gastosFiltrados = categoria === "todos"
    ? objetoEstado.gastos
    : objetoEstado.gastos.filter(gasto => gasto.categoria === categoria);

  renderGastos(gastosFiltrados);
}

export function renderResumenFinanciero({ totalGastado, saldoDisponible, porcentajeConsumido }) {
  // Uso  directamente de las variables desestructuradas
  $pSaldoDisponible.textContent = `L. ${saldoDisponible.toFixed(2)}`;
  $strongGastado.textContent = `L. ${totalGastado.toFixed(2)}`;
  $strongIngreso.textContent = `L. ${objetoEstado.ingresoTotal.toFixed(2)}`;
}

export function renderSaludPresupuesto(porcentajeConsumido){
  const $barraRelleno = document.querySelector('[data-el="barra-relleno"]');
  const $textoPorcentaje = document.querySelector('[data-field="salud-porcentaje"]');
  const $mensajeSalud = document.querySelector('[data-field="salud-mensaje"]');

  $barraRelleno.classList.remove('barra-segura', 'barra-advertencia', 'barra-peligro');

  if (porcentajeConsumido < 70) {
    $barraRelleno.classList.add('barra-segura');
    $mensajeSalud.textContent = "Vas bien, seguí así.";
  } else if (porcentajeConsumido < 100) {
    $barraRelleno.classList.add('barra-advertencia');
    $mensajeSalud.textContent = "Cuidado, te estás acercando al límite.";
  } else {
    $barraRelleno.classList.add('barra-peligro');
    $mensajeSalud.textContent = "Te pasaste del presupuesto.";
  }

  $barraRelleno.style.width = `${Math.min(porcentajeConsumido, 100)}%`;
  $textoPorcentaje.textContent = `${Math.round(porcentajeConsumido)}%`;
}

export function manejarGuardarIngreso(elementoAccion) {
  const $form = elementoAccion.closest('[data-form="ingreso-total"]');
  if (!$form) return;

  const $inputIngreso = $form.querySelector('[data-field="ingreso-total"]');
  const valorIngreso = Number($inputIngreso.value);

  // 1. Validación real del número
  if (isNaN(valorIngreso) || valorIngreso <= 0) {
    Swal.fire({
      icon: "error",
      title: "Numero invalido",
      text: "Debes agregar un numero mayor a 0"
    });
    return;
  }

  // 2. Actualizamos estado y guardamos
  objetoEstado.ingresoTotal = valorIngreso;
  guardarEstado();

  // 3. Re-calculamos y re-dibujamos la interfaz completa
  const resumen = calcularResumen();
  renderResumenFinanciero(resumen);
  renderSaludPresupuesto(resumen.porcentajeConsumido);

  // 4. Limpiamos el input
  $inputIngreso.value = "";

  Swal.fire({
    icon: "success",
    title: "Ingreso guardado",
    text: `Tu ingreso total ahora es de L. ${valorIngreso.toFixed(2)}`,
    timer: 2000,
    showConfirmButton: false
  });
}

export function manejarReiniciarPresupuesto() {
  Swal.fire({
    title: '¿Reiniciar todo el presupuesto?',
    text: 'Esto va a borrar tu ingreso total y TODOS los gastos registrados. Esta acción no se puede deshacer.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#B4432F',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sí, reiniciar todo',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      reiniciarPresupuesto();
      filtrarGasto(objetoEstado.filtroActivo);

      const resumen = calcularResumen();
      renderResumenFinanciero(resumen);
      renderSaludPresupuesto(resumen.porcentajeConsumido);

      document.querySelectorAll("[data-categoria]").forEach(btn => btn.classList.remove("is-activo"));
      document.querySelector('[data-categoria="todos"]').classList.add("is-activo");

      Swal.fire(
        'Presupuesto reiniciado',
        'Tu ingreso y todos tus gastos fueron borrados.',
        'success'
      );
    }
  });
}