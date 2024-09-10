import { Component } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { NgClass } from '@angular/common'; // Importa NgClass

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgClass], // Añade NgClass en imports
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'empanadas-app';

  constructor(private router: Router) {}

  isActive(route: string): boolean {
    return this.router.url === route;
  }
}
