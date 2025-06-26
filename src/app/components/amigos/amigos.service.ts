import { Injectable } from '@angular/core';
import { Amigo } from '../../models/amigo';
import { GrupoPago, GrupoPagoService } from '../../models/grupo-pago';


@Injectable({
  providedIn: 'root'
})
export class AmigosService {
  private amigosKey = 'amigos';
  private gruposPagoKey = 'grupos-pago';

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

  updateAmigoData(amigo: Amigo): void {
    const amigos = this.getAmigos();
    const index = amigos.findIndex(a => a.nombre.toUpperCase() === amigo.nombre.toUpperCase());
    if (index > -1) {
      amigos[index] = amigo;
      this.saveAmigos(amigos);
    }
  }

  removeAmigo(nombre: string): void {
    const amigos = this.getAmigos();
    const index = amigos.findIndex(a => a.nombre.toUpperCase() === nombre.toUpperCase());
    if (index > -1) {
      amigos.splice(index, 1);
      this.saveAmigos(amigos);
      
      // También eliminar de todos los grupos de pago
      this.removeAmigoFromAllGroups(nombre);
    }
  }

  private saveAmigos(amigos: Amigo[]): void {
    localStorage.setItem(this.amigosKey, JSON.stringify(amigos));
  }

  // Métodos para grupos de pago
  getGruposPago(): GrupoPago[] {
    return JSON.parse(localStorage.getItem(this.gruposPagoKey) || '[]');
  }

  addGrupoPago(nombre: string, miembros: string[], pagador: string): GrupoPago {
    const grupos = this.getGruposPago();
    const nuevoGrupo: GrupoPago = {
      id: GrupoPagoService.generarId(),
      nombre,
      miembros,
      color: GrupoPagoService.generarColor(),
      pagador
    };
    
    grupos.push(nuevoGrupo);
    this.saveGruposPago(grupos);
    return nuevoGrupo;
  }

  updateGrupoPago(id: string, nombre: string, miembros: string[], pagador: string): void {
    const grupos = this.getGruposPago();
    const index = grupos.findIndex(g => g.id === id);
    if (index > -1) {
      grupos[index] = { ...grupos[index], nombre, miembros, pagador };
      this.saveGruposPago(grupos);
    }
  }

  removeGrupoPago(id: string): void {
    const grupos = this.getGruposPago();
    const index = grupos.findIndex(g => g.id === id);
    if (index > -1) {
      grupos.splice(index, 1);
      this.saveGruposPago(grupos);
    }
  }

  private removeAmigoFromAllGroups(nombreAmigo: string): void {
    const grupos = this.getGruposPago();
    let cambios = false;
    
    grupos.forEach(grupo => {
      if (grupo.miembros && Array.isArray(grupo.miembros)) {
        const indexMiembro = grupo.miembros.indexOf(nombreAmigo);
        if (indexMiembro > -1) {
          grupo.miembros.splice(indexMiembro, 1);
          cambios = true;
          
          // Si era el pagador, asignar el primer miembro como nuevo pagador
          if (grupo.pagador === nombreAmigo && grupo.miembros.length > 0) {
            grupo.pagador = grupo.miembros[0];
          }
        }
      }
    });
    
    // Eliminar grupos que se quedaron sin miembros
    const gruposFiltrados = grupos.filter(g => g.miembros && Array.isArray(g.miembros) && g.miembros.length > 0);
    
    if (cambios) {
      this.saveGruposPago(gruposFiltrados);
    }
  }

  private saveGruposPago(grupos: GrupoPago[]): void {
    localStorage.setItem(this.gruposPagoKey, JSON.stringify(grupos));
  }

  // Métodos de utilidad
  getGrupoDeAmigo(nombreAmigo: string): GrupoPago | null {
    const grupos = this.getGruposPago();
    return grupos.find(g => g.miembros && Array.isArray(g.miembros) && g.miembros.includes(nombreAmigo)) || null;
  }

  getAmigosDisponiblesParaGrupo(grupoId: string = ''): Amigo[] {
    const amigos = this.getAmigos();
    const grupos = this.getGruposPago();
    const grupoActual = grupoId ? grupos.find(g => g.id === grupoId) : null;
    
    return amigos.filter(amigo => {
      const grupoDelAmigo = this.getGrupoDeAmigo(amigo.nombre);
      return !grupoDelAmigo || (grupoActual && grupoDelAmigo.id === grupoActual.id);
    });
  }
}
