import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

// Spanish.
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Cause } from '../../models/Risk/cause';

//import { io } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class CauseService extends HttpService {
  private sharingObservable: BehaviorSubject<Cause> = 
    new BehaviorSubject<Cause>(this.getEmptyProject());

  getEmptyProject(): any {
    return {
      id: 0,
      name: '',
      category: '',
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

  set sharingData (data: Cause){
    this.sharingObservable.next(data);
  }

  resetData(){
    this.sharingObservable.next(this.getEmptyProject());
  }

  getAll() {
      return this.get(environment.apiUrl, '/causa');
  }

  /**
   * Persists cause data
   * @param data 
   */
  async add(data: any) {
    try {
      await firstValueFrom(this.post(environment.apiUrl, '/causa', data));
      this.toastrService.success('Causa registrada con exito.');
      this.router.navigate(['/causes']);
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
      await firstValueFrom(this.put(environment.apiUrl, `/causa/actualizar/${id}`, data));
      this.resetData(); //// Resetear los valores del observable después de actualizar
      this.toastrService.success('Actualizado con exito.');
      this.router.navigate(['/causes']);
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
      await firstValueFrom(this.delete(environment.apiUrl, `/causa/${id}/riesgo/${riskId}`));
      this.toastrService.success('Causa eliminada con éxito.');
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
