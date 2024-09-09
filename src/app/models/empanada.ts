export interface Empanada {
  nombre: string;
}

export interface Pedido {
  nombre: string;
  empanadas: { [key: string]: number };
}
