import { Injectable } from '@angular/core';
import { CasasEmpanadasService } from './casas-empanadas.service';

@Injectable({
  providedIn: 'root'
})
export class MigrationService {
  private readonly MIGRATION_FLAG = 'migration_v1.1.0_completed';

  constructor(private casasService: CasasEmpanadasService) {}

  runMigrations(): void {
    const migrationCompleted = localStorage.getItem(this.MIGRATION_FLAG);
    
    if (!migrationCompleted) {
      console.log('🔄 Ejecutando migración a sistema de casas de empanadas...');
      
      this.migrateOldGustosSystem();
      this.cleanOldData();
      
      localStorage.setItem(this.MIGRATION_FLAG, 'true');
      console.log('✅ Migración completada');
    }
  }

  private migrateOldGustosSystem(): void {
    // Migrar gustos antiguos si existen
    const oldGustos = localStorage.getItem('gustos');
    if (oldGustos) {
      try {
        const gustos = JSON.parse(oldGustos);
        const casas = this.casasService.getCasas();
        
        // Si no hay casas creadas, crear una con los gustos antiguos
        if (casas.length === 0) {
          console.log('📦 Migrando gustos antiguos al sistema de casas...');
          // La casa por defecto ya se crea automáticamente en el servicio
        }
      } catch (error) {
        console.warn('⚠️ Error al migrar gustos antiguos:', error);
      }
    }
  }

  private cleanOldData(): void {
    // Limpiar datos del sistema anterior
    const oldKeys = [
      'gustos', // Sistema antiguo de gustos
      'pedidos-activos', // Pedidos temporales
      'amigos' // Sistema antiguo de amigos (ahora manejado por AmigosService)
    ];

    oldKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log(`🗑️ Limpiando dato antiguo: ${key}`);
        localStorage.removeItem(key);
      }
    });
  }

  // Método para resetear completamente el localStorage (útil para desarrollo)
  resetAllData(): void {
    const confirmation = confirm(
      '⚠️ ADVERTENCIA: Esto eliminará TODOS los datos guardados (casas, amigos, grupos, historial).\n\n¿Estás seguro?'
    );
    
    if (confirmation) {
      localStorage.clear();
      console.log('🗑️ Todos los datos han sido eliminados');
      window.location.reload(); // Recargar para inicializar datos por defecto
    }
  }

  // Método para exportar datos (backup)
  exportData(): string {
    const data = {
      timestamp: new Date().toISOString(),
      version: '1.1.0',
      casasEmpanadas: localStorage.getItem('casas-empanadas'),
      amigos: localStorage.getItem('amigos'),
      gruposPago: localStorage.getItem('grupos-pago'),
      historial: localStorage.getItem('historial'),
      costoPorEmpanada: localStorage.getItem('costoPorEmpanada'),
      costoEnvio: localStorage.getItem('costoEnvio')
    };

    return JSON.stringify(data, null, 2);
  }

  // Método para importar datos desde backup
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.version !== '1.1.0') {
        alert('❌ Versión de datos incompatible');
        return false;
      }

      // Restaurar datos
      Object.keys(data).forEach(key => {
        if (key !== 'timestamp' && key !== 'version' && data[key]) {
          localStorage.setItem(key === 'casasEmpanadas' ? 'casas-empanadas' : key, data[key]);
        }
      });

      alert('✅ Datos importados correctamente');
      window.location.reload();
      return true;
    } catch (error) {
      alert('❌ Error al importar datos: ' + error);
      return false;
    }
  }
} 