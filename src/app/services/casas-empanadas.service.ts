import { Injectable } from '@angular/core';
import { CasaEmpanadas, CasaEmpanadasService } from '../models/casa-empanadas';

@Injectable({
  providedIn: 'root'
})
export class CasasEmpanadasService {
  private readonly STORAGE_KEY = 'casas-empanadas';

  constructor() {
    this.initializeCasas();
  }

  private initializeCasas(): void {
    const casas = this.getCasas();
    
    // Solo migrar casas existentes que no tengan precios, no crear casa por defecto
    if (casas.length > 0) {
      let needsUpdate = false;
      casas.forEach(casa => {
        if (!casa.precioEmpanada) {
          casa.precioEmpanada = 1800; // Precio por defecto
          needsUpdate = true;
        }
        if (!casa.costoEnvio) {
          casa.costoEnvio = 500; // Costo por defecto
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        this.saveCasas(casas);
      }
    }
    // Si no hay casas, simplemente no hacer nada - dejar vacío
  }

  getCasas(): CasaEmpanadas[] {
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
  }

  getCasaById(id: string): CasaEmpanadas | null {
    const casas = this.getCasas();
    return casas.find(casa => casa.id === id) || null;
  }

  addCasa(casa: CasaEmpanadas): void {
    const casas = this.getCasas();
    
    // Verificar que no exista una casa con el mismo nombre
    if (casas.find(c => c.nombre.toLowerCase() === casa.nombre.toLowerCase())) {
      return; // No agregar duplicados
    }

    // Asignar ID y color si no los tiene
    if (!casa.id) {
      casa.id = CasaEmpanadasService.generarId();
    }
    if (!casa.color) {
      casa.color = CasaEmpanadasService.generarColor();
    }

    // Asignar precios por defecto si no los tiene
    if (!casa.precioEmpanada) {
      casa.precioEmpanada = 1800;
    }
    if (!casa.costoEnvio) {
      casa.costoEnvio = 500;
    }

    casas.push(casa);
    this.saveCasas(casas);
  }

  updateCasa(casa: CasaEmpanadas): void {
    const casas = this.getCasas();
    const index = casas.findIndex(c => c.id === casa.id);
    
    if (index > -1) {
      casas[index] = casa;
      this.saveCasas(casas);
    }
  }

  deleteCasa(id: string): void {
    const casas = this.getCasas();
    const filtered = casas.filter(c => c.id !== id);
    this.saveCasas(filtered);
  }

  addGustoToCasa(casaId: string, gusto: string): void {
    const casas = this.getCasas();
    const casa = casas.find(c => c.id === casaId);
    
    if (casa && !casa.gustos.includes(gusto)) {
      casa.gustos.push(gusto);
      this.saveCasas(casas);
    }
  }

  removeGustoFromCasa(casaId: string, gusto: string): void {
    const casas = this.getCasas();
    const casa = casas.find(c => c.id === casaId);
    
    if (casa) {
      casa.gustos = casa.gustos.filter(g => g !== gusto);
      this.saveCasas(casas);
    }
  }

  private saveCasas(casas: CasaEmpanadas[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(casas));
  }
} 