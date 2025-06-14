import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AmigosService } from './amigos.service';
import { ModalComponent } from '../../shared/modal/modal.component';
import { Amigo } from '../../models/amigo';
import { GrupoPago } from '../../models/grupo-pago';

@Component({
  selector: 'app-amigos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './amigos.component.html',
  styleUrls: ['./amigos.component.css']
})
export class AmigosComponent implements OnInit {
  amigos: Amigo[] = [];
  gruposPago: GrupoPago[] = [];
  newAmigo: Amigo = new Amigo('', []);
  editingAmigo: Amigo | null = null;
  showEditModal: boolean = false;
  
  // Variables para grupos de pago
  showGrupoModal: boolean = false;
  editingGrupo: GrupoPago | null = null;
  nuevoGrupoNombre: string = '';
  miembrosSeleccionados: string[] = [];
  pagadorSeleccionado: string = '';
  amigosDisponibles: Amigo[] = [];

  constructor(private amigosService: AmigosService) {}

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.amigos = this.amigosService.getAmigos();
    this.gruposPago = this.amigosService.getGruposPago();
  }

  addAmigo(): void {
    if (this.newAmigo.nombre && !this.amigos.find(a => a.nombre.toUpperCase() === this.newAmigo.nombre.toUpperCase())) {
      this.amigosService.addAmigo(this.newAmigo);
      this.loadData();
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
      this.loadData();
      this.closeEditModal();
    }
  }

  removeAmigo(nombre: string): void {
    this.amigosService.removeAmigo(nombre);
    this.loadData();
  }

  hasActivePedidos(amigo: Amigo): boolean {
    return amigo.pedidos && amigo.pedidos.length > 0;
  }

  // Métodos para grupos de pago
  openGrupoModal(grupo?: GrupoPago): void {
    this.editingGrupo = grupo || null;
    if (grupo) {
      this.nuevoGrupoNombre = grupo.nombre;
      this.miembrosSeleccionados = [...grupo.miembros];
      this.pagadorSeleccionado = grupo.pagador;
      this.amigosDisponibles = this.amigosService.getAmigosDisponiblesParaGrupo(grupo.id);
    } else {
      this.nuevoGrupoNombre = '';
      this.miembrosSeleccionados = [];
      this.pagadorSeleccionado = '';
      this.amigosDisponibles = this.amigosService.getAmigosDisponiblesParaGrupo();
    }
    this.showGrupoModal = true;
  }

  closeGrupoModal(): void {
    this.showGrupoModal = false;
    this.editingGrupo = null;
    this.nuevoGrupoNombre = '';
    this.miembrosSeleccionados = [];
    this.pagadorSeleccionado = '';
    this.amigosDisponibles = [];
  }

  toggleMiembro(nombreAmigo: string): void {
    const index = this.miembrosSeleccionados.indexOf(nombreAmigo);
    if (index > -1) {
      this.miembrosSeleccionados.splice(index, 1);
      // Si era el pagador, limpiar la selección
      if (this.pagadorSeleccionado === nombreAmigo) {
        this.pagadorSeleccionado = '';
      }
    } else {
      this.miembrosSeleccionados.push(nombreAmigo);
    }
  }

  isMiembroSeleccionado(nombreAmigo: string): boolean {
    return this.miembrosSeleccionados.includes(nombreAmigo);
  }

  saveGrupo(): void {
    if (this.nuevoGrupoNombre && this.miembrosSeleccionados.length >= 2 && this.pagadorSeleccionado) {
      if (this.editingGrupo) {
        this.amigosService.updateGrupoPago(
          this.editingGrupo.id,
          this.nuevoGrupoNombre,
          this.miembrosSeleccionados,
          this.pagadorSeleccionado
        );
      } else {
        this.amigosService.addGrupoPago(
          this.nuevoGrupoNombre,
          this.miembrosSeleccionados,
          this.pagadorSeleccionado
        );
      }
      this.loadData();
      this.closeGrupoModal();
    }
  }

  removeGrupo(grupo: GrupoPago): void {
    this.amigosService.removeGrupoPago(grupo.id);
    this.loadData();
  }

  getGrupoDeAmigo(nombreAmigo: string): GrupoPago | null {
    return this.amigosService.getGrupoDeAmigo(nombreAmigo);
  }

  getAmigosIndividuales(): Amigo[] {
    return this.amigos.filter(amigo => !this.getGrupoDeAmigo(amigo.nombre));
  }
}
