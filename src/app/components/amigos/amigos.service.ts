import { Injectable } from '@angular/core';
import { Amigo } from '../../models/amigo';


@Injectable({
  providedIn: 'root'
})
export class AmigosService {
  private amigosKey = 'amigos';

  constructor() {
    this.initializeAmigos();
  }

  private initializeAmigos(): void {
    let amigos = this.getAmigos();
    if (!amigos || amigos.length === 0) {
      amigos = [];
      this.saveAmigos(amigos);
    }
  }

  getAmigos(): Amigo[] {
    return JSON.parse(localStorage.getItem(this.amigosKey) || '[]');
  }

  addAmigo(amigo: Amigo): void {
    const amigos = this.getAmigos();
    if (!amigos.find(a => a.nombre.toUpperCase() === amigo.nombre.toUpperCase())) {
      amigos.push(amigo);
      this.saveAmigos(amigos);
    }
  }

  updateAmigo(oldNombre: string, newAmigo: Amigo): void {
    const amigos = this.getAmigos();
    const index = amigos.findIndex(a => a.nombre.toUpperCase() === oldNombre.toUpperCase());
    if (index > -1) {
      amigos[index] = newAmigo;
      this.saveAmigos(amigos);
    }
  }

  removeAmigo(nombre: string): void {
    const amigos = this.getAmigos();
    const index = amigos.findIndex(a => a.nombre.toUpperCase() === nombre.toUpperCase());
    if (index > -1) {
      amigos.splice(index, 1);
      this.saveAmigos(amigos);
    }
  }

  private saveAmigos(amigos: Amigo[]): void {
    localStorage.setItem(this.amigosKey, JSON.stringify(amigos));
  }
}
