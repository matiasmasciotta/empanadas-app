import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GustosService {
  private defaultGustos: string[] = [
    'CARNE SUAVE',
    'CARNE MOLIDA',
    'POLLO SUAVE',
    'HUMITA',
    'JAMON Y QUESO',
    'ROQUEFORT Y JAMON',
    'CHEESEBURGUER',
    'PANCETA Y CIRUELA'
  ];
  private gustosKey = 'gustos';

  constructor() {
    this.initializeGustos();
  }

  // Asegura que los gustos predeterminados siempre estén en el localStorage
  private initializeGustos(): void {
    let gustos = this.getGustos();
    const missingDefaults = this.defaultGustos.filter(gusto => !gustos.includes(gusto));

    if (missingDefaults.length > 0) {
      gustos = [...gustos, ...missingDefaults];
      this.saveGustos(gustos);
    }
  }

  getGustos(): string[] {
    return JSON.parse(localStorage.getItem(this.gustosKey) || '[]');
  }

  getDefaultGustos(): string[] {
    return this.defaultGustos;
  }

  addGusto(gusto: string): void {
    const gustos = this.getGustos();
    if (!gustos.includes(gusto.toUpperCase())) {
      gustos.push(gusto.toUpperCase());
      this.saveGustos(gustos);
    }
  }

  updateGusto(oldGusto: string, newGusto: string): void {
    const gustos = this.getGustos();
    const index = gustos.indexOf(oldGusto.toUpperCase());
    if (index > -1 && !this.defaultGustos.includes(newGusto.toUpperCase())) {
      gustos[index] = newGusto.toUpperCase();
      this.saveGustos(gustos);
    }
  }

  removeGusto(gusto: string): void {
    const gustos = this.getGustos();
    if (!this.defaultGustos.includes(gusto.toUpperCase())) {
      const index = gustos.indexOf(gusto.toUpperCase());
      if (index > -1) {
        gustos.splice(index, 1);
        this.saveGustos(gustos);
      }
    }
  }

  private saveGustos(gustos: string[]): void {
    localStorage.setItem(this.gustosKey, JSON.stringify(gustos));
  }
}

