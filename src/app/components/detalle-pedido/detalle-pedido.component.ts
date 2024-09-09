import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpanadaService } from '../../empanada.service';

@Component({
  selector: 'app-detalle-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.css']
})
export class DetallePedidoComponent {
  pedidos: any[]; // Asegúrate de que el tipo sea adecuado

  constructor(private empanadaService: EmpanadaService) {
    this.pedidos = this.empanadaService.getPedidos();
  }

  getGustos(empanadas: { [key: string]: number }) {
    return Object.keys(empanadas);
  }

  calcularTotal(pedido: { empanadas: { [key: string]: number } }) {
    return Object.values(pedido.empanadas).reduce((a, b) => a + (b * 100), 0); // Asegúrate de que b sea un número
  }

  calcularTotalGeneral() {
    return this.pedidos.reduce((total, pedido) => total + this.calcularTotal(pedido), 0);
  }
}
