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

  calcularTotalAmigo(amigo: Amigo): number {
    // Validación para asegurar que pedido siempre sea un array
    if (!amigo.pedido) {
      amigo.pedido = [];
    }

    return amigo.pedido.reduce((total, item) => total + item.cantidad * this.costoPorEmpanada, 0);
  }

  calcularTotalGeneral(): number {
    // Solo contar amigos que tengan al menos un pedido
    return this.amigos
      .filter(amigo => amigo.pedido.length > 0)
      .reduce((total, amigo) => total + this.calcularTotalAmigo(amigo), 0);
  }
}
