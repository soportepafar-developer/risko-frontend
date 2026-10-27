import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Plan } from 'src/app/core/models/Risk/plan';
import { PlanActivity } from 'src/app/core/models/Risk/plan-activity';
import { Responsibles } from 'src/app/core/models/Risk/project';
import { ActivityService } from 'src/app/core/services/Riesgo/activity.service';
import { UserService } from 'src/app/core/services/user.service';
import Swal from 'sweetalert2';

export interface DialogData { plan: Plan }

@Component({
  selector: 'app-add-activity',
  templateUrl: './add-activity.component.html'
})
export class AddActivityComponent implements OnInit {
  form: FormGroup;
  selectedRow: any;
  title: string = '';
  responsibles: Responsibles[];
  planActivity: PlanActivity[] = [];
  showListActivity = true;
  loading = false;

  displayedColumnsActivity: string[] = ['activity', 'userName', 'done','actions'];
  dataSourceActivity: MatTableDataSource<PlanActivity>;

  constructor(
    private userService: UserService,
    private activityService: ActivityService,
    public dialogRef: MatDialogRef<AddActivityComponent>,
    private formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
     this.myFormValues();
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    console.log(this.data);
    this.title = this.data.plan.name;
    console.log(this.data.plan.activities);
    this.planActivity = this.data.plan.activities;
    this.refreshListActivities();

    this.getUsers();
  }


  getUsers(){
    this.userService.getAll().subscribe( data => {
      this.responsibles = data;
    });
  }

  addActivity(){
      let exist = false;
  
      if (this.f.activity.value === ''){
        Swal.fire('Por Favor', `Debe agregar la actividad`, 'info')
        return;
      }
  
      if (this.f.responsible.value === ''){
        Swal.fire('Por Favor', `Debe seleccionar el responsable`, 'info')
        return;
      }
  
      this.planActivity.forEach((element)=>{
        if(element.activity===this.f.activity.value) {
          exist = true
          Swal.fire('', `Actividad ya fue agregada`, 'info');
        }
      });
  
      if(!exist){
        this.onAddActivityToPlan();
      }
  
    }
  
    onAddActivityToPlan(){

      this.planActivity.push({
        activity: this.f.activity.value,
        user: this.f.responsible.value,
        fullName: this.responsibles.find(x => x.id == this.f.responsible.value).fullName,
        done: false
      })
  
      this.refreshListActivities();

      this.loading = true;

      const activity: PlanActivity = {
        activity: this.f.activity.value,
        user: this.f.responsible.value,
        done: false,
        plan: this.data.plan.id
      }

      console.log(activity);

      this.activityService.add(activity);
    
    }
  
     refreshListActivities(){
      this.dataSourceActivity = new MatTableDataSource(this.planActivity);
  
      if (this.planActivity.length == 0){
        this.showListActivity= true;
      }else{
        this.showListActivity = false;
      }
    }
  
    toggleStatus(event: MatSlideToggleChange, row: PlanActivity){
      
      row.done = event.checked;

      const activity: PlanActivity = {
        activity: row.activity,
        user: row.user,
        done: event.checked,
        plan: this.data.plan.id
      }

      console.log(activity);
     
      this.activityService.update(row.id, activity);
    }
  

  closeModal() {
    this.dialogRef.close();
  }

  onDeleteActivity(row: PlanActivity){
    Swal.fire({
        title:  `¿ Estás seguro que deseas eliminar de la lista ${ row.activity }?`,
        showDenyButton: true,
        confirmButtonText: `Eliminar`,
        }).then((result) => {
          if (result.isConfirmed){
              this.planActivity.forEach((element,index)=>{
                if(element.id==row.id) {
                  this.planActivity.splice(index,1);
                  this.activityService.deleteActivity(row.id);
                  this.refreshListActivities();
                }
              });
          }
        })
  }

  myFormValues() {
    this.form = this.formBuilder.group({
      activity: [''],
      responsible: ['']
    })
  }

}
