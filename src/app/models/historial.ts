

export class Historial {
    constructor(
        public fechaPedido: Date,
        public pedido: Amigo[]
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
  