export interface CasaEmpanadas {
  id: string;
  nombre: string;
  telefono?: string;
  gustos: string[];
  color?: string; // Para identificación visual
  precioEmpanada: number; // Precio por empanada
  costoEnvio: number; // Costo de envío
}

export class CasaEmpanadasService {
  static generarId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static generarColor(): string {
    const colores = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
      '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD',
      '#00D2D3', '#FF9F43', '#EE5A24', '#0984E3',
      '#6C5CE7', '#A29BFE', '#FD79A8', '#E17055',
      '#74B9FF', '#81ECEC', '#FD79A8', '#FDCB6E'
    ];
    return colores[Math.floor(Math.random() * colores.length)];
  }


} 