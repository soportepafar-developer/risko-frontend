import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';


import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Control } from '../../models/Risk/control';


@Injectable({
  providedIn: 'root'
})
export class ControlService extends HttpService {
  private sharingObservable: BehaviorSubject<Control> = 
    new BehaviorSubject<Control>(this.getEmptyProject());

  getEmptyProject(): Control {
    return {
      id: 0,
      name: '',
      executionType: '',
      qualify: 0,
      isFrequent: 0,
      hasEvidence: 0,
      isDocument: '',
      responsibleAssigned: 0,
      eventsAssociated: 0,
      isEffective: 0,
      isEvidenceEffective: 0,
      correctTime: 0,
      solidityDesign: '',
      solidityExecution: '',
      solidityResult: '',
      percentageDesign: '',
      percentageExecution: '',
      percentageResult: ''
    };
  }
  
  constructor(protected http: HttpClient,
    private toastrService: ToastrService,
    private router: Router,
    ) {
    super(http);
  }

  getAll() {
      return this.get(environment.apiUrl, '/control');
  }

  get sharing(){
    return this.sharingObservable.asObservable();
  }

  set sharingData (data: Control){
    this.sharingObservable.next(data);
  }

  resetData(){
    this.sharingObservable.next(this.getEmptyProject());
  }

  /**
   * Persists Project data
   * @param data 
   */
  async add(data: any) {
    try {
      await firstValueFrom(this.post(environment.apiUrl, '/control', data));
      this.toastrService.success('Control registrado con éxito.');
      this.router.navigate(['/controls']);
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
      await firstValueFrom(this.put(environment.apiUrl, `/control/actualizar/${id}`, data));
      this.resetData(); //// Resetear los valores del observable después de actualizar
      this.toastrService.success('Control actualizado con éxito.');
            this.router.navigate(['/controls']);
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
      await firstValueFrom(this.delete(environment.apiUrl, `/control/${id}/remove-user/${userId}`));
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

  /**
   * Parametros Contrl
   */

  getAllParams() {
      return this.get(environment.apiUrl, '/parametroscontrol');
  }

  async updateParams(id: number, data: any) {
    try {
      await firstValueFrom(this.put(environment.apiUrl, `/parametroscontrol/actualizar/${id}`, data));
      this.toastrService.success('Parametros actualizado con éxito.');
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
