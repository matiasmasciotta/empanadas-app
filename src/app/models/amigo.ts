export interface Empanada {
  gusto: string;
  cantidad: number;
}

export interface Amigo {
  nombre: string;
  empanadas?: Empanada[];
}
