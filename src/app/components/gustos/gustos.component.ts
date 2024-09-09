import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GustosService } from './gustos.service';


@Component({
  selector: 'app-gustos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './gustos.component.html',
  styleUrls: ['./gustos.component.css']
})
export class GustosComponent implements OnInit {
  gustos: string[] = [];
  newGusto: string = '';
  editingGusto: string | null = null;
  editedGusto: string = '';
  defaultGustos: string[] = [];

  constructor(private gustosService: GustosService) {}

  ngOnInit(): void {
    this.gustos = this.gustosService.getGustos();
    this.defaultGustos = this.gustosService.getDefaultGustos();
  }

  addGusto(): void {
    if (this.newGusto && !this.gustos.includes(this.newGusto.toUpperCase())) {
      this.gustosService.addGusto(this.newGusto);
      this.gustos = this.gustosService.getGustos();
      this.newGusto = '';
    }
  }

  editGusto(gusto: string): void {
    this.editingGusto = gusto;
    this.editedGusto = gusto;
  }

  updateGusto(): void {
    if (this.editingGusto && this.editedGusto && !this.defaultGustos.includes(this.editedGusto.toUpperCase())) {
      this.gustosService.updateGusto(this.editingGusto, this.editedGusto);
      this.gustos = this.gustosService.getGustos();
      this.editingGusto = null;
    }
  }

  removeGusto(gusto: string): void {
    if (!this.defaultGustos.includes(gusto.toUpperCase())) {
      this.gustosService.removeGusto(gusto);
      this.gustos = this.gustosService.getGustos();
    }
  }
}
