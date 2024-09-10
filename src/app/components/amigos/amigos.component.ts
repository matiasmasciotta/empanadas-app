import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AmigosService } from './amigos.service';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Amigo } from '../../models/amigo';

@Component({
  selector: 'app-amigos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './amigos.component.html',
  styleUrls: ['./amigos.component.css']
})
export class AmigosComponent implements OnInit {
  amigos: Amigo[] = [];
  newAmigo: Amigo = new Amigo('', []);
  editingAmigo: Amigo | null = null;
  showEditModal: boolean = false;

  constructor(private amigosService: AmigosService) {}

  ngOnInit(): void {
    this.amigos = this.amigosService.getAmigos();
  }

  addAmigo(): void {
    if (this.newAmigo.nombre && !this.amigos.find(a => a.nombre.toUpperCase() === this.newAmigo.nombre.toUpperCase())) {
      this.amigosService.addAmigo(this.newAmigo);
      this.amigos = this.amigosService.getAmigos();
      this.newAmigo = new Amigo('', []);
    }
  }

  openEditModal(amigo: Amigo): void {
    this.editingAmigo = amigo;
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.editingAmigo = null;
  }

  updateAmigo(newAmigo: Amigo): void {
    if (this.editingAmigo) {
      this.amigosService.updateAmigo(this.editingAmigo.nombre, newAmigo);
      this.amigos = this.amigosService.getAmigos();
      this.closeEditModal();
    }
  }

  removeAmigo(nombre: string): void {
    this.amigosService.removeAmigo(nombre);
    this.amigos = this.amigosService.getAmigos();
  }

  // Nueva función para verificar si un amigo tiene pedidos activos
  hasActivePedidos(amigo: Amigo): boolean {
    return amigo.pedidos && amigo.pedidos.length > 0;
  }
}
