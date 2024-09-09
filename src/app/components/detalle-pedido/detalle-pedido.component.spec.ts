import { Component, OnInit } from '@angular/core';
import { Pedido } from '../../models/empanada';
import { EmpanadaService } from '../../empanada.service';

@Component({
  selector: 'app-detalle-pedido',
  templateUrl: './detalle-pedido.component.html',
  styleUrls: ['./detalle-pedido.component.css']
})
export class DetallePedidoComponent implements OnInit {
  pedidos: Pedido[] = [];
  precioEmpanada: number = 0;

  constructor(private empanadaService: EmpanadaService) {}

  ngOnInit() {
    this.pedidos = this.empanadaService.getPedidos();
  }

  calcularTotal(pedido: Pedido) {
    return Object.values(pedido.empanadas).reduce((a, b) => a + b, 0) * this.precioEmpanada;
  }

  calcularTotalGeneral() {
    return this.pedidos.reduce((total, pedido) => total + this.calcularTotal(pedido), 0);
  }
}
