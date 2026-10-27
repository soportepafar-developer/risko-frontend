import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Spanish.
import es from 'javascript-time-ago/locale/es'
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Risk } from '../../models/Risk/risk';

@Injectable({
  providedIn: 'root'
})
export class RiskService extends HttpService {
    private sharingObservable: BehaviorSubject<Risk> = 
      new BehaviorSubject<Risk>(this.getEmptyProject());
  
    getEmptyProject(): Risk {
      return {
        id: 0,
        name: '',
        impact: 0,
        frequency: 0,
        affect: 0,
        description: ''
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

  set sharingData (data: Risk){
    this.sharingObservable.next(data);
  }

  resetData(){
    this.sharingObservable.next(this.getEmptyProject());
  }

  getAll() {
      return this.get(environment.apiUrl, '/riesgo');
  }

  /**
   * Para llenar las listas donde se asocian riesgos.
   */
  getAllForAccosiate() {
      return this.get(environment.apiUrl, '/riesgoassociate');
  }

  /**
   * Persists risk data
   * @param data 
   */
  async add(data: any) {
    try {
      await firstValueFrom(this.post(environment.apiUrl, '/riesgo', data));
      this.toastrService.success('Riesgo registrado con exito.');
      this.router.navigate(['/risks']);
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
      await firstValueFrom(this.put(environment.apiUrl, `/riesgo/actualizar/${id}`, data));
      this.resetData(); //// Resetear los valores del observable después de actualizar
      this.toastrService.success('Actualizado con exito.');
      this.router.navigate(['/risks']);
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
      await firstValueFrom(this.delete(environment.apiUrl, `/riesgo/${id}/remove-user/${userId}`));
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
      await firstValueFrom(this.delete(environment.apiUrl, `/riesgo/${id}/remove-process/${processId}`));
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
      await firstValueFrom(this.delete(environment.apiUrl, `/riesgo/${id}/remove-control/${controlId}`));
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
}
