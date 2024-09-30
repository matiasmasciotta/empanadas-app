import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Pedido {
  gusto: string;
  cantidad: number;
}

interface Amigo {
  nombre: string;
  pedido: Pedido[];
}

interface Historial {
  fechaPedido: Date;
  pedido: Amigo[];
  costoEmpanada: number;
  costoEnvio: number;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css'],
  standalone: true, // Si estás usando componentes independientes
  imports: [CommonModule, FormsModule], // Importa CommonModule y FormsModule
})
export class HistorialComponent implements OnInit {
  historial: Historial[] = [];
  panelOpenState: boolean[] = [];
  historialAEliminarIndex: number | null = null; // Almacena el índice del historial que se desea eliminar
  indexToDelete: number | null = null; // Variable para guardar el índice a eliminar

  ngOnInit() {
    const historialGuardado = localStorage.getItem('historial');
    if (historialGuardado) {
      this.historial = JSON.parse(historialGuardado).sort((a: Historial, b: Historial) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime());
      this.panelOpenState = Array(this.historial.length).fill(false);
    }
  }

  // Calcula el total de empanadas en un pedido
  calcularTotalEmpanadas(pedido: Amigo[]): number {
    let total = 0;
    pedido.forEach(amigo => {
      total += this.calcularTotalEmpanadasAmigo(amigo);
    });
    return total;
  }

  // Calcula el total del pedido (incluyendo costo de envío)
  calcularTotalPedido(historialItem: Historial): number {
    const totalCostos = historialItem.pedido.reduce((total, amigo) => {
      return total + this.calcularCostoEmpanadasAmigo(amigo, historialItem);
    }, 0);
    return totalCostos + historialItem.costoEnvio;
  }

  // Calcula el total de empanadas de un amigo
  calcularTotalEmpanadasAmigo(amigo: Amigo): number {
    return amigo.pedido.reduce((total, p) => total + p.cantidad, 0);
  }

  // Calcula el costo de las empanadas de un amigo
  calcularCostoEmpanadasAmigo(amigo: Amigo, historialItem: Historial): number {
    return amigo.pedido.reduce((total, p) => total + p.cantidad * historialItem.costoEmpanada, 0);
  }

  // Calcula el costo de envío por amigo
  calcularCostoEnvioAmigo(item: Historial): number {
    const cantidadAmigosConPedidos = item.pedido.filter(amigo => amigo.pedido.length > 0).length;
    const costoEnvioTotal = item.costoEnvio;

    return cantidadAmigosConPedidos > 0 ? costoEnvioTotal / cantidadAmigosConPedidos : 0; // Divide el costo total de envío entre los amigos que tienen pedidos
  }

  // Calcula el total que debe pagar un amigo (empanadas + envío)
  calcularTotalAmigo(amigo: any, item: any): number {
    const costoEmpanadas = this.calcularCostoEmpanadasAmigo(amigo, item);
    const costoEnvio = this.calcularCostoEnvioAmigo(item);
    
    return costoEmpanadas + costoEnvio; // Suma el costo de empanadas y el costo de envío
  }


  calcularTotalSinEnvio(item: Historial): number {
    return item.pedido.reduce((total, amigo) => {
      return total + amigo.pedido.reduce((subTotal, pedido) => subTotal + pedido.cantidad * item.costoEmpanada, 0);
    }, 0);
  }

  calcularTotalConEnvio(item: Historial): number {
    const totalSinEnvio = this.calcularTotalSinEnvio(item);
    return totalSinEnvio + item.costoEnvio;
  }

  // Mostrar modal de confirmación para eliminar historial
  confirmarEliminacion(index: number) {
    this.historialAEliminarIndex = index;
  }

  togglePanel(index: number) {
    this.panelOpenState[index] = !this.panelOpenState[index];
  }

  hayPedidosActivos(): boolean {
    return this.historial.length > 0;
  }

  hayPedidosActivosItem(item: any): boolean {
    return item.pedido && item.pedido.length > 0;
  }

  eliminarHistorial() {
    this.historial.splice(this.indexToDelete || 0, 1);
    localStorage.setItem('historial', JSON.stringify(this.historial));
  }



  // Calcula el resumen de gustos y sus cantidades en el pedido
calcularResumenGustos(item: Historial): { gusto: string, cantidad: number }[] {
  const resumen: { [gusto: string]: number } = {};

  item.pedido.forEach(amigo => {
    amigo.pedido.forEach(p => {
      if (resumen[p.gusto]) {
        resumen[p.gusto] += p.cantidad;
      } else {
        resumen[p.gusto] = p.cantidad;
      }
    });
  });

  // Convertimos el objeto en un array de gustos y cantidades
  return Object.keys(resumen).map(gusto => ({
    gusto: gusto,
    cantidad: resumen[gusto]
  }));
}

// Método para formatear el contenido del pedido para compartir
sharePedido(item: Historial) {
  if (!navigator.share) {
    alert('La API de Web Share no está disponible en este navegador.');
    return;
  }

  const fecha = new Date(item.fechaPedido).toLocaleString();
  const totalEmpanadas = this.calcularTotalEmpanadas(item.pedido);
  const totalSinEnvio = this.calcularTotalSinEnvio(item).toLocaleString();
  const costoEnvio = item.costoEnvio.toLocaleString();
  const totalConEnvio = this.calcularTotalConEnvio(item).toLocaleString();

  // Resumen del pedido con gustos y cantidades
  let resumen = 'Resumen del pedido:\n';
  const gustosCantidad = this.contarGustos(item);
  Object.keys(gustosCantidad).forEach(gusto => {
    resumen += `${gustosCantidad[gusto]} empanadas de ${gusto}\n`;
  });

  const shareData = {
    title: `Pedido del ${fecha}`,
    text: `Pedido del ${fecha}\nTotal de empanadas: ${totalEmpanadas}\n${resumen}Costo sin envío: $${totalSinEnvio}\nCosto de envío: $${costoEnvio}\nTotal a pagar: $${totalConEnvio}`,
  };

  // Intentar compartir el contenido
  navigator.share(shareData)
    .then(() => console.log('Pedido compartido con éxito.'))
    .catch((error) => console.error('Error al compartir el pedido:', error));
}

// Método para contar la cantidad de empanadas por gusto en un pedido
contarGustos(item: Historial): { [gusto: string]: number } {
  const gustosCantidad: { [gusto: string]: number } = {};

  item.pedido.forEach(amigo => {
    amigo.pedido.forEach(empanada => {
      if (!gustosCantidad[empanada.gusto]) {
        gustosCantidad[empanada.gusto] = 0;
      }
      gustosCantidad[empanada.gusto] += empanada.cantidad;
    });
  });

  return gustosCantidad;
}

// Método para realizar una llamada
makeCall() {
  const phoneNumber = '45816761';
  window.location.href = `tel:${phoneNumber}`;
}
  
}
