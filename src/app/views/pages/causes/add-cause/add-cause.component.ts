import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { ModalResponsibleComponent } from 'src/app/views/shared/components/modal-responsible/modal-responsible.component';
import { ChangeDetectorRef } from '@angular/core';

import { Risk } from 'src/app/core/models/Risk/risk';
import { Type } from 'src/app/views/shared/helpers/type';
import { CauseService } from 'src/app/core/services/Riesgo/cause.service';
import { Cause } from 'src/app/core/models/Risk/cause';
import { CategoryCause } from 'src/app/views/shared/helpers/category-cause';
import { CategoryConsequence } from 'src/app/views/shared/helpers/category-consequence';
import { RiskService } from 'src/app/core/services/Riesgo/risk.service';
import { Observable } from 'rxjs';
import { HeatmapItem } from 'src/app/core/models/Risk/impacto-frecuencia';
import { ImpactService } from 'src/app/core/services/Riesgo/impact.service';


@Component({
  selector: 'app-add-cause',
  templateUrl: './add-cause.component.html'
})
export class AddCauseComponent implements OnInit {
  private data$: Observable<Cause>;
  form: FormGroup;
  id: number;
  loading = false;
  submitted = false;
  showListSelect = true;
  showListRisks = false;
  onAsociar = false;
  selectedRow;
  risksSelect: any[] = [];
  showListSelectRisks = true;
  displayedColumnsSelect: string[] =  ['fullName', 'dependence', 'position', 'actions'];
  dataSourceSelect: MatTableDataSource<any>;

  displayedColumnsRisk: string[] = ['id', 'name', 'inherente', 'actions'];
  dataSourceRisk: MatTableDataSource<Risk>;
  @ViewChild('paginatorRisks') paginatorRisks: MatPaginator;
  @ViewChild('sortRisks', { static: false }) sortRisks: MatSort;

  dataSourceRiskSelect: MatTableDataSource<Risk>;

  risks: Risk[] = [];

  type: any[] = [];
  category: any[] = [];
  heatmapItem: HeatmapItem[] = [];

  constructor(
    private causeService: CauseService,
    private riskService: RiskService,
    private impactService: ImpactService,
    private formBuilder: FormBuilder,
    private router: Router,
    public matDialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
      this.myFormValues();
      this.type = Type
      this.data$ = causeService.sharing;
   }

  get f() { return this.form.controls; }

  
  async ngOnInit() {
    this.setValues();
    this.getMapaCalor();
    this.cdr.detectChanges();
  }

  ngAfterViewInit() {
    this.getRisks();
  }

  getRisks(){
    this.riskService.getAllForAccosiate().subscribe(( data => {
        this.initTableRisk(data);
      }
    ));
    this.cdr.detectChanges(); 
  }

  initTableRisk(risks: any[]){
    this.dataSourceRisk = new MatTableDataSource(risks);
    if (this.paginatorRisks) {
      this.dataSourceRisk.paginator = this.paginatorRisks;
      this.dataSourceRisk.sort = this.sortRisks;
    }
    this.loading = false;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceRisk.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceRisk.paginator) {
      this.dataSourceRisk.paginator.firstPage();
    }

    this.showListRisks = false;
    this.showListSelectRisks = true;
  }

  onAdd(risk: Risk){
    let exist = false;
    this.risksSelect.forEach((element)=>{
      if(element.id===risk.id) {
        exist = true
        Swal.fire('', `${ risk.name } ya fue agregado`, 'info');
      }
    });

    if(!exist){
      this.onAddRiskToCause(risk);
    }
  }

  getMapaCalor(){
    this.impactService.getMapaCalor().subscribe(( data => {
        this.heatmapItem = data;
      }
    ));
  }


  onAddRiskToCause(item: Risk){
    console.log(item);
    this.risksSelect.push(item);
    this.refreshListRisks();

  }

  onShowListRisk(){
    if(this.showListSelectRisks){
      this.showListRisks = true;
      this.showListSelectRisks = false;
    }else{
      this.showListRisks = false;
      this.showListSelectRisks = true;
    }
  }

  onResponsibleRiesgo(row: Risk){
    this.matDialog.open(ModalResponsibleComponent, {
        data: { responsible: row.responsibles },
        width: '50%',
        maxWidth: '50vw',
        disableClose: true,
        id: 'modal-resposible'
      });
  }

  getCategory(category: string){
    if(category == 'Causa'){
      this.category = CategoryCause;
    }else{
      this.category = CategoryConsequence;
    }
  }

  back() {
    this.router.navigate(['/causes/cause']);
    this.causeService.resetData();
  }

  onDeleteRisk(item: Risk){
      Swal.fire({
      title:  `¿ Estás seguro que deseas eliminar de la lista ${ item.name }?`,
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.risksSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.risksSelect.splice(index,1);
              this.causeService.deleteRisk(this.id, item.id);
              this.refreshListRisks();
            }
          });
      }
    })
  }

    
  refreshListRisks(){
    this.dataSourceRiskSelect = new MatTableDataSource(this.risksSelect);

    if (this.risksSelect.length == 0){
      this.showListRisks = false;
      this.showListSelectRisks = true;
    }else{
      this.showListRisks = true;
      this.showListSelectRisks = false;
    }
  }
  
  setValues(){
    this.data$.subscribe( data => {
      if(data.id > 0){
        this.f.name.setValue(data.name);
        this.f.description.setValue(data.description);
        this.f.type.setValue(data.type);
        this.id = data.id;
        
        this.getCategory(data.type); //Lleno la lista antes para poder setear el valor de category previamente guardado en bd.
        this.f.category.setValue(data.category);

        this.risksSelect = data.risks;
        this.refreshListRisks();
      }
    });
  }

  
  getInherenteData(row: any): { value: string, color: string } | null {
    const match = this.heatmapItem.find(item =>
      item.impacto === row.impact && item.frecuencia === row.frecuency
    );

    if (match) {
      return {
        value: match.inherente,
        color: match.colorInherente
      };
    }
    return null;
  }

  myFormValues() {
    this.form = this.formBuilder.group({
      name: ['',Validators.required], 
      type: ['',Validators.required], 
      category: ['',Validators.required], 
      description: [''],
    })
  }

  onSubmit() {

    this.submitted = true;

    if (this.form.invalid) { return; }

    this.loading = true;

    const cause: Cause = {
      name: this.f.name.value,
      category: this.f.category.value,
      type: this.f.type.value,
      description:  this.f.description.value,
      risks: this.risksSelect
    }

    console.log(cause);

    if(this.id == 0 || this.id == undefined){
      this.causeService.add(cause);
    }else{
      this.causeService.update(this.id, cause);
    }

  }

}
