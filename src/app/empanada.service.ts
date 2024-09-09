import { Injectable } from '@angular/core';
import { Empanada, Pedido } from './models/empanada';

@Injectable({
  providedIn: 'root'
})
export class EmpanadaService {
  private empanadas: Empanada[] = JSON.parse(localStorage.getItem('empanadas') || '[]');
  private pedidos: Pedido[] = JSON.parse(localStorage.getItem('pedidos') || '[]');

  getEmpanadas() {
    return this.empanadas;
  }

  addEmpanada(empanada: Empanada) {
    this.empanadas.push(empanada);
    localStorage.setItem('empanadas', JSON.stringify(this.empanadas));
  }

  addPedido(pedido: Pedido) {
    this.pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(this.pedidos));
  }

  getPedidos() {
    return this.pedidos;
  }
}
