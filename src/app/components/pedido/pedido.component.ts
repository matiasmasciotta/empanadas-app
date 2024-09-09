import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmpanadaService } from '../../empanada.service';
import { Pedido } from '../../models/empanada';

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css'],
})
export class PedidoComponent {
  pedido: Pedido = {
    nombre: '',
    empanadas: {}
  };

  empanadas = [
    { nombre: 'Carne' },
    { nombre: 'Pollo' },
    { nombre: 'Jamon y Queso' }
  ];

  constructor(private empanadaService: EmpanadaService) {}

  agregarEmpanada(nombre: string) {
    if (this.pedido.empanadas[nombre]) {
      this.pedido.empanadas[nombre]++;
    } else {
      this.pedido.empanadas[nombre] = 1;
    }
  }

  guardarPedido() {
    this.empanadaService.addPedido(this.pedido);  // Asegúrate que el método es addPedido
    this.pedido = { nombre: '', empanadas: {} };
  }
}
