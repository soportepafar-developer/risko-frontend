import { Injectable } from '@angular/core';
import { HttpService } from '../http.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Process } from '../../models/Risk/process';

@Injectable({
  providedIn: 'root'
})
export class ProcessService extends HttpService {
    private sharingProcessObservable: BehaviorSubject<Process> = 
      new BehaviorSubject<Process>(this.getEmptyProcess());
      
    getEmptyProcess(): Process {
      return {
        id: 0,
        name: '',
        type: 1,
        category: 1,
        code: '',
        description: '',
        responsibles: [{
          id: 0,
          fullName: '',
          dependence: '',
          position: ''
        }]
      };
    }

  constructor(protected http: HttpClient,
    private toastrService: ToastrService,
    private router: Router,
    ) {
    super(http);
  }

  get sharing(){
    return this.sharingProcessObservable.asObservable();
  }

  set sharingData (data: Process){
    this.sharingProcessObservable.next(data);
  }

  resetData(){
    this.sharingProcessObservable.next(this.getEmptyProcess());
  }

  getAll() {
      return this.get(environment.apiUrl, '/proceso');
  }

  /**
   * Persists process data
   * @param data 
   */
  async add(data: any) {
    try {
      await firstValueFrom(this.post(environment.apiUrl, '/proceso', data));
      this.toastrService.success('Proceso registrado con éxito.');
      this.router.navigate(['/processes']);
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
      await firstValueFrom(this.put(environment.apiUrl, `/proceso/actualizar/${id}`, data));
      this.resetData(); //// Resetear los valores del observable después de actualizar
      this.toastrService.success('Proceso actualizado con éxito.');
      this.router.navigate(['/processes']);
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
      await firstValueFrom(this.delete(environment.apiUrl, `/proceso/${id}/remove-user/${userId}`));
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
}
