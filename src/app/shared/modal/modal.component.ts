import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);" aria-labelledby="modalTitle" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="modalTitle">{{ title }}</h5>
            <button type="button" class="btn-close" (click)="closeModal()" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <input [(ngModel)]="content" class="form-control" placeholder="Editar">
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="submitModal()">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./modal.component.css'] // Estilos si los necesitas
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() content: string = '';
  @Output() submit: EventEmitter<string> = new EventEmitter<string>(); // Emitir evento cuando se guarda el gusto
  @Output() close: EventEmitter<void> = new EventEmitter<void>(); // Emitir evento cuando se cierra el modal

  submitModal() {
    this.submit.emit(this.content); // Emitir el nuevo gusto editado
  }

  closeModal() {
    this.close.emit(); // Emitir el evento de cerrar el modal
  }
}
