import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importar CommonModule
import { FormsModule } from '@angular/forms'; // Necesario para [(ngModel)]

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

  calcularTotalEmpanadasTodos(): number {
    // Suma la cantidad total de empanadas de todos los amigos
    return this.amigos.reduce((total, amigo) => total + this.calcularTotalEmpanadas(amigo), 0);
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
    this.cantidad += 1;
  }

  decrementarCantidad() {
    if (this.cantidad > 1) {
      this.cantidad -= 1;
    }
  }

  // Agregar al final del archivo .ts
  calcularTotalGustos(): { [gusto: string]: number } {
    const totalGustos: { [gusto: string]: number } = {};

    // Recorrer todos los amigos y sus pedidos
    this.amigos.forEach(amigo => {
      amigo.pedido.forEach(pedido => {
        if (totalGustos[pedido.gusto]) {
          totalGustos[pedido.gusto] += pedido.cantidad;
        } else {
          totalGustos[pedido.gusto] = pedido.cantidad;
        }
      });
    });

    return totalGustos;
  }
}
