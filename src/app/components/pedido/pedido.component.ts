import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]voy
import { Historial } from '../../models/historial';

interface Amigo {
  nombre: string;
  pedido: Pedido[];
}

interface Pedido {
  gusto: string;
  cantidad: number;
}
@Component({
  selector: 'app-pedido',
  standalone: true, // Si estás usando componentes independientes
  imports: [CommonModule, FormsModule], // Importa CommonModule y FormsModule
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {
  amigos: Amigo[] = [];
  gustos: string[] = [];
  selectedAmigo: Amigo | null = null;
  selectedGusto: string | null = null;
  cantidad: number = 1;
  costoPorEmpanada: number = 1800; // Input editable para el costo de empanadas
  costoEnvio: number = 4000; // Input editable para el costo de envío
  totalEmpanadas: number = 0;
  fechaPedido: any;

  historial: Historial = { fechaPedido: new Date(), pedido: [], costoEmpanada: this.costoPorEmpanada, costoEnvio: this.costoEnvio };

  ngOnInit() {
    const gustosGuardados = localStorage.getItem('gustos');
    const amigosGuardados = localStorage.getItem('amigos');
  
    if (gustosGuardados) {
      this.gustos = JSON.parse(gustosGuardados);
    } else {
      this.gustos = ['Carne', 'Pollo', 'Cheeseburguer', 'Panceta y Ciruela'];
    }
  
    if (amigosGuardados) {
      this.amigos = JSON.parse(amigosGuardados);
      // Asegúrate de que cada amigo tenga un array de pedidos
      this.amigos.forEach(amigo => {
        if (!amigo.pedido) {
          amigo.pedido = [];
        }
      });
    } else {
      this.amigos = [
        { nombre: 'Matias', pedido: [] }, 
        { nombre: 'Marisa', pedido: [] }, 
        { nombre: 'Sara', pedido: [] }
      ];
    }
  }

  agregarPedido() {
    if (this.selectedAmigo && this.selectedGusto && this.cantidad > 0) {
      const pedidoExistente = this.selectedAmigo.pedido.find(p => p.gusto === this.selectedGusto);
      if (pedidoExistente) {
        pedidoExistente.cantidad += this.cantidad;
      } else {
        this.selectedAmigo.pedido.push({ gusto: this.selectedGusto, cantidad: this.cantidad });
      }

      localStorage.setItem('amigos', JSON.stringify(this.amigos));

      this.selectedGusto = null;
      this.cantidad = 1;
    }
  }

  eliminarPedido(amigo: Amigo) {
    if (amigo) {
      amigo.pedido = [];
      localStorage.setItem('amigos', JSON.stringify(this.amigos));
    }
  }

  calcularTotalAmigo(amigo: Amigo): number {
    return amigo.pedido.reduce((total, item) => total + item.cantidad * this.costoPorEmpanada, 0);
  }

  calcularTotalEmpanadas(amigo: Amigo): number {
    return amigo.pedido.reduce((total, item) => total + item.cantidad, 0);
  }

  calcularTotalEmpanadasTodos() {
    let totalEmpanadas = 0;
    
    this.amigos.forEach(amigo => {
      amigo.pedido.forEach(pedido => {
        if (pedido.cantidad > 0) {
          totalEmpanadas += pedido.cantidad;
        }
      });
    });
    
    return totalEmpanadas;
  }

  calcularTotalGeneral(): number {
    // Solo contar amigos que tengan al menos un pedido
    return this.amigos
      .filter(amigo => amigo.pedido && amigo.pedido.length > 0)
      .reduce((total, amigo) => total + this.calcularTotalAmigo(amigo), 0);
  }
  
  calcularProporcionEnvio(amigo: Amigo): number {
    const cantidadConPedidos = this.amigos.filter(a => a.pedido.length > 0).length;
    const proporcionEnvio = cantidadConPedidos > 0 ? this.costoEnvio / cantidadConPedidos : 0;
    return proporcionEnvio;
  }

  calcularProporcionEnvioTotal(): number {
    return this.costoEnvio; // En total no se divide
  }

  incrementarCantidad() {
    this.cantidad++;
  }  

  decrementarCantidad() {
    if (this.cantidad > 0) {
      this.cantidad--;
    }
  }

  // Agregar al final del archivo .ts
  calcularTotalGustos() {
    const totalGustos: { [key: string]: number } = {};
    
    this.amigos.forEach(amigo => {
      amigo.pedido.forEach(pedido => {
        if (pedido.cantidad > 0) {  // Solo contar gustos con cantidad mayor a 0
          if (totalGustos[pedido.gusto]) {
            totalGustos[pedido.gusto] += pedido.cantidad;
          } else {
            totalGustos[pedido.gusto] = pedido.cantidad;
          }
        }
      });
    });
    
    return totalGustos;
  }

  incrementarGustoCantidad(amigo: any, pedido: any) {
    pedido.cantidad++;
  }
  
  decrementarGustoCantidad(amigo: any, pedido: any) {
    if (pedido.cantidad > 0) {
      pedido.cantidad--;
    }
  }

  actualizarLocalStorage() {
    localStorage.setItem('amigos', JSON.stringify(this.amigos));
  }

  confirmarPedido() {
    this.historial = {
      fechaPedido: new Date(),
      pedido: this.amigos,
      costoEmpanada: this.costoPorEmpanada,
      costoEnvio: this.costoEnvio
    };
  
    let actualHistorial = localStorage.getItem('historial');
  
    // Verifica si 'actualHistorial' es null antes de intentar parsearlo
    let arrayHistorial: Historial[] = actualHistorial ? JSON.parse(actualHistorial) : [];
  
    // Agrega el historial actual al array
    arrayHistorial.push(this.historial);
  
    // Actualiza el localStorage con el nuevo historial
    localStorage.setItem('historial', JSON.stringify(arrayHistorial));
  
    console.log(this.historial);
  
    this.resetData();
  }

  resetData() {
    this.amigos = [];
    this.gustos = [];
    this.historial = { fechaPedido: new Date(), pedido: [], costoEmpanada: this.costoPorEmpanada, costoEnvio: this.costoEnvio }; // Inicializa correctamente
    this.selectedAmigo = null;
    this.selectedGusto = null;
    this.cantidad = 1;  // Cambié esto a 1 ya que puede ser confuso empezar con 0
    this.costoPorEmpanada = 1800;
    this.costoEnvio = 4000;
  
    this.totalEmpanadas = 0;
    this.fechaPedido = new Date();
  }
}
