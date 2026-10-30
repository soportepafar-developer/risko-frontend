import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Project, Responsibles } from 'src/app/core/models/Risk/project';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/core/services/user.service';
import { ProjectService } from 'src/app/core/services/Riesgo/project.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html'
})
export class AddProjectComponent implements OnInit {
  private data$: Observable<Project>;
  responsables: Responsibles[];
  form: UntypedFormGroup;
  id: number;
  loading = false;
  submitted = false;
  showList = false;
  showListSelect = true;
  selectedRow;
  userSelect: any[] = [];

  displayedColumns: string[] = ['fullName', 'dependence', 'position', 'actions'];
  dataSource: MatTableDataSource<Responsibles>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  displayedColumnsSelect: string[] =  ['fullName', 'dependence', 'position', 'actions'];
  dataSourceSelect: MatTableDataSource<any>;

  constructor(
    private projectService: ProjectService,
    private userService: UserService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
  ) {
      this.myFormValues();
      this.data$ = projectService.sharingProject;
   }

  get f() { return this.form.controls; }

  ngOnInit() {
    this.setValues();
    this.getUsers();
  }

  getUsers(){
    this.userService.getAll().subscribe( data => {
      this.initTable(data);
    });
  }

  initTable(user: Responsibles[]){
    this.dataSource = new MatTableDataSource(user);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
    this.loading = false;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.showList = false;
    this.showListSelect = true;
  }

  back() {
    this.router.navigate(['/projects']);
    this.projectService.resetData();
  }

  onAdd(item: Responsibles){
    let exist = false;
    this.userSelect.forEach((element)=>{
      if(element.id===item.id) {
        exist = true
        Swal.fire('', `${ item.fullName  } ya fue agregado`, 'info');
      }
    });

    if(!exist){
      this.onAddUser(item);
    }
  }

  onAddUser(item: Responsibles){
    this.userSelect.push({
      "id": item.id,
      "fullName": item.fullName,
      "dependence": item.dependence,
      "position": item.position,
    });
 
    this.refreshList();

  }

  refreshList(){
    this.dataSourceSelect = new MatTableDataSource(this.userSelect);

    if (this.userSelect.length == 0){
      this.showList = false;
      this.showListSelect = true;
    }else{
      this.showList = true;
      this.showListSelect = false;
    }
  }

  onDelete(item: Responsibles){
     Swal.fire({
      title:  `¿ Seguro que deseas eliminar de la lista a ${ item.fullName }?`,
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.userSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.userSelect.splice(index,1);
              this.projectService.deleteUser(this.id, item.id);
              this.refreshList();
            }
         });
      }
    })
  }

  onShowList(){
    if(this.showListSelect){
      this.showList = true;
      this.showListSelect = false;
    }else{
      this.showList = false;
      this.showListSelect = true;
    }
  }

  setValues(){
    this.data$.subscribe( data => {
      if(data.id > 0){
        this.f.name.setValue(data.name);
        this.f.description.setValue(data.descripcion);
        this.id = data.id;
        this.userSelect = data.responsibles;
        this.refreshList();
      }
    });
  }

  myFormValues() {
    this.form = this.formBuilder.group({
      name: ['',Validators.required],
      description: ['',Validators.required]
    })
  }

  onSubmit() {

    this.submitted = true;

    if (this.userSelect.length == 0) {
      Swal.fire('', `Agregue al menos un responsable a la lista`, 'info');
      return;
    }

    if (this.form.invalid) { return; }

    this.loading = true;

    const project: Project = {
      name: this.f.name.value,
      descripcion: this.f.description.value,
      responsibles: this.userSelect
    }

    console.log(project);

    if(this.id == 0 || this.id == undefined){
      this.projectService.add(project);
    }else{
      this.projectService.update(this.id, project);
    }

  }

}
