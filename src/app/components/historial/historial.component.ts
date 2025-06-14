import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrupoPago } from '../../models/grupo-pago';
import { AmigosService } from '../amigos/amigos.service';

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

interface GrupoCalculado {
  grupo: GrupoPago;
  miembros: Amigo[];
  totalEmpanadas: number;
  totalCosto: number;
  totalConEnvio: number;
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

  constructor(private amigosService: AmigosService) {}

  ngOnInit() {
    const historialGuardado = localStorage.getItem('historial');
    if (historialGuardado) {
      this.historial = JSON.parse(historialGuardado).sort((a: Historial, b: Historial) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime());
      this.panelOpenState = Array(this.historial.length).fill(false);
    }
  }

  // Calcula los grupos y amigos individuales para un pedido específico
  getGruposYAmigosIndividuales(item: Historial): { grupos: GrupoCalculado[], individuales: Amigo[] } {
    const gruposPago = this.amigosService.getGruposPago();
    const grupos: GrupoCalculado[] = [];
    const individuales: Amigo[] = [];

    // Crear un mapa de amigos procesados para evitar duplicados
    const amigosProcessados = new Set<string>();

    // Calcular el costo de envío por unidad de pago (grupos + individuales)
    const totalUnidadesPago = this.calcularTotalUnidadesPago(item, gruposPago);
    const costoEnvioPorUnidad = totalUnidadesPago > 0 ? item.costoEnvio / totalUnidadesPago : 0;

    // Procesar grupos
    gruposPago.forEach(grupo => {
      const miembrosDelGrupo = item.pedido.filter(amigo => 
        grupo.miembros.includes(amigo.nombre) && amigo.pedido.length > 0
      );

      if (miembrosDelGrupo.length > 0) {
        const totalEmpanadas = miembrosDelGrupo.reduce((total, amigo) => 
          total + this.calcularTotalEmpanadasAmigo(amigo), 0
        );
        const totalCosto = miembrosDelGrupo.reduce((total, amigo) => 
          total + this.calcularCostoEmpanadasAmigo(amigo, item), 0
        );
        const totalConEnvio = totalCosto + costoEnvioPorUnidad;

        grupos.push({
          grupo,
          miembros: miembrosDelGrupo,
          totalEmpanadas,
          totalCosto,
          totalConEnvio
        });

        // Marcar miembros como procesados
        miembrosDelGrupo.forEach(amigo => amigosProcessados.add(amigo.nombre));
      }
    });

    // Procesar amigos individuales (no en grupos)
    item.pedido.forEach(amigo => {
      if (!amigosProcessados.has(amigo.nombre) && amigo.pedido.length > 0) {
        individuales.push(amigo);
      }
    });

    return { grupos, individuales };
  }

  // Método auxiliar para calcular el total de unidades de pago
  private calcularTotalUnidadesPago(item: Historial, gruposPago: GrupoPago[]): number {
    let totalGrupos = 0;
    let amigosEnGrupos = new Set<string>();

    // Contar grupos que tienen miembros con pedidos
    gruposPago.forEach(grupo => {
      const miembrosConPedidos = item.pedido.filter(amigo => 
        grupo.miembros.includes(amigo.nombre) && amigo.pedido.length > 0
      );
      if (miembrosConPedidos.length > 0) {
        totalGrupos++;
        miembrosConPedidos.forEach(amigo => amigosEnGrupos.add(amigo.nombre));
      }
    });

    // Contar amigos individuales (no en grupos) con pedidos
    const amigosIndividuales = item.pedido.filter(amigo => 
      !amigosEnGrupos.has(amigo.nombre) && amigo.pedido.length > 0
    ).length;

    return totalGrupos + amigosIndividuales;
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

  // Calcula el costo de envío por amigo/grupo
  calcularCostoEnvioAmigo(item: Historial): number {
    const gruposPago = this.amigosService.getGruposPago();
    const totalUnidadesPago = this.calcularTotalUnidadesPago(item, gruposPago);
    return totalUnidadesPago > 0 ? item.costoEnvio / totalUnidadesPago : 0;
  }

  // Calcula el total que debe pagar un amigo (empanadas + envío)
  calcularTotalAmigo(amigo: any, item: any): number {
    const costoEmpanadas = this.calcularCostoEmpanadasAmigo(amigo, item);
    const costoEnvio = this.calcularCostoEnvioAmigo(item);
    
    return costoEmpanadas + costoEnvio;
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
    const { grupos, individuales } = this.getGruposYAmigosIndividuales(item);

    // Construir el mensaje completo con detalles por grupo y amigo
    let mensajeCompleto = `🍥 PEDIDO DE EMPANADAS 🍥\n`;
    mensajeCompleto += `📅 Fecha: ${fecha}\n\n`;

    // Detalles por grupos de pago
    if (grupos.length > 0) {
      mensajeCompleto += `👥 GRUPOS DE PAGO:\n`;
      mensajeCompleto += `${'='.repeat(35)}\n`;
      
      grupos.forEach(grupoCalculado => {
        mensajeCompleto += `\n🔗 ${grupoCalculado.grupo.nombre.toUpperCase()}\n`;
        mensajeCompleto += `💳 Paga: ${grupoCalculado.grupo.pagador}\n`;
        mensajeCompleto += `👥 Miembros:\n`;
        
        grupoCalculado.miembros.forEach(amigo => {
          const totalEmpanadasAmigo = this.calcularTotalEmpanadasAmigo(amigo);
          const costoEmpanadasAmigo = this.calcularCostoEmpanadasAmigo(amigo, item);
          
          mensajeCompleto += `   • ${amigo.nombre} (${totalEmpanadasAmigo} empanadas):\n`;
          amigo.pedido.forEach(pedido => {
            const subtotal = pedido.cantidad * item.costoEmpanada;
            mensajeCompleto += `     - ${pedido.cantidad}x ${pedido.gusto} = $${subtotal.toLocaleString()}\n`;
          });
          mensajeCompleto += `     Subtotal: $${costoEmpanadasAmigo.toLocaleString()}\n`;
        });
        
        mensajeCompleto += `💰 Total empanadas: $${grupoCalculado.totalCosto.toLocaleString()}\n`;
        mensajeCompleto += `🚚 Envío: $${this.calcularCostoEnvioAmigo(item).toLocaleString()}\n`;
        mensajeCompleto += `💳 TOTAL A PAGAR: $${grupoCalculado.totalConEnvio.toLocaleString()}\n`;
        mensajeCompleto += `${'-'.repeat(25)}\n`;
      });
    }

    // Detalles por amigos individuales
    if (individuales.length > 0) {
      mensajeCompleto += `\n👤 AMIGOS INDIVIDUALES:\n`;
      mensajeCompleto += `${'='.repeat(35)}\n`;
      
      individuales.forEach(amigo => {
        const totalEmpanadasAmigo = this.calcularTotalEmpanadasAmigo(amigo);
        const costoEmpanadasAmigo = this.calcularCostoEmpanadasAmigo(amigo, item);
        const totalAmigo = this.calcularTotalAmigo(amigo, item);
        
        mensajeCompleto += `\n👤 ${amigo.nombre.toUpperCase()}\n`;
        mensajeCompleto += `📦 Empanadas (${totalEmpanadasAmigo} unidades):\n`;
        
        amigo.pedido.forEach(pedido => {
          const subtotal = pedido.cantidad * item.costoEmpanada;
          mensajeCompleto += `   • ${pedido.cantidad}x ${pedido.gusto} = $${subtotal.toLocaleString()}\n`;
        });
        
        mensajeCompleto += `💰 Subtotal empanadas: $${costoEmpanadasAmigo.toLocaleString()}\n`;
        mensajeCompleto += `🚚 Envío: $${this.calcularCostoEnvioAmigo(item).toLocaleString()}\n`;
        mensajeCompleto += `💳 TOTAL A PAGAR: $${totalAmigo.toLocaleString()}\n`;
        mensajeCompleto += `${'-'.repeat(25)}\n`;
      });
    }

    // Resumen general del pedido
    mensajeCompleto += `\n📊 RESUMEN GENERAL:\n`;
    mensajeCompleto += `${'='.repeat(35)}\n`;
    
    const gustosCantidad = this.contarGustos(item);
    Object.keys(gustosCantidad).forEach(gusto => {
      mensajeCompleto += `🍥 ${gustosCantidad[gusto]} empanadas de ${gusto}\n`;
    });
    
    mensajeCompleto += `\n📈 TOTALES:\n`;
    mensajeCompleto += `🍥 Total empanadas: ${totalEmpanadas} unidades\n`;
    mensajeCompleto += `💰 Costo empanadas: $${totalSinEnvio}\n`;
    mensajeCompleto += `🚚 Costo de envío: $${costoEnvio}\n`;
    mensajeCompleto += `💳 TOTAL GENERAL: $${totalConEnvio}\n`;
    
    if (grupos.length > 0) {
      mensajeCompleto += `\n💡 RESUMEN DE PAGOS:\n`;
      grupos.forEach(grupoCalculado => {
        mensajeCompleto += `${grupoCalculado.grupo.pagador}: $${grupoCalculado.totalConEnvio.toLocaleString()}\n`;
      });
      individuales.forEach(amigo => {
        const totalAmigo = this.calcularTotalAmigo(amigo, item);
        mensajeCompleto += `${amigo.nombre}: $${totalAmigo.toLocaleString()}\n`;
      });
    }
    
    mensajeCompleto += `\n🍴 ¡Buen provecho! 🍴`;

    const shareData = {
      title: `Pedido de Empanadas - ${fecha}`,
      text: mensajeCompleto,
    };

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
