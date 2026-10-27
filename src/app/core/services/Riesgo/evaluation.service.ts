import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Evaluation } from '../../models/Risk/evaluation';

@Injectable({
  providedIn: 'root'
})
export class EvaluationService extends HttpService {
    private sharingObservable: BehaviorSubject<Evaluation> = 
      new BehaviorSubject<Evaluation>(this.getEmptyProject());

    getEmptyProject(): Evaluation {
      return {
        id: 0,
        name: '',
        description: '',
        startDate: new Date(),
        endDate: new Date(),
        type: '',
        responsibles: [],
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

  set sharingData (data: Evaluation){
    this.sharingObservable.next(data);
  }

  resetData(){
    this.sharingObservable.next(this.getEmptyProject());
  }

  getAll() {
      return this.get(environment.apiUrl, '/evaluacion');
  }

  /**
   * Persists event data
   * @param data 
   */
  async add(data: any) {
    try {
      await firstValueFrom(this.post(environment.apiUrl, '/evaluacion', data));
      this.toastrService.success('Evento registrado con exito.');
      this.router.navigate(['/evaluations']);
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
      await firstValueFrom(this.put(environment.apiUrl, `/evento/evaluacion/${id}`, data));
      this.resetData(); //// Resetear los valores del observable después de actualizar
      this.toastrService.success('Actualizado con exito.');
      this.router.navigate(['/evaluations']);
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
      await firstValueFrom(this.delete(environment.apiUrl, `/evaluacion/${id}/remove-user/${userId}`));
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

  async deleteControl(id: number, controlId: number) {
    try {
      await firstValueFrom(this.delete(environment.apiUrl, `/evaluacion/${id}/remove-control/${controlId}`));
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
      await firstValueFrom(this.delete(environment.apiUrl, `/evaluacion/${id}/remove-risk/${riskId}`));
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
}
