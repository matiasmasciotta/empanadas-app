import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModalComponent } from '../../shared/modal/modal.component';
import { CasaEmpanadas } from '../../models/casa-empanadas';
import { CasasEmpanadasService } from '../../services/casas-empanadas.service';

@Component({
  selector: 'app-gustos',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './gustos.component.html',
  styleUrls: ['./gustos.component.css']
})
export class GustosComponent implements OnInit {
  casasEmpanadas: CasaEmpanadas[] = [];
  
  // Variables para gestión de casas
  showCasaModal: boolean = false;
  editingCasa: CasaEmpanadas | null = null;
  newCasaNombre: string = '';
  newCasaTelefono: string = '';
  newCasaPrecioEmpanada: number = 1800;
  newCasaCostoEnvio: number = 500;
  
  // Variables para gestión de gustos
  showGustoModal: boolean = false;
  selectedCasaId: string = '';
  newGusto: string = '';
  editingGusto: string | null = null;
  
  // Variables para UI
  expandedCasas: Set<string> = new Set();

  constructor(private casasService: CasasEmpanadasService) {}

  ngOnInit(): void {
    this.loadCasas();
  }

  private loadCasas(): void {
    this.casasEmpanadas = this.casasService.getCasas();
    // Expandir la primera casa por defecto
    if (this.casasEmpanadas.length > 0) {
      this.expandedCasas.add(this.casasEmpanadas[0].id);
    }
  }

  // ==================== GESTIÓN DE CASAS ====================
  
  openCasaModal(casa?: CasaEmpanadas): void {
    this.editingCasa = casa || null;
    this.newCasaNombre = casa?.nombre || '';
    this.newCasaTelefono = casa?.telefono || '';
    this.newCasaPrecioEmpanada = casa?.precioEmpanada || 1800;
    this.newCasaCostoEnvio = casa?.costoEnvio || 500;
    this.showCasaModal = true;
  }

  closeCasaModal(): void {
    this.showCasaModal = false;
    this.editingCasa = null;
    this.newCasaNombre = '';
    this.newCasaTelefono = '';
    this.newCasaPrecioEmpanada = 1800;
    this.newCasaCostoEnvio = 500;
  }

  saveCasa(): void {
    if (!this.newCasaNombre.trim() || this.newCasaPrecioEmpanada <= 0) return;

    if (this.editingCasa) {
      // Editar casa existente
      const casaActualizada: CasaEmpanadas = {
        ...this.editingCasa,
        nombre: this.newCasaNombre.trim(),
        telefono: this.newCasaTelefono.trim() || undefined,
        precioEmpanada: this.newCasaPrecioEmpanada,
        costoEnvio: this.newCasaCostoEnvio
      };
      this.casasService.updateCasa(casaActualizada);
    } else {
      // Crear nueva casa
      const nuevaCasa: CasaEmpanadas = {
        id: '',
        nombre: this.newCasaNombre.trim(),
        telefono: this.newCasaTelefono.trim() || undefined,
        gustos: [],
        precioEmpanada: this.newCasaPrecioEmpanada,
        costoEnvio: this.newCasaCostoEnvio
      };
      this.casasService.addCasa(nuevaCasa);
    }

    this.loadCasas();
    this.closeCasaModal();
  }

  deleteCasa(casa: CasaEmpanadas): void {
    if (this.casasEmpanadas.length <= 1) {
      alert('Debe haber al menos una casa de empanadas');
      return;
    }
    
    if (confirm(`¿Eliminar la casa "${casa.nombre}"? Esto eliminará todos sus gustos.`)) {
      this.casasService.deleteCasa(casa.id);
      this.loadCasas();
    }
  }

  // ==================== GESTIÓN DE GUSTOS ====================

  openGustoModal(casaId: string, gusto?: string): void {
    this.selectedCasaId = casaId;
    this.editingGusto = gusto || null;
    this.newGusto = gusto || '';
    this.showGustoModal = true;
  }

  closeGustoModal(): void {
    this.showGustoModal = false;
    this.selectedCasaId = '';
    this.editingGusto = null;
    this.newGusto = '';
  }

  saveGusto(): void {
    if (!this.newGusto.trim() || !this.selectedCasaId) return;

    const casa = this.casasEmpanadas.find(c => c.id === this.selectedCasaId);
    if (!casa) return;

    if (this.editingGusto) {
      // Editar gusto existente
      const index = casa.gustos.indexOf(this.editingGusto);
      if (index > -1) {
        casa.gustos[index] = this.newGusto.trim();
        this.casasService.updateCasa(casa);
      }
    } else {
      // Agregar nuevo gusto
      this.casasService.addGustoToCasa(this.selectedCasaId, this.newGusto.trim());
    }

    this.loadCasas();
    this.closeGustoModal();
  }

  deleteGusto(casaId: string, gusto: string): void {
    if (confirm(`¿Eliminar el gusto "${gusto}"?`)) {
      this.casasService.removeGustoFromCasa(casaId, gusto);
      this.loadCasas();
    }
  }

  // ==================== UTILIDADES UI ====================

  toggleCasa(casaId: string): void {
    if (this.expandedCasas.has(casaId)) {
      this.expandedCasas.delete(casaId);
    } else {
      this.expandedCasas.add(casaId);
    }
  }

  isCasaExpanded(casaId: string): boolean {
    return this.expandedCasas.has(casaId);
  }

  getCasaById(id: string): CasaEmpanadas | null {
    return this.casasEmpanadas.find(c => c.id === id) || null;
  }
}

