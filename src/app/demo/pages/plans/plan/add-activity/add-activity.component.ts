import { MATERIAL_FORMS } from 'src/app/shared/material-forms';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatTableDataSource } from '@angular/material/table';
import { Plan } from 'src/app/core/models/Risk/plan';
import { PlanActivity } from 'src/app/core/models/Risk/plan-activity';
import { Responsibles } from 'src/app/core/models/Risk/project';
import { ActivityService } from 'src/app/core/services/Riesgo/activity.service';
import { UserService } from 'src/app/core/services/user.service';
import { NotificationService } from 'src/app/core/services/notification.service';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';

export interface DialogData { plan: Plan }

@Component({
  imports: [...MATERIAL_FORMS],
  selector: 'app-add-activity',
  templateUrl: './add-activity.component.html'
})
export class AddActivityComponent implements OnInit {
  form: FormGroup;
  responsibleSearchCtrl = new FormControl<string | Responsibles>('');
  filteredResponsibles$: Observable<Responsibles[]>;
  selectedRow: any;
  title: string = '';
  responsibles: Responsibles[] = [];
  planActivity: PlanActivity[] = [];
  showListActivity = true;
  loading = false;

  displayedColumnsActivity: string[] = ['activity', 'userName', 'done', 'actions'];
  dataSourceActivity: MatTableDataSource<PlanActivity>;

  constructor(
    private userService: UserService,
    private activityService: ActivityService,
    private notificationService: NotificationService,
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

  getUsers() {
    this.userService.getAll().subscribe(data => {
      this.responsibles = data;
      this.setupResponsibleFilter();
    });
  }

  setupResponsibleFilter() {
    this.filteredResponsibles$ = this.responsibleSearchCtrl.valueChanges.pipe(
      startWith(''),
      map((value) => {
        if (typeof value === 'string') {
          const currentId = this.form.get('responsible')?.value;
          const currentUser = this.responsibles?.find((u) => u.id === currentId);
          if (!currentUser || currentUser.fullName !== value) {
            this.form.get('responsible')?.setValue('');
          }
        }
        const name = typeof value === 'string' ? value : value?.fullName;
        return name ? this._filterResponsibles(name) : (this.responsibles ? this.responsibles.slice() : []);
      })
    );
  }

  private _filterResponsibles(value: string): Responsibles[] {
    const filterValue = value.toLowerCase();
    if (!this.responsibles) return [];
    return this.responsibles.filter((user) => {
      const matchName = user.fullName && user.fullName.toLowerCase().includes(filterValue);
      const matchPosition = user.position && user.position.toLowerCase().includes(filterValue);
      const matchDep = user.dependence && user.dependence.toLowerCase().includes(filterValue);
      return matchName || matchPosition || matchDep;
    });
  }

  displayResponsibleFn = (user: any): string => {
    if (!user) return '';
    if (typeof user === 'string') return user;
    return user.fullName || '';
  };

  onResponsibleSelected(event: any) {
    const user: Responsibles = event?.option?.value;
    if (user && user.id) {
      this.form.get('responsible')?.setValue(user.id);
    }
  }

  clearResponsibleSearch(event?: MouseEvent) {
    if (event) {
      event.stopPropagation();
    }
    this.responsibleSearchCtrl.setValue('');
    this.form.get('responsible')?.setValue('');
  }

  addActivity() {
    let exist = false;

    if (!this.f.activity.value || this.f.activity.value.trim() === '') {
      Swal.fire('Por Favor', 'Debe agregar la actividad', 'info');
      return;
    }

    if (!this.f.responsible.value || this.f.responsible.value === '') {
      Swal.fire('Por Favor', 'Debe seleccionar el responsable', 'info');
      return;
    }

    this.planActivity.forEach((element) => {
      if (element.activity === this.f.activity.value) {
        exist = true;
        Swal.fire('', 'Actividad ya fue agregada', 'info');
      }
    });

    if (!exist) {
      this.onAddActivityToPlan();
    }
  }

  async onAddActivityToPlan() {
    const selectedResponsible = this.responsibles?.find(x => x.id == this.f.responsible.value);
    const fullName = selectedResponsible ? selectedResponsible.fullName : '';

    this.planActivity.push({
      activity: this.f.activity.value,
      user: this.f.responsible.value,
      fullName: fullName,
      done: false
    });

    this.refreshListActivities();

    this.loading = true;

    const activity: PlanActivity = {
      activity: this.f.activity.value,
      user: this.f.responsible.value,
      done: false,
      plan: this.data.plan.id
    };

    console.log(activity);

    try {
      await this.activityService.add(activity);
      this.notificationService.refreshNotifications();
    } finally {
      this.loading = false;
      this.f.activity.setValue('');
      this.clearResponsibleSearch();
    }
  }

  refreshListActivities() {
    this.dataSourceActivity = new MatTableDataSource(this.planActivity);

    if (this.planActivity.length == 0) {
      this.showListActivity = true;
    } else {
      this.showListActivity = false;
    }
  }

  toggleStatus(event: MatSlideToggleChange, row: PlanActivity) {
    row.done = event.checked;

    const activity: PlanActivity = {
      activity: row.activity,
      user: row.user,
      done: event.checked,
      plan: this.data.plan.id
    };

    console.log(activity);

    this.activityService.update(row.id, activity);
    this.notificationService.refreshNotifications();
  }

  closeModal() {
    this.dialogRef.close();
  }

  onDeleteActivity(row: PlanActivity) {
    Swal.fire({
      title: `¿ Estás seguro que deseas eliminar de la lista ${row.activity}?`,
      showDenyButton: true,
      confirmButtonText: 'Eliminar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.planActivity.forEach((element, index) => {
          if (element.id == row.id) {
            this.planActivity.splice(index, 1);
            this.activityService.deleteActivity(row.id);
            this.refreshListActivities();
          }
        });
      }
    });
  }

  myFormValues() {
    this.form = this.formBuilder.group({
      activity: [''],
      responsible: ['']
    });
  }
}
