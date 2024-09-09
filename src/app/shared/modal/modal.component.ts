import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})
export class ModalComponent {
  @Input() title: string = '';
  @Input() content: string = '';
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<string>();

  newValue: string = '';

  ngOnChanges(): void {
    this.newValue = this.content;
  }

  onSubmit(): void {
    this.submit.emit(this.newValue);
  }

  onClose(): void {
    this.close.emit();
  }
}
