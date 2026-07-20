import { $contenedorPrincipal, $overlay, $sidebar, $formGasto, validarForm, renderGastos, contenedorEstadoVacio, eliminarGasto, filtrarGasto, renderSaludPresupuesto, renderResumenFinanciero, manejarGuardarIngreso, manejarReiniciarPresupuesto } from "./ui.js";
import {crearGasto, cargarEstado, objetoEstado, calcularResumen} from "./store.js";

cargarEstado();
const resumen = calcularResumen();
renderResumenFinanciero(resumen);
renderSaludPresupuesto(resumen.porcentajeConsumido);
renderGastos();

//tecla Escape cierra el sidebar SOLO si está abierto
document.addEventListener('keydown', (evento) => {
  const sidebarEstaAbierto = !$sidebar.classList.contains('oculto');

  if (evento.key === 'Escape' && sidebarEstaAbierto) {
    $sidebar.classList.toggle('oculto');
    $overlay.classList.toggle('oculto');
  }
}); 

const $formIngreso = document.querySelector('[data-form="ingreso-total"]');
$formIngreso.addEventListener("submit", (event) => {
  event.preventDefault();
  const botonGuardar = $formIngreso.querySelector('[data-action="guardar-ingreso"]');
  manejarGuardarIngreso(botonGuardar);
});

$contenedorPrincipal.addEventListener("click", (event) => {
    const elementoAccion = event.target.closest('[data-action]');
    if (!elementoAccion) return;
    
    const action = elementoAccion.dataset.action;

    switch(action){
        case "toggle-sidebar": {
            $sidebar.classList.toggle('oculto');
            $overlay.classList.toggle('oculto');
            break;
        }
        case "close-sidebar": {
            $sidebar.classList.add('oculto');
            $overlay.classList.add('oculto');
            break;
        }
        case "eliminar-gasto": {
            const item = event.target.closest('.gasto-item');
            const idItem = item.dataset.id; 
            const descripcionGasto = item.querySelector(".gasto-item__descripcion").textContent; 
            eliminarGasto(idItem, descripcionGasto);
            break;
        }
        case "filtrar": {
            // Busca el botón con el data-categoria aunque hagan clic en un icono interno
            const $boton = event.target.closest("[data-categoria]");
            if (!$boton) break;

            // Remueve 'is-activo' de todos los botones de filtro y se lo pone al actual
            document.querySelectorAll("[data-categoria]").forEach(btn => {
                btn.classList.remove("is-activo");
            });
            $boton.classList.add("is-activo");

            // Obtiene la categoría de forma segura
            const categoria = $boton.dataset.categoria;
            filtrarGasto(categoria);
            break;
        }
        case "guardar-ingreso": {
            manejarGuardarIngreso(elementoAccion);
            break;
        }
        case "reiniciar-presupuesto": {
        manejarReiniciarPresupuesto();
        break;
}
    }
}); 

$formGasto.addEventListener("submit", (event)=>{
    event.preventDefault();
    const inputDescripcion = $formGasto.querySelector('[data-field="descripcion"]');
    const inputMonto = $formGasto.querySelector('[data-field="monto"]');
    const inputFecha = $formGasto.querySelector('[data-field="fecha"]');
    const dataForm = new FormData($formGasto);
    const objetoDataForm = {
        descripcion: dataForm.get("descripcion"),
        monto: Number(dataForm.get("monto")),
        fecha: dataForm.get("fecha"),
        categoria: dataForm.get("categoria") 
    }

    const { saldoDisponible } = calcularResumen();
    // Regla A: No podés gastar si no tenés ingresos cargados
    if (objetoEstado.ingresoTotal <= 0) {
    Swal.fire({
      icon: "error",
      title: "Sin ingreso disponible",
      text: "Primero debés registrar un ingreso total antes de agregar gastos."
    });
    return; // Frenamos la ejecución
  }

  // Regla B: No podés gastar más de lo que te queda disponible
  if (objetoDataForm.monto > saldoDisponible) {
    Swal.fire({
      icon: "warning",
      title: "Saldo insuficiente",
      text: `No podés agregar este gasto de L. ${objetoDataForm.monto.toFixed(2)}. Tu saldo disponible es de solo L. ${saldoDisponible.toFixed(2)}.`
    });
    return; // Frenamos la ejecución
  }
    
   const esValido = validarForm(objetoDataForm, inputDescripcion, inputFecha, inputMonto);
    if(esValido){
        const botonSubmit = $formGasto.querySelector('[data-action="agregar-gasto"]');
        botonSubmit.disabled = true;
        crearGasto(objetoDataForm);
        filtrarGasto(objetoEstado.filtroActivo);
        const resumen = calcularResumen();
        renderResumenFinanciero(resumen);
        renderSaludPresupuesto(resumen.porcentajeConsumido);
        Swal.fire({
        icon: "success",
        title: "Gasto agregado",
        text: `${objetoDataForm.descripcion} se guardó correctamente`,
        timer: 2000,
        showConfirmButton: false
        });

        $formGasto.reset();
        botonSubmit.disabled = false;
    }
});