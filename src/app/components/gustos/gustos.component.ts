import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GustosService } from './gustos.service';
import { ModalComponent } from '../../shared/modal/modal.component'; // Asegúrate que el modal esté bien referenciado

@Component({
  selector: 'app-gustos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent], // Importa el componente Modal aquí
  templateUrl: './gustos.component.html',
  styleUrls: ['./gustos.component.css']
})
export class GustosComponent implements OnInit {
  gustos: string[] = [];
  newGusto: string = '';
  editingGusto: string | null = null;
  showEditModal: boolean = false; // Variable que controla la visibilidad del modal
  defaultGustos: string[] = [];

  constructor(private gustosService: GustosService) {}

  ngOnInit(): void {
    this.gustos = this.gustosService.getGustos();
    this.defaultGustos = this.gustosService.getDefaultGustos();
  }

  addGusto(): void {
    if (this.newGusto && !this.gustos.includes(this.newGusto.toUpperCase())) {
      this.gustosService.addGusto(this.newGusto);
      this.gustos = this.gustosService.getGustos(); // Actualizamos la lista después de agregar un gusto
      this.newGusto = ''; // Limpiamos el input
    }
  }

  // Abrir el modal con el gusto seleccionado
  openEditModal(gusto: string): void {
    this.editingGusto = gusto;
    this.showEditModal = true;
  }

  // Cerrar el modal
  closeEditModal(): void {
    this.showEditModal = false;
    this.editingGusto = null;
  }

  // Actualizar el gusto seleccionado
  updateGusto(newGusto: string): void {
    if (this.editingGusto && newGusto && !this.defaultGustos.includes(newGusto.toUpperCase())) {
      this.gustosService.updateGusto(this.editingGusto, newGusto);
      this.gustos = this.gustosService.getGustos(); // Refrescamos la lista
      this.closeEditModal(); // Cerramos el modal
    }
  }

  // Eliminar un gusto si no es un gusto predeterminado
  removeGusto(gusto: string): void {
    if (!this.defaultGustos.includes(gusto.toUpperCase())) {
      this.gustosService.removeGusto(gusto);
      this.gustos = this.gustosService.getGustos(); // Actualizamos la lista después de eliminar
    }
  }
}
