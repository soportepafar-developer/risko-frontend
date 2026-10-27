import { Injectable } from '@angular/core';
import { HttpService } from './../http.service';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, firstValueFrom } from 'rxjs';
import { environment } from './../../../../environments/environment';

import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Project } from '../../models/Risk/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService extends HttpService {
  private sharingProjectObservable: BehaviorSubject<Project> = 
    new BehaviorSubject<Project>(this.getEmptyProject());

  getEmptyProject(): Project {
    return {
      id: 0,
      name: '',
      descripcion: '',
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

  get sharingProject(){
    return this.sharingProjectObservable.asObservable();
  }

  set sharingProjectData (data: Project){
    this.sharingProjectObservable.next(data);
  }

  resetData(){
    this.sharingProjectObservable.next(this.getEmptyProject());
  }

  getAll() {
      return this.get(environment.apiUrl, '/proyecto');
  }

  /**
   * Persists Project data
   * @param data 
   */
  async add(data: any) {
    try {
      await firstValueFrom(this.post(environment.apiUrl, '/proyecto', data));
      this.toastrService.success('Proyecto registrado con éxito.');
      this.router.navigate(['/projects']);
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
      await firstValueFrom(this.put(environment.apiUrl, `/proyecto/actualizar/${id}`, data));
      this.resetData(); //// Resetear los valores del observable después de actualizar
      this.toastrService.success('Proyecto actualizado con éxito.');
      this.router.navigate(['/projects']);
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
      await firstValueFrom(this.delete(environment.apiUrl, `/proyecto/${id}/remove-user/${userId}`));
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
