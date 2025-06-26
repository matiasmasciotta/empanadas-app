export class Historial {
    constructor(
        public fechaPedido: Date,
        public pedido: Amigo[],
        public costoEmpanada: number,
        public costoEnvio: number,
        public casaEmpanadas?: {
            id: string;
            nombre: string;
            telefono?: string;
        }
    ) {}
}

interface Amigo {
    nombre: string;
    pedido: Pedido[];
  }
  
  interface Pedido {
    gusto: string;
    cantidad: number;
  }
  