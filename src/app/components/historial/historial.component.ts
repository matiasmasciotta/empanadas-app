import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { GrupoPago } from '../../models/grupo-pago';
import { AmigosService } from '../amigos/amigos.service';
import { CasasEmpanadasService } from '../../services/casas-empanadas.service';
import { LocalStorageService } from '../../services/local-storage.service';

interface Pedido {
  gusto: string;
  cantidad: number;
}

interface Amigo {
  nombre: string;
  pedido: Pedido[];
}

interface Historial {
  fechaPedido?: Date;
  fecha?: string;
  pedido?: Amigo[];
  amigos?: any[];
  costoEmpanada?: number;
  costoEnvio?: number;
  casa?: {
    id: string;
    nombre: string;
    telefono?: string;
    precioEmpanada: number;
    costoEnvio: number;
  };
  totales?: {
    empanadas: number;
    subtotal: number;
    envio: number;
    total: number;
  };
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
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class HistorialComponent implements OnInit {
  historial: Historial[] = [];
  panelOpenState: boolean[] = [];
  indexToDelete: number | null = null;

  constructor(
    private amigosService: AmigosService,
    private casasService: CasasEmpanadasService,
    private localStorageService: LocalStorageService,
    private router: Router
  ) {}

  ngOnInit() {
    // Cargar historial antiguo
    const historialGuardado = localStorage.getItem('historial');
    let historialAntiguo: Historial[] = [];
    if (historialGuardado) {
      historialAntiguo = JSON.parse(historialGuardado);
    }

    // Cargar historial nuevo
    const historialesNuevos = localStorage.getItem('historiales');
    let historialNuevo: Historial[] = [];
    if (historialesNuevos) {
      historialNuevo = JSON.parse(historialesNuevos);
    }

    // Combinar y ordenar
    this.historial = [...historialAntiguo, ...historialNuevo].sort((a: Historial, b: Historial) => {
      const fechaA = this.getFecha(a);
      const fechaB = this.getFecha(b);
      return fechaB.getTime() - fechaA.getTime();
    });
    
    this.panelOpenState = Array(this.historial.length).fill(false);
  }

  // Métodos auxiliares para compatibilidad
  private getFecha(item: Historial): Date {
    if (item.fecha) {
      return new Date(item.fecha);
    } else if (item.fechaPedido) {
      return new Date(item.fechaPedido);
    }
    return new Date();
  }

  private getAmigos(item: Historial): Amigo[] {
    if (item.amigos) {
      return item.amigos.map((amigo: any) => ({
        nombre: amigo.nombre,
        pedido: amigo.empanadas ? amigo.empanadas.map((emp: any) => ({
          gusto: emp.gusto,
          cantidad: emp.cantidad
        })) : []
      }));
    } else if (item.pedido) {
      return item.pedido;
    }
    return [];
  }

  private getCostoEmpanada(item: Historial): number {
    if (item.casa) {
      return item.casa.precioEmpanada;
    } else if (item.costoEmpanada) {
      return item.costoEmpanada;
    }
    return 0;
  }

  private getCostoEnvio(item: Historial): number {
    if (item.casa) {
      return item.casa.costoEnvio;
    } else if (item.costoEnvio) {
      return item.costoEnvio;
    }
    return 0;
  }

  // Métodos para la vista
  getFechaDisplay(item: Historial): Date {
    return this.getFecha(item);
  }

  getAmigosDisplay(item: Historial): Amigo[] {
    return this.getAmigos(item);
  }

  getCostoEmpanadeDisplay(item: Historial): number {
    return this.getCostoEmpanada(item);
  }

  getCostoEnvioDisplay(item: Historial): number {
    return this.getCostoEnvio(item);
  }

  getCasaInfo(item: Historial): { id: string, nombre: string, telefono?: string, precioEmpanada: number, costoEnvio: number } | null {
    return item.casa || null;
  }

  // Métodos principales simplificados
  calcularTotalEmpanadas(amigos: Amigo[]): number {
    return amigos.reduce((total, amigo) => {
      return total + amigo.pedido.reduce((subTotal, pedido) => subTotal + pedido.cantidad, 0);
    }, 0);
  }

  calcularTotalSinEnvio(item: Historial): number {
    const amigos = this.getAmigos(item);
    const costoEmpanada = this.getCostoEmpanada(item);
    return amigos.reduce((total, amigo) => {
      return total + amigo.pedido.reduce((subTotal, pedido) => subTotal + pedido.cantidad * costoEmpanada, 0);
    }, 0);
  }

  calcularTotalConEnvio(item: Historial): number {
    const totalSinEnvio = this.calcularTotalSinEnvio(item);
    const costoEnvio = this.getCostoEnvio(item);
    return totalSinEnvio + costoEnvio;
  }

  calcularTotalEmpanadasAmigo(amigo: Amigo): number {
    return amigo.pedido.reduce((total, p) => total + p.cantidad, 0);
  }

  calcularCostoEmpanadasAmigo(amigo: Amigo, historialItem: Historial): number {
    const costoEmpanada = this.getCostoEmpanada(historialItem);
    return amigo.pedido.reduce((total, p) => total + p.cantidad * costoEmpanada, 0);
  }

  calcularTotalAmigo(amigo: Amigo, item: Historial): number {
    const costoEmpanadas = this.calcularCostoEmpanadasAmigo(amigo, item);
    const costoEnvio = this.calcularCostoEnvioSimple(item);
    return costoEmpanadas + costoEnvio;
  }

  calcularCostoEnvioAmigo(item: Historial): number {
    const gruposPago = this.amigosService.getGruposPago();
    const totalUnidadesPago = this.calcularTotalUnidadesPago(item, gruposPago);
    const costoEnvio = this.getCostoEnvio(item);
    return totalUnidadesPago > 0 ? costoEnvio / totalUnidadesPago : 0;
  }

  calcularCostoEnvioSimple(item: Historial): number {
    // Para pedidos nuevos que ya tienen la división calculada
    const amigos = this.getAmigos(item);
    const amigosConPedidos = amigos.filter(amigo => amigo.pedido.length > 0);
    const costoEnvio = this.getCostoEnvio(item);
    return amigosConPedidos.length > 0 ? costoEnvio / amigosConPedidos.length : 0;
  }

  private calcularTotalUnidadesPago(item: Historial, gruposPago: GrupoPago[]): number {
    let totalGrupos = 0;
    let amigosEnGrupos = new Set<string>();
    const amigosItem = this.getAmigos(item);

    // Contar grupos que tienen miembros con pedidos
    gruposPago.forEach(grupo => {
      const miembrosConPedidos = amigosItem.filter(amigo => 
        grupo.miembros.includes(amigo.nombre) && amigo.pedido.length > 0
      );
      if (miembrosConPedidos.length > 0) {
        totalGrupos++;
        miembrosConPedidos.forEach(amigo => amigosEnGrupos.add(amigo.nombre));
      }
    });

    // Contar amigos individuales (no en grupos) con pedidos
    const amigosIndividuales = amigosItem.filter(amigo => 
      !amigosEnGrupos.has(amigo.nombre) && amigo.pedido.length > 0
    ).length;

    return totalGrupos + amigosIndividuales;
  }

  // Calcula los grupos y amigos individuales para un pedido específico
  getGruposYAmigosIndividuales(item: Historial): { grupos: GrupoCalculado[], individuales: Amigo[] } {
    const gruposPago = this.amigosService.getGruposPago();
    const grupos: GrupoCalculado[] = [];
    const individuales: Amigo[] = [];
    const amigosItem = this.getAmigos(item);

    // Crear un mapa de amigos procesados para evitar duplicados
    const amigosProcessados = new Set<string>();

    // Calcular el costo de envío por unidad de pago (grupos + individuales)
    const totalUnidadesPago = this.calcularTotalUnidadesPago(item, gruposPago);
    const costoEnvioItem = this.getCostoEnvio(item);
    const costoEnvioPorUnidad = totalUnidadesPago > 0 ? costoEnvioItem / totalUnidadesPago : 0;

    // Procesar grupos
    gruposPago.forEach(grupo => {
      const miembrosDelGrupo = amigosItem.filter(amigo => 
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
    amigosItem.forEach(amigo => {
      if (!amigosProcessados.has(amigo.nombre) && amigo.pedido.length > 0) {
        individuales.push(amigo);
      }
    });

    return { grupos, individuales };
  }

  calcularResumenGustos(item: Historial): { gusto: string, cantidad: number }[] {
    const resumen: { [gusto: string]: number } = {};
    const amigos = this.getAmigos(item);
    
    amigos.forEach(amigo => {
      amigo.pedido.forEach(pedido => {
        if (resumen[pedido.gusto]) {
          resumen[pedido.gusto] += pedido.cantidad;
        } else {
          resumen[pedido.gusto] = pedido.cantidad;
        }
      });
    });

    return Object.keys(resumen)
      .map(gusto => ({ gusto, cantidad: resumen[gusto] }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  togglePanel(index: number) {
    this.panelOpenState[index] = !this.panelOpenState[index];
  }

  hayPedidosActivos(): boolean {
    return this.historial.length > 0;
  }

  hayPedidosActivosItem(item: Historial): boolean {
    const amigos = this.getAmigos(item);
    return amigos.length > 0;
  }

  eliminarHistorial() {
    if (this.indexToDelete !== null) {
      this.historial.splice(this.indexToDelete, 1);
      this.panelOpenState.splice(this.indexToDelete, 1);
      
      // Guardar ambos formatos por compatibilidad
      const historialAntiguo = this.historial.filter(item => item.fechaPedido);
      const historialNuevo = this.historial.filter(item => item.fecha);
      
      if (historialAntiguo.length > 0) {
        localStorage.setItem('historial', JSON.stringify(historialAntiguo));
      }
      if (historialNuevo.length > 0) {
        localStorage.setItem('historiales', JSON.stringify(historialNuevo));
      }
      
      this.indexToDelete = null;
    }
  }

  sharePedido(item: Historial) {
    const fecha = this.getFecha(item).toLocaleString();
    const amigos = this.getAmigos(item);
    const totalEmpanadas = this.calcularTotalEmpanadas(amigos);
    const totalSinEnvio = this.calcularTotalSinEnvio(item);
    const costoEnvio = this.getCostoEnvio(item);
    const totalConEnvio = this.calcularTotalConEnvio(item);
    const casaInfo = this.getCasaInfo(item);

    let mensaje = `📋 PEDIDO DE EMPANADAS\n`;
    mensaje += `📅 Fecha: ${fecha}\n`;
    
    if (casaInfo) {
      mensaje += `🏪 Casa: ${casaInfo.nombre}\n`;
      if (casaInfo.telefono) {
        mensaje += `📞 Teléfono: ${casaInfo.telefono}\n`;
      }
    }
    
    mensaje += `\n🍥 RESUMEN POR SABORES:\n`;
    const resumenGustos = this.calcularResumenGustos(item);
    resumenGustos.forEach(resumen => {
      mensaje += `• ${resumen.cantidad}x ${resumen.gusto}\n`;
    });

    mensaje += `\n👥 DETALLE POR PERSONA:\n`;
    amigos.forEach(amigo => {
      if (amigo.pedido.length > 0) {
        const totalAmigo = this.calcularTotalEmpanadasAmigo(amigo);
        const costoEmpanadas = this.calcularCostoEmpanadasAmigo(amigo, item);
        const costoEnvioAmigo = this.calcularCostoEnvioSimple(item);
        const costoTotal = costoEmpanadas + costoEnvioAmigo;
        
        mensaje += `\n${amigo.nombre} (${totalAmigo} empanadas):\n`;
        
        amigo.pedido.forEach(pedido => {
          const costoEmpanada = this.getCostoEmpanada(item);
          const subtotal = pedido.cantidad * costoEmpanada;
          mensaje += `  • ${pedido.cantidad}x ${pedido.gusto} = $${subtotal}\n`;
        });
        
        mensaje += `  Subtotal empanadas: $${costoEmpanadas}\n`;
        if (costoEnvioAmigo > 0) {
          mensaje += `  Envío: $${Math.round(costoEnvioAmigo)}\n`;
          mensaje += `  Total: $${Math.round(costoTotal)}\n`;
        }
      }
    });

    mensaje += `\n💰 TOTALES:\n`;
    mensaje += `🍥 Total empanadas: ${totalEmpanadas}\n`;
    mensaje += `💵 Subtotal: $${totalSinEnvio}\n`;
    mensaje += `🚚 Envío: $${costoEnvio}\n`;
    mensaje += `💳 TOTAL: $${totalConEnvio}`;

    if (navigator.share) {
      navigator.share({
        title: 'Pedido de Empanadas',
        text: mensaje
      });
    } else {
      navigator.clipboard.writeText(mensaje).then(() => {
        alert('¡Pedido copiado al portapapeles!');
      }).catch(() => {
        alert(mensaje);
      });
    }
  }

  makeCall() {
    alert('Función de llamada no implementada');
  }

  repetirPedido(item: Historial) {
    if (confirm('¿Repetir este pedido? Se cargará automáticamente en la sección de pedidos y podrás modificarlo.')) {
      try {
        // 1. Limpiar pedido actual
        this.limpiarPedidoActual();

        // 2. Establecer la casa de empanadas
        const casaInfo = this.getCasaInfo(item);
        if (casaInfo) {
          // Buscar la casa en las casas disponibles
          const casaEncontrada = this.casasService.getCasaById(casaInfo.id);
          if (casaEncontrada) {
            this.localStorageService.setItem('casa-seleccionada', casaInfo.id);
          } else {
            // Si la casa no existe, crearla
            const nuevaCasa = {
              id: casaInfo.id,
              nombre: casaInfo.nombre,
              telefono: casaInfo.telefono || '',
              color: '#007bff', // Color por defecto
              precioEmpanada: casaInfo.precioEmpanada,
              costoEnvio: casaInfo.costoEnvio,
              gustos: this.extraerGustosDelPedido(item)
            };
            this.casasService.addCasa(nuevaCasa);
            this.localStorageService.setItem('casa-seleccionada', casaInfo.id);
          }
        }

        // 3. Cargar los pedidos de los amigos
        const amigosHistorial = this.getAmigos(item);
        const amigosActuales = this.amigosService.getAmigos();

        amigosHistorial.forEach(amigoHistorial => {
          // Buscar el amigo en la lista actual
          const amigoActual = amigosActuales.find(a => a.nombre === amigoHistorial.nombre);
          
          if (amigoActual) {
            // Si el amigo existe, agregar sus empanadas
            if (!amigoActual.empanadas) {
              amigoActual.empanadas = [];
            }
            
            // Convertir los pedidos del historial al formato actual
            amigoHistorial.pedido.forEach(pedidoHistorial => {
              amigoActual.empanadas!.push({
                gusto: pedidoHistorial.gusto,
                cantidad: pedidoHistorial.cantidad
              });
            });

            this.amigosService.updateAmigoData(amigoActual);
          } else {
            // Si el amigo no existe, crearlo
            const nuevoAmigo = {
              nombre: amigoHistorial.nombre,
              empanadas: amigoHistorial.pedido.map(pedido => ({
                gusto: pedido.gusto,
                cantidad: pedido.cantidad
              }))
            };
            this.amigosService.addAmigo(nuevoAmigo);
          }
        });

        // 4. Navegar a la sección de pedidos
        this.router.navigate(['/pedido']);
        
        alert('¡Pedido cargado exitosamente! Puedes modificarlo en la sección de pedidos.');

      } catch (error) {
        console.error('Error al repetir pedido:', error);
        alert('Ocurrió un error al cargar el pedido. Por favor, inténtalo de nuevo.');
      }
    }
  }

  private limpiarPedidoActual() {
    // Limpiar empanadas de todos los amigos
    const amigos = this.amigosService.getAmigos();
    amigos.forEach(amigo => {
      amigo.empanadas = [];
      this.amigosService.updateAmigoData(amigo);
    });
    
    // Limpiar casa seleccionada
    this.localStorageService.removeItem('casa-seleccionada');
  }

  private extraerGustosDelPedido(item: Historial): string[] {
    const gustosSet = new Set<string>();
    const amigos = this.getAmigos(item);
    
    amigos.forEach(amigo => {
      amigo.pedido.forEach(pedido => {
        gustosSet.add(pedido.gusto);
      });
    });

    return Array.from(gustosSet);
  }
}
