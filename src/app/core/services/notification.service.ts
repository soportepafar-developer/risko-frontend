import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AppNotification } from '../models/notification';
import { PlanService } from './Riesgo/plan.service';
import { EventService } from './Riesgo/event.service';
import { Plan } from '../models/Risk/plan';
import { Events } from '../models/Risk/event';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly READ_IDS_KEY = 'risko_read_notification_ids';
  private readonly DISMISSED_IDS_KEY = 'risko_dismissed_notification_ids';
  private planService = inject(PlanService);
  private eventService = inject(EventService);

  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  public notifications$: Observable<AppNotification[]> = this.notificationsSubject.asObservable();
  public unreadCount$: Observable<number>;

  constructor() {
    this.unreadCount$ = this.notifications$.pipe(
      map(items => items.filter(n => !n.read).length)
    );
    this.refreshNotifications();
  }

  get notifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Consulta los servicios reales de Planes y Eventos y genera las alertas automáticas.
   */
  refreshNotifications(): void {
    forkJoin({
      plans: this.planService.getAll().pipe(catchError(() => of([]))),
      events: this.eventService.getAll().pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ plans, events }) => {
        this.generateNotificationsFromRealData(plans as Plan[], events as Events[]);
      },
      error: () => {
        this.notificationsSubject.next(this.notificationsSubject.value);
      }
    });
  }

  private generateNotificationsFromRealData(plans: Plan[], events: Events[]): void {
    const readIds = this.getReadIds();
    const dismissedIds = this.getDismissedIds();
    const generated: AppNotification[] = [];
    const now = new Date();

    // 1. Evaluar Planes de Acción Reales
    if (Array.isArray(plans)) {
      plans.forEach(plan => {
        if (!plan || !plan.id) return;
        const isCompleted = plan.status === 'Completado' || plan.status === 'Finalizado' || (plan.progress ?? 0) >= 100;

        if (plan.endDate) {
          const endDate = new Date(plan.endDate);
          const diffMs = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

          // Plan Vencido
          if (diffDays < 0 && !isCompleted) {
            const id = `plan-overdue-${plan.id}`;
            if (!dismissedIds.has(id)) {
              const processName = plan.processes?.[0]?.name;
              generated.push({
                id,
                title: 'Plan de Acción Vencido',
                message: `El plan "${plan.name}" venció hace ${Math.abs(diffDays)} día(s) y registra un avance del ${plan.progress ?? 0}%.`,
                type: 'danger',
                createdAt: endDate,
                read: readIds.has(id),
                targetRole: 'Dueño del Proceso / Responsable',
                targetProcess: processName,
                link: '/plans'
              });
            }
          }
          // Plan Próximo a Vencer (7 días o menos)
          else if (diffDays >= 0 && diffDays <= 7 && !isCompleted) {
            const id = `plan-soon-${plan.id}`;
            if (!dismissedIds.has(id)) {
              const processName = plan.processes?.[0]?.name;
              generated.push({
                id,
                title: 'Plan Próximo a Vencer',
                message: `El plan "${plan.name}" vence ${diffDays === 0 ? 'hoy' : 'en ' + diffDays + ' día(s)'} con un avance del ${plan.progress ?? 0}%.`,
                type: 'warning',
                createdAt: new Date(),
                read: readIds.has(id),
                targetRole: 'Dueño del Proceso / Responsable',
                targetProcess: processName,
                link: '/plans'
              });
            }
          }
        }

        // Actividades pendientes del plan
        if (Array.isArray(plan.activities) && !isCompleted) {
          const pending = plan.activities.filter(a => !a.done);
          if (pending.length > 0) {
            const id = `plan-act-${plan.id}-${pending.length}`;
            if (!dismissedIds.has(id)) {
              const sampleNames = pending.slice(0, 2).map(a => `"${a.activity}"`).join(', ');
              generated.push({
                id,
                title: 'Actividades Pendientes del Plan',
                message: `El plan "${plan.name}" tiene ${pending.length} actividad(es) sin concluir (${sampleNames}).`,
                type: 'info',
                createdAt: new Date(),
                read: readIds.has(id),
                targetRole: 'Responsable de Actividad',
                targetProcess: plan.processes?.[0]?.name,
                link: '/plans'
              });
            }
          }
        }
      });
    }

    // 2. Evaluar Eventos de Riesgo Reales
    if (Array.isArray(events)) {
      events.forEach(event => {
        if (!event || !event.id) return;
        const isClosed = event.state === 'Cerrado' || event.state === 'Resuelto';
        const crit = (event.criticality || '').toLowerCase();
        const isCritical = crit.includes('crit') || crit.includes('alt') || event.generateLoss === 'Si';

        if (!isClosed) {
          const id = `event-active-${event.id}`;
          if (!dismissedIds.has(id)) {
            const processName = event.processes?.[0]?.name;
            const riskName = event.risks?.[0]?.name;
            const lossTxt = event.generateLoss === 'Si' && event.lossAmount ? ` Pérdida: $${event.lossAmount}.` : '';

            generated.push({
              id,
              title: isCritical ? 'Evento Operacional Crítico' : 'Evento de Riesgo Abierto',
              message: `El evento "${event.name}" se encuentra en estado "${event.state || 'Abierto'}". Criticidad: ${event.criticality || 'Sin definir'}.${lossTxt}`,
              type: isCritical ? 'danger' : 'warning',
              createdAt: event.discoveryDate ? new Date(event.discoveryDate) : (event.startDate ? new Date(event.startDate) : new Date()),
              read: readIds.has(id),
              targetRole: 'Dueño del Proceso / Propietario',
              targetProcess: processName,
              targetRisk: riskName,
              link: '/events'
            });
          }
        }
      });
    }

    // Ordenar: No leídas primero, luego por fecha más reciente
    generated.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    this.notificationsSubject.next(generated);
  }

  private getReadIds(): Set<string> {
    try {
      const data = localStorage.getItem(this.READ_IDS_KEY);
      if (data) {
        return new Set(JSON.parse(data));
      }
    } catch (e) {
      console.warn('Error reading read notification IDs', e);
    }
    return new Set<string>();
  }

  private saveReadIds(ids: Set<string>): void {
    try {
      localStorage.setItem(this.READ_IDS_KEY, JSON.stringify(Array.from(ids)));
    } catch (e) {
      console.warn('Error saving read notification IDs', e);
    }
  }

  private getDismissedIds(): Set<string> {
    try {
      const data = localStorage.getItem(this.DISMISSED_IDS_KEY);
      if (data) {
        return new Set(JSON.parse(data));
      }
    } catch (e) {
      console.warn('Error reading dismissed IDs', e);
    }
    return new Set<string>();
  }

  private saveDismissedIds(ids: Set<string>): void {
    try {
      localStorage.setItem(this.DISMISSED_IDS_KEY, JSON.stringify(Array.from(ids)));
    } catch (e) {
      console.warn('Error saving dismissed IDs', e);
    }
  }

  markAsRead(id: string): void {
    const readIds = this.getReadIds();
    readIds.add(id);
    this.saveReadIds(readIds);

    const updated = this.notifications.map(item => {
      if (item.id === id) {
        return { ...item, read: true };
      }
      return item;
    });
    this.notificationsSubject.next(updated);
  }

  markAllAsRead(): void {
    const readIds = this.getReadIds();
    this.notifications.forEach(item => readIds.add(item.id));
    this.saveReadIds(readIds);

    const updated = this.notifications.map(item => ({ ...item, read: true }));
    this.notificationsSubject.next(updated);
  }

  /**
   * Descarta una notificación individual para que no vuelva a aparecer en la lista
   */
  dismissNotification(id: string): void {
    const dismissedIds = this.getDismissedIds();
    dismissedIds.add(id);
    this.saveDismissedIds(dismissedIds);

    const updated = this.notifications.filter(item => item.id !== id);
    this.notificationsSubject.next(updated);
  }

  /**
   * Limpia y descarta permanentemente todas las alertas actuales de la bandeja
   */
  clearAll(): void {
    const dismissedIds = this.getDismissedIds();
    this.notifications.forEach(item => dismissedIds.add(item.id));
    this.saveDismissedIds(dismissedIds);

    this.notificationsSubject.next([]);
  }
}
