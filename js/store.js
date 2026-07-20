export const objetoEstado = {
    ingresoTotal: 0,
    gastos: [], // Cada gasto será: { id: "uuid", descripcion: "", monto: 0, fecha: "", categoria: "" }
    filtroActivo: "todos"
};
// funcion para guardar en el localstorage
export function guardarEstado() { 
    localStorage.setItem("RASTREADOR_GASTOS_DATA", JSON.stringify(objetoEstado));
}
/* funcion que recibe el objeto con los datos del formulario y genera un nuevo objeto con un id nuevo y se lo añade al arreglo gastos del objetoEstado */
export function crearGasto(objetoDataForm){
    const nuevoGasto = {
        id: crypto.randomUUID(), //se genera una id unica del navegador 
        descripcion: objetoDataForm.descripcion,
        monto: Number(objetoDataForm.monto),
        fecha: objetoDataForm.fecha,
        categoria: objetoDataForm.categoria
    }
    objetoEstado.gastos.push(nuevoGasto); 
    guardarEstado();
}
export function reiniciarPresupuesto() {
  objetoEstado.ingresoTotal = 0;
  objetoEstado.gastos = [];
  objetoEstado.filtroActivo = "todos";
  guardarEstado();
}

export function cargarEstado() {
    const existeEstado = localStorage.getItem("RASTREADOR_GASTOS_DATA");
    if(existeEstado){
          const datosParceados = JSON.parse(existeEstado);
          objetoEstado.ingresoTotal = datosParceados.ingresoTotal;
          objetoEstado.gastos = datosParceados.gastos;
    } 
}

export function calcularResumen() {
  // 1. Calculo de la suma
  const totalGastado = objetoEstado.gastos.reduce((acumulador, gasto) => {
    return acumulador + gasto.monto;
  }, 0);

  // 2. Calculo del saldo disponible
  const saldoDisponible = objetoEstado.ingresoTotal - totalGastado;

  // 3. Prevenimos NaN o Infinity si el ingreso es 0
  const porcentajeConsumido = objetoEstado.ingresoTotal > 0 
    ? (totalGastado / objetoEstado.ingresoTotal) * 100 
    : 0;

  // 4. Retornamos el objeto limpio
  return {
    totalGastado,
    saldoDisponible,
    porcentajeConsumido
  };
}