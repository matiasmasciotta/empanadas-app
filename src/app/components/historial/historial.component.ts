import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Pedido {
  gusto: string;
  cantidad: number;
}

interface Amigo {
  nombre: string;
  pedido: Pedido[];
}

interface Historial {
  fechaPedido: Date;
  pedido: Amigo[];
  costoEmpanada: number;
  costoEnvio: number;
}

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrls: ['./historial.component.css'],
  standalone: true, // Si estás usando componentes independientes
  imports: [CommonModule, FormsModule], // Importa CommonModule y FormsModule
})
export class HistorialComponent implements OnInit {
  historial: Historial[] = [];
  panelOpenState: boolean[] = [];

  ngOnInit() {
    const historialGuardado = localStorage.getItem('historial');
    if (historialGuardado) {
      this.historial = JSON.parse(historialGuardado).sort((a: Historial, b: Historial) => new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime());
      this.panelOpenState = Array(this.historial.length).fill(false);
    }
  }

  togglePanel(index: number) {
    this.panelOpenState[index] = !this.panelOpenState[index];
  }

  // Calcula el total de empanadas en un pedido
  calcularTotalEmpanadas(pedido: Amigo[]): number {
    let total = 0;
    pedido.forEach(amigo => {
      total += this.calcularTotalEmpanadasAmigo(amigo);
    });
    return total;
  }

  // Calcula el total del pedido (incluyendo costo de envío)
  calcularTotalPedido(historialItem: Historial): number {
    const totalCostos = historialItem.pedido.reduce((total, amigo) => {
      return total + this.calcularCostoEmpanadasAmigo(amigo, historialItem);
    }, 0);
    return totalCostos + historialItem.costoEnvio;
  }

  // Calcula el total de empanadas de un amigo
  calcularTotalEmpanadasAmigo(amigo: Amigo): number {
    return amigo.pedido.reduce((total, p) => total + p.cantidad, 0);
  }

  // Calcula el costo de las empanadas de un amigo
  calcularCostoEmpanadasAmigo(amigo: Amigo, historialItem: Historial): number {
    return amigo.pedido.reduce((total, p) => total + p.cantidad * historialItem.costoEmpanada, 0);
  }

  // Calcula el costo de envío por amigo
  calcularCostoEnvioAmigo(historialItem: Historial): number {
    const amigosConPedidos = historialItem.pedido.filter(a => a.pedido.length > 0).length;
    return amigosConPedidos > 0 ? historialItem.costoEnvio / amigosConPedidos : 0;
  }

  // Calcula el total que debe pagar un amigo (empanadas + envío)
  calcularTotalAmigo(amigo: Amigo, historialItem: Historial): number {
    const costoEmpanadas = this.calcularCostoEmpanadasAmigo(amigo, historialItem);
    const costoEnvioAmigo = this.calcularCostoEnvioAmigo(historialItem);
    return costoEmpanadas + costoEnvioAmigo;
  }
}
