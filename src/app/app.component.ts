import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { MigrationService } from './services/migration.service';
import { CasasEmpanadasService } from './services/casas-empanadas.service';
import { AmigosService } from './components/amigos/amigos.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'empanadas-app';
  showConfigMenu = false;

  // Datos de ejemplo que se cargarán
  private datosEjemplo = {
    casasEmpanadas: [
      {
        id: 'mi-gusto',
        nombre: 'Mi Gusto',
        telefono: '1134567890',
        gustos: [
          'Big Burger',
          'Matambre a la Pizza',
          'American Chicken',
          'Mexican Veggie',
          'Doble Bacon Cheese Burger',
          'Mexican Pibil Pork',
          'Calabaza',
          'Carne al Cuchillo',
          'Carne con Aceituna',
          'Carne Picante',
          'Carne Suave',
          'Choclo',
          'Cuatro Quesos',
          'Jamon y Queso',
          'Jamon, Huevo y Queso',
          'Jamon, Tomate y Albahaca',
          'Panceta y Ciruela',
          'Pollo',
          'Pollo al Champignon',
          'Queso y Cebolla',
          'Roquefort con Jamon',
          'Vacio y Provoleta',
          'Verdura'
        ],
        color: '#FF6B6B',
        precioEmpanada: 1800,
        costoEnvio: 500
      },
      {
        id: 'rincon-norteno',
        nombre: 'Rincón Norteño',
        telefono: '45816761',
        gustos: [
          'Primavera',
          'Carne Picante',
          'Carne Suave',
          'Carne Dulce',
          'Carne Molida Suave',
          'Pollo Picante',
          'Pollo Suave',
          'Jamón y Queso',
          'Cebolla y Mozzarella',
          'Cantimpalo y Mozzarella',
          'Roquefort',
          'Roquefort y Jamón',
          'Mozzarella, Tomate y Albahaca',
          'Verdura y Salsa Blanca',
          'Humita',
          'Humita y Mozzarella',
          'Atún',
          'Ciruela, Panceta y Mozzarella',
          'Brócoli y Ricota',
          'Empanada Cheeseburger'
        ],
        color: '#4ECDC4',
        precioEmpanada: 2200,
        costoEnvio: 500
      }
    ],
    amigos: [
      { "nombre": "Mati", "empanadas": [] },
      { "nombre": "Mari", "empanadas": [] },
      { "nombre": "Sari", "empanadas": [] },
      { "nombre": "silvia", "empanadas": [] },
      { "nombre": "Osvaldo", "empanadas": [] },
      { "nombre": "Milena", "empanadas": [] },
      { "nombre": "Nicole", "empanadas": [] },
      { "nombre": "Fede", "empanadas": [] },
      { "nombre": "Carla", "empanadas": [] },
      { "nombre": "Cesario", "empanadas": [] },
      { "nombre": "Valeria", "empanadas": [] },
      { "nombre": "Gisela", "empanadas": [] },
      { "nombre": "Frasco", "empanadas": [] },
      { "nombre": "Gabi", "empanadas": [] },
      { "nombre": "Fiore", "empanadas": [] }
    ],
    gruposPago: [
      {
        "id": "mcdscgzgeoxkgv89jzf",
        "nombre": "Suspicacia",
        "miembros": ["Mati", "Mari", "Sari", "Nicole", "Milena"],
        "color": "#5F27CD",
        "pagador": "Mati"
      },
      {
        "id": "mcdsebd865yinjiyf52",
        "nombre": "Masciotta",
        "miembros": ["silvia", "Osvaldo"],
        "color": "#FF6B6B",
        "pagador": "silvia"
      },
      {
        "id": "mcdsf1bcz5fb2wyy4b",
        "nombre": "Gordo",
        "miembros": ["Fede", "Carla"],
        "color": "#6C5CE7",
        "pagador": "Fede"
      },
      {
        "id": "mcdsg4buntnzsfjqlzn",
        "nombre": "GiseFrasco",
        "miembros": ["Gisela", "Frasco"],
        "color": "#A29BFE",
        "pagador": "Gisela"
      },
      {
        "id": "mcdsgh48hmmp2ih8k4j",
        "nombre": "DoGabriel",
        "miembros": ["Fiore", "Gabi"],
        "color": "#EE5A24",
        "pagador": "Fiore"
      }
    ]
  };

  constructor(
    private router: Router,
    private migrationService: MigrationService,
    private casasService: CasasEmpanadasService,
    private amigosService: AmigosService
  ) {}

  ngOnInit() {
    // Ejecutar migraciones al iniciar la aplicación
    this.migrationService.runMigrations();
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  toggleConfigMenu(): void {
    this.showConfigMenu = !this.showConfigMenu;
  }

  cargarGustos(): void {
    if (confirm('¿Cargar casas de empanadas de ejemplo? Esto agregará las casas Mi Gusto y Rincón Norteño con sus gustos.')) {
      // Cargar casas de empanadas
      this.datosEjemplo.casasEmpanadas.forEach(casa => {
        this.casasService.addCasa(casa);
      });

      this.showConfigMenu = false;
      alert('¡Casas de empanadas de ejemplo cargadas exitosamente!');
      
      // Recargar la página para mostrar los cambios
      window.location.reload();
    }
  }

  cargarAmigos(): void {
    if (confirm('¿Cargar amigos de ejemplo? Esto agregará 15 amigos y 5 grupos de pago.')) {
      // Cargar amigos con sus grupos de pago
      this.datosEjemplo.amigos.forEach(amigo => {
        this.amigosService.addAmigo(amigo);
      });

      // Cargar grupos de pago
      localStorage.setItem('grupos-pago', JSON.stringify(this.datosEjemplo.gruposPago));

      this.showConfigMenu = false;
      alert('¡Amigos y grupos de pago de ejemplo cargados exitosamente!');
      
      // Recargar la página para mostrar los cambios
      window.location.reload();
    }
  }

  limpiarGustos(): void {
    if (confirm('¿Eliminar todas las casas de empanadas y gustos? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('casas-empanadas');
      this.showConfigMenu = false;
      alert('Casas de empanadas eliminadas');
      window.location.reload();
    }
  }

  limpiarAmigos(): void {
    if (confirm('¿Eliminar todos los amigos? Esta acción no se puede deshacer.')) {
      localStorage.removeItem('amigos');
      localStorage.removeItem('grupos-pago');
      this.showConfigMenu = false;
      alert('Amigos eliminados');
      window.location.reload();
    }
  }

  limpiarTodo(): void {
    if (confirm('¿Eliminar TODOS los datos (casas, amigos, historial, etc.)? Esta acción no se puede deshacer.')) {
      // Limpiar todos los datos del localStorage relacionados con la app
      const keysToRemove = [
        'casas-empanadas',
        'amigos',
        'grupos-pago',
        'historiales',
        'casa-seleccionada',
        'pedidos-activos',
        'costoPorEmpanada',
        'lastUpdatedTime'
      ];
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
      
      this.showConfigMenu = false;
      alert('Todos los datos han sido eliminados');
      window.location.reload();
    }
  }
}
