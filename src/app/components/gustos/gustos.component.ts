import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmpanadaService } from '../../empanada.service'; // Añadir este servicio si es necesario

@Component({
  selector: 'app-gustos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './gustos.component.html',
  styleUrls: ['./gustos.component.css']
})
export class GustosComponent {

}
