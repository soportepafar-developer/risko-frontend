export type NotificationType = 'danger' | 'warning' | 'info' | 'success';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAt: Date | string;
  read: boolean;
  targetRole?: string; // 'Dueño del Proceso' | 'Propietario del Riesgo' | 'Responsable de Actividad'
  targetProcess?: string; // Nombre del proceso afectado
  targetRisk?: string; // Nombre del riesgo asociado
  link?: string; // Ruta interna a redirigir (ej. '/events', '/plans', '/risks')
}

