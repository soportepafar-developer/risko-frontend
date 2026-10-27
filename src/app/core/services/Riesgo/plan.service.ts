import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Plan } from '../../models/Risk/plan';

@Injectable({
  providedIn: 'root'
})
export class PlanService extends HttpService {
    private sharingObservable: BehaviorSubject<Plan> = 
      new BehaviorSubject<Plan>(this.getEmptyProject());

    getEmptyProject(): Plan {
      return {
        id: 0,
        name: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        responsibles: [],
        events: [],
        processes: [],
        controls: [],
        risks: []
      };
    }
    
  constructor(protected http: HttpClient,
    private toastrService: ToastrService,
    private router: Router,
    ) {
    super(http);
  }

  get sharing(){
    return this.sharingObservable.asObservable();
  }

  set sharingData (data: Plan){
    this.sharingObservable.next(data);
  }

  resetData(){
    this.sharingObservable.next(this.getEmptyProject());
  }

  getAll() {
      return this.get(environment.apiUrl, '/plan');
  }

  /**
   * Persists event data
   * @param data 
   */
  async add(data: any) {
    try {
      await firstValueFrom(this.post(environment.apiUrl, '/plan', data));
      this.toastrService.success('Evento registrado con exito.');
      this.router.navigate(['/plans']);
    } catch (error: any) {
      if (error.status == 409) {
        this.toastrService.error('', error.error.msg);
      }
      if (error.status != 500 && error.status != 409) {
        this.toastrService.error('', 'Ha ocurrido un error. Intente más tarde.');
      }

    }
  }

  async update(id: number, data: any) {
    try {
      await firstValueFrom(this.put(environment.apiUrl, `/plan/actualizar/${id}`, data));
      this.resetData(); //// Resetear los valores del observable después de actualizar
      this.toastrService.success('Actualizado con exito.');
      this.router.navigate(['/plans']);
    } catch (error: any) {
      if (error.status == 409) {
        this.toastrService.error('', error.msg);
      }
      if (error.status != 500) {
        this.toastrService.error('', 'Ha ocurrido un error. Intente más tarde.');
      }
    }
  }

  async deleteUser(id: number, userId: number) {
    try {
      await firstValueFrom(this.delete(environment.apiUrl, `/plan/${id}/remove-user/${userId}`));
      this.toastrService.success('Responsable eliminado con éxito.');
    } catch (error: any) {
      if (error.status == 409) {
        this.toastrService.error('', error.msg);
      }
      if (error.status != 500) {
        this.toastrService.error('', 'Ha ocurrido un error. Intente más tarde.');
      }
    }
  }

  async deleteProcess(id: number, processId: number) {
    try {
      await firstValueFrom(this.delete(environment.apiUrl, `/plan/${id}/remove-process/${processId}`));
      this.toastrService.success('Proceso eliminado con éxito.');
    } catch (error: any) {
      if (error.status == 409) {
        this.toastrService.error('', error.msg);
      }
      if (error.status != 500) {
        this.toastrService.error('', 'Ha ocurrido un error. Intente más tarde.');
      }
    }
  }

  async deleteControl(id: number, controlId: number) {
    try {
      await firstValueFrom(this.delete(environment.apiUrl, `/plan/${id}/remove-control/${controlId}`));
      this.toastrService.success('Control eliminado con éxito.');
    } catch (error: any) {
      if (error.status == 409) {
        this.toastrService.error('', error.msg);
      }
      if (error.status != 500) {
        this.toastrService.error('', 'Ha ocurrido un error. Intente más tarde.');
      }
    }
  }

  async deleteRisk(id: number, riskId: number) {
    try {
      await firstValueFrom(this.delete(environment.apiUrl, `/plan/${id}/remove-risk/${riskId}`));
      this.toastrService.success('Riesgo eliminado con éxito.');
    } catch (error: any) {
      if (error.status == 409) {
        this.toastrService.error('', error.msg);
      }
      if (error.status != 500) {
        this.toastrService.error('', 'Ha ocurrido un error. Intente más tarde.');
      }
    }
  }

  async deleteEvent(id: number, eventId: number) {
    try {
      await firstValueFrom(this.delete(environment.apiUrl, `/plan/${id}/remove-event/${eventId}`));
      this.toastrService.success('Eliminado con éxito.');
    } catch (error: any) {
      if (error.status == 409) {
        this.toastrService.error('', error.msg);
      }
      if (error.status != 500) {
        this.toastrService.error('', 'Ha ocurrido un error. Intente más tarde.');
      }
    }
  }
}
