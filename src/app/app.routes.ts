import { Routes } from '@angular/router';
import { DetallePedidoComponent } from './components/detalle-pedido/detalle-pedido.component';
import { PedidoComponent } from './components/pedido/pedido.component';
import { GustosComponent } from './components/gustos/gustos.component'; 
import { AmigosComponent } from './components/amigos/amigos.component';

export const routes: Routes = [
  { path: '', redirectTo: 'pedido', pathMatch: 'full' },
  { path: 'pedido', component: PedidoComponent },
  { path: 'calcular-total', component: DetallePedidoComponent },
  { path: 'agregar-gustos', component: GustosComponent },
  { path: 'agregar-amigos', component: AmigosComponent },
  { path: '**', redirectTo: '' }
];
