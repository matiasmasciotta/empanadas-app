import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]voy
import { Historial } from '../../models/historial';
import { CasaEmpanadas } from '../../models/casa-empanadas';
import { CasasEmpanadasService } from '../../services/casas-empanadas.service';
import { AmigosService } from '../amigos/amigos.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { Amigo } from '../../models/amigo';

@Component({
  selector: 'app-pedido',
  standalone: true, // Si estás usando componentes independientes
  imports: [CommonModule, FormsModule], // Importa CommonModule y FormsModule
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {
  amigos: Amigo[] = [];
  casasEmpanadas: CasaEmpanadas[] = [];
  casaSeleccionada: CasaEmpanadas | null = null;
  gustosDisponibles: string[] = [];
  
  // Estados
  hayPedidoActivo: boolean = false;
  casaActiva: CasaEmpanadas | null = null;

  constructor(
    private casasService: CasasEmpanadasService,
    private amigosService: AmigosService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.detectarPedidoActivo();
  }

  private loadData(): void {
    this.casasEmpanadas = this.casasService.getCasas();
    this.amigos = this.amigosService.getAmigos();
    
    // Si hay una casa previamente seleccionada, mantenerla
    const casaSeleccionadaId = this.localStorageService.getItem('casa-seleccionada');
    if (casaSeleccionadaId) {
      this.casaSeleccionada = this.casasService.getCasaById(casaSeleccionadaId);
      if (this.casaSeleccionada) {
        this.gustosDisponibles = this.casaSeleccionada.gustos;
      }
    }
  }

  private detectarPedidoActivo(): void {
    // Verificar si hay amigos con empanadas solicitadas
    this.hayPedidoActivo = this.amigos.some(amigo => 
      amigo.empanadas && amigo.empanadas.length > 0
    );

    if (this.hayPedidoActivo) {
      // Encontrar la casa activa basada en los pedidos existentes
      const amigoConPedido = this.amigos.find(amigo => 
        amigo.empanadas && amigo.empanadas.length > 0
      );
      
      if (amigoConPedido && amigoConPedido.empanadas && amigoConPedido.empanadas.length > 0) {
        // Buscar la casa que contiene el gusto del primer pedido
        const primerGusto = amigoConPedido.empanadas[0].gusto;
        this.casaActiva = this.casasEmpanadas.find(casa => 
          casa.gustos.includes(primerGusto)
        ) || null;
        
        // Forzar la selección de la casa activa
        if (this.casaActiva) {
          this.casaSeleccionada = this.casaActiva;
          this.gustosDisponibles = this.casaActiva.gustos;
        }
      }
    }
  }

  onCasaChange(): void {
    if (this.hayPedidoActivo) {
      // No permitir cambiar si hay pedidos activos
      this.casaSeleccionada = this.casaActiva;
      alert('No puedes cambiar de casa de empanadas mientras hay pedidos activos. Termina el pedido actual o elimina todas las empanadas solicitadas.');
      return;
    }

    if (this.casaSeleccionada) {
      this.gustosDisponibles = this.casaSeleccionada.gustos;
      this.localStorageService.setItem('casa-seleccionada', this.casaSeleccionada.id);
    } else {
      this.gustosDisponibles = [];
      this.localStorageService.removeItem('casa-seleccionada');
    }
  }

  agregarEmpanada(amigo: Amigo, gusto: string): void {
    if (!this.casaSeleccionada) {
      alert('Primero selecciona una casa de empanadas');
      return;
    }

    if (!amigo.empanadas) {
      amigo.empanadas = [];
    }

    amigo.empanadas.push({
      gusto: gusto,
      cantidad: 1
    });

    this.amigosService.updateAmigoData(amigo);
    this.detectarPedidoActivo(); // Actualizar estado
  }

  eliminarEmpanada(amigo: Amigo, index: number): void {
    if (amigo.empanadas) {
      amigo.empanadas.splice(index, 1);
      this.amigosService.updateAmigoData(amigo);
      this.detectarPedidoActivo(); // Actualizar estado
    }
  }

  aumentarCantidad(amigo: Amigo, index: number): void {
    if (amigo.empanadas && amigo.empanadas[index]) {
      amigo.empanadas[index].cantidad++;
      this.amigosService.updateAmigoData(amigo);
    }
  }

  disminuirCantidad(amigo: Amigo, index: number): void {
    if (amigo.empanadas && amigo.empanadas[index] && amigo.empanadas[index].cantidad > 1) {
      amigo.empanadas[index].cantidad--;
      this.amigosService.updateAmigoData(amigo);
    }
  }

  getTotalEmpanadasAmigo(amigo: Amigo): number {
    if (!amigo.empanadas) return 0;
    return amigo.empanadas.reduce((total, emp) => total + emp.cantidad, 0);
  }

  getCostoAmigo(amigo: Amigo): number {
    if (!amigo.empanadas || !this.casaSeleccionada) return 0;
    const totalEmpanadas = this.getTotalEmpanadasAmigo(amigo);
    return totalEmpanadas * this.casaSeleccionada.precioEmpanada;
  }

  getTotalEmpanadas(): number {
    return this.amigos.reduce((total, amigo) => total + this.getTotalEmpanadasAmigo(amigo), 0);
  }

  getTotalSinEnvio(): number {
    if (!this.casaSeleccionada) return 0;
    return this.getTotalEmpanadas() * this.casaSeleccionada.precioEmpanada;
  }

  getCostoEnvio(): number {
    return this.casaSeleccionada?.costoEnvio || 0;
  }

  getTotalConEnvio(): number {
    return this.getTotalSinEnvio() + this.getCostoEnvio();
  }

  hayAmigosConEmpanadas(): boolean {
    return this.amigos.some(amigo => 
      amigo.empanadas && amigo.empanadas.length > 0
    );
  }

  terminarPedido(): void {
    if (!this.hayAmigosConEmpanadas()) {
      alert('No hay empanadas en el pedido');
      return;
    }

    if (!this.casaSeleccionada) {
      alert('Selecciona una casa de empanadas');
      return;
    }

    const resumen = this.generarResumenPedido();
    
    if (confirm('¿Confirmar el pedido?\n\n' + resumen)) {
      this.guardarEnHistorial();
      this.limpiarPedidoActual();
      alert('¡Pedido confirmado y guardado en el historial!');
    }
  }

  private generarResumenPedido(): string {
    let resumen = `=== RESUMEN DEL PEDIDO ===\n`;
    resumen += `Casa: ${this.casaSeleccionada?.nombre}\n`;
    if (this.casaSeleccionada?.telefono) {
      resumen += `Teléfono: ${this.casaSeleccionada.telefono}\n`;
    }
    resumen += `\n`;

    this.amigos.forEach(amigo => {
      if (amigo.empanadas && amigo.empanadas.length > 0) {
        resumen += `${amigo.nombre}:\n`;
        amigo.empanadas.forEach(emp => {
          resumen += `  - ${emp.gusto} x${emp.cantidad}\n`;
        });
        resumen += `  Subtotal: $${this.getCostoAmigo(amigo)}\n\n`;
      }
    });

    resumen += `Total empanadas: ${this.getTotalEmpanadas()}\n`;
    resumen += `Subtotal: $${this.getTotalSinEnvio()}\n`;
    resumen += `Envío: $${this.getCostoEnvio()}\n`;
    resumen += `TOTAL: $${this.getTotalConEnvio()}`;

    return resumen;
  }

  private guardarEnHistorial(): void {
    if (!this.casaSeleccionada) return;

    const historial = {
      fecha: new Date().toISOString(),
      casa: {
        id: this.casaSeleccionada.id,
        nombre: this.casaSeleccionada.nombre,
        telefono: this.casaSeleccionada.telefono,
        precioEmpanada: this.casaSeleccionada.precioEmpanada,
        costoEnvio: this.casaSeleccionada.costoEnvio
      },
      amigos: this.amigos.filter(amigo => 
        amigo.empanadas && amigo.empanadas.length > 0
      ).map(amigo => ({
        nombre: amigo.nombre,
        empanadas: amigo.empanadas || []
      })),
      totales: {
        empanadas: this.getTotalEmpanadas(),
        subtotal: this.getTotalSinEnvio(),
        envio: this.getCostoEnvio(),
        total: this.getTotalConEnvio()
      }
    };

    const historialesPrevios = JSON.parse(localStorage.getItem('historiales') || '[]');
    historialesPrevios.unshift(historial);
    localStorage.setItem('historiales', JSON.stringify(historialesPrevios));
  }

  private limpiarPedidoActual(): void {
    this.amigos.forEach(amigo => {
      amigo.empanadas = [];
      this.amigosService.updateAmigoData(amigo);
    });
    
    this.casaSeleccionada = null;
    this.gustosDisponibles = [];
    this.localStorageService.removeItem('casa-seleccionada');
    this.detectarPedidoActivo(); // Actualizar estado
  }

  compartirPedido(): void {
    const resumen = this.generarResumenPedido();
    
    if (navigator.share) {
      navigator.share({
        title: 'Pedido de Empanadas',
        text: resumen
      });
    } else {
      // Fallback para navegadores que no soportan Web Share API
      navigator.clipboard.writeText(resumen).then(() => {
        alert('¡Resumen copiado al portapapeles!');
      }).catch(() => {
        // Si no se puede copiar, mostrar en alert
        alert(resumen);
      });
    }
  }
}
