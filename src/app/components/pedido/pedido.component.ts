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
  
  // Selecciones para los combos
  amigoSeleccionado: Amigo | null = null;
  gustoSeleccionado: string | null = null;
  
  // Variables para los combos con buscador
  busquedaAmigo: string = '';
  busquedaGusto: string = '';
  amigosFiltrados: Amigo[] = [];
  gustosFiltrados: string[] = [];
  mostrarDropdownAmigos: boolean = false;
  mostrarDropdownGustos: boolean = false;

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
    
    // Ordenar amigos alfabéticamente
    this.amigos.sort((a, b) => a.nombre.localeCompare(b.nombre));
    this.amigosFiltrados = [...this.amigos];
    
    // Si hay una casa previamente seleccionada, mantenerla
    const casaSeleccionadaId = this.localStorageService.getItem('casa-seleccionada');
    if (casaSeleccionadaId) {
      this.casaSeleccionada = this.casasService.getCasaById(casaSeleccionadaId);
      if (this.casaSeleccionada) {
        this.gustosDisponibles = this.casaSeleccionada.gustos.sort();
        this.gustosFiltrados = [...this.gustosDisponibles];
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
      this.gustosDisponibles = this.casaSeleccionada.gustos.sort();
      this.gustosFiltrados = [...this.gustosDisponibles];
      this.localStorageService.setItem('casa-seleccionada', this.casaSeleccionada.id);
    } else {
      this.gustosDisponibles = [];
      this.gustosFiltrados = [];
      this.localStorageService.removeItem('casa-seleccionada');
    }
  }

  // Métodos para los filtros
  filtrarAmigos(): void {
    if (!this.busquedaAmigo.trim()) {
      this.amigosFiltrados = [...this.amigos];
    } else {
      this.amigosFiltrados = this.amigos.filter(amigo => 
        amigo.nombre.toLowerCase().includes(this.busquedaAmigo.toLowerCase())
      );
    }
    this.mostrarDropdownAmigos = true;
  }

  filtrarGustos(): void {
    if (!this.busquedaGusto.trim()) {
      this.gustosFiltrados = [...this.gustosDisponibles];
    } else {
      this.gustosFiltrados = this.gustosDisponibles.filter(gusto => 
        gusto.toLowerCase().includes(this.busquedaGusto.toLowerCase())
      );
    }
    this.mostrarDropdownGustos = true;
  }

  // Nuevos métodos para mejorar el comportamiento de los combos
  mostrarTodosAmigos(): void {
    this.amigosFiltrados = [...this.amigos];
    this.mostrarDropdownAmigos = true;
  }

  mostrarTodosGustos(): void {
    this.gustosFiltrados = [...this.gustosDisponibles];
    this.mostrarDropdownGustos = true;
  }

  limpiarBusquedaAmigo(): void {
    this.busquedaAmigo = '';
    this.amigoSeleccionado = null;
    this.amigosFiltrados = [...this.amigos];
    this.mostrarDropdownAmigos = true;
  }

  limpiarBusquedaGusto(): void {
    this.busquedaGusto = '';
    this.gustoSeleccionado = null;
    this.gustosFiltrados = [...this.gustosDisponibles];
    this.mostrarDropdownGustos = true;
  }

  seleccionarAmigo(amigo: Amigo): void {
    this.amigoSeleccionado = amigo;
    this.busquedaAmigo = amigo.nombre;
    this.mostrarDropdownAmigos = false;
    
    // Limpiar selección de gusto al cambiar de amigo
    this.gustoSeleccionado = null;
    this.busquedaGusto = '';
  }

  seleccionarGusto(gusto: string): void {
    this.gustoSeleccionado = gusto;
    this.busquedaGusto = gusto;
    this.mostrarDropdownGustos = false;
  }

  ocultarDropdownAmigos(): void {
    setTimeout(() => {
      this.mostrarDropdownAmigos = false;
    }, 150);
  }

  ocultarDropdownGustos(): void {
    setTimeout(() => {
      this.mostrarDropdownGustos = false;
    }, 150);
  }

  tieneEmpanadas(amigo: Amigo): boolean {
    return !!(amigo.empanadas && amigo.empanadas.length > 0);
  }

  agregarEmpanada(): void {
    if (!this.casaSeleccionada) {
      alert('Primero selecciona una casa de empanadas');
      return;
    }

    if (!this.amigoSeleccionado) {
      alert('Selecciona un amigo');
      return;
    }

    if (!this.gustoSeleccionado) {
      alert('Selecciona un gusto');
      return;
    }

    if (!this.amigoSeleccionado.empanadas) {
      this.amigoSeleccionado.empanadas = [];
    }

    // Verificar si ya existe ese gusto para el amigo
    const existeGusto = this.amigoSeleccionado.empanadas.find(emp => emp.gusto === this.gustoSeleccionado);
    
    if (existeGusto) {
      existeGusto.cantidad++;
      } else {
      this.amigoSeleccionado.empanadas.push({
        gusto: this.gustoSeleccionado,
        cantidad: 1
      });
    }

    this.amigosService.updateAmigoData(this.amigoSeleccionado);
    this.detectarPedidoActivo(); // Actualizar estado
    
    // Limpiar selecciones
    this.gustoSeleccionado = null;
    this.busquedaGusto = '';
    
    // Actualizar filtros para reflejar el estado "activo"
    this.filtrarAmigos();
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

  getCostoAmigoConEnvio(amigo: Amigo): number {
    const costoEmpanadas = this.getCostoAmigo(amigo);
    const costoEnvioDividido = this.getCostoEnvioPorAmigo();
    return costoEmpanadas + costoEnvioDividido;
  }

  getCostoEnvioPorAmigo(): number {
    if (!this.casaSeleccionada) return 0;
    const amigosConEmpanadas = this.getAmigosConEmpanadas();
    if (amigosConEmpanadas === 0) return 0;
    return this.casaSeleccionada.costoEnvio / amigosConEmpanadas;
  }

  getAmigosConEmpanadas(): number {
    return this.amigos.filter(amigo => 
      amigo.empanadas && amigo.empanadas.length > 0
    ).length;
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

  getResumenPorSabores(): { gusto: string, cantidad: number }[] {
    const resumen: { [gusto: string]: number } = {};
    
    this.amigos.forEach(amigo => {
      if (amigo.empanadas) {
        amigo.empanadas.forEach(empanada => {
          if (resumen[empanada.gusto]) {
            resumen[empanada.gusto] += empanada.cantidad;
          } else {
            resumen[empanada.gusto] = empanada.cantidad;
          }
        });
      }
    });

    return Object.keys(resumen)
      .map(gusto => ({ gusto, cantidad: resumen[gusto] }))
      .sort((a, b) => b.cantidad - a.cantidad); // Ordenar por cantidad descendente
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
        resumen += `  Subtotal empanadas: $${this.getCostoAmigo(amigo)}\n`;
        if (this.getCostoEnvioPorAmigo() > 0) {
          resumen += `  Envío: $${Math.round(this.getCostoEnvioPorAmigo())}\n`;
          resumen += `  Total: $${Math.round(this.getCostoAmigoConEnvio(amigo))}\n`;
        }
        resumen += `\n`;
      }
    });

    resumen += `Total empanadas: ${this.getTotalEmpanadas()}\n`;
    resumen += `Subtotal: $${this.getTotalSinEnvio()}\n`;
    resumen += `Envío: $${this.getCostoEnvio()} (dividido entre ${this.getAmigosConEmpanadas()} personas)\n`;
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
        empanadas: amigo.empanadas || [],
        costoEmpanadas: this.getCostoAmigo(amigo),
        costoEnvio: this.getCostoEnvioPorAmigo(),
        costoTotal: this.getCostoAmigoConEnvio(amigo)
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
