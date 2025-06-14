export interface GrupoPago {
  id: string;
  nombre: string;
  miembros: string[]; // nombres de los amigos
  color: string; // color para identificar visualmente el grupo
  pagador: string; // quien paga por el grupo
}

export class GrupoPagoService {
  static generarColor(): string {
    const colores = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
      '#00D2D3', '#FF9F43', '#EE5A24', '#0984E3',
      '#6C5CE7', '#A29BFE', '#FD79A8', '#E17055'
    ];
    return colores[Math.floor(Math.random() * colores.length)];
  }

  static generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
} 