import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Responsibles } from 'src/app/core/models/Risk/project';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserService } from 'src/app/core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { ModalResponsibleComponent } from 'src/app/views/shared/components/modal-responsible/modal-responsible.component';
import { ChangeDetectorRef } from '@angular/core';
import { Documented } from 'src/app/views/shared/helpers/documented';
import { TypeControl } from 'src/app/views/shared/helpers/type-control';
import { TypeExecution } from 'src/app/views/shared/helpers/type-execution';
import { Control, ControlParams } from 'src/app/core/models/Risk/control';
import { ControlService } from 'src/app/core/services/Riesgo/control.service';
import { RiskService } from 'src/app/core/services/Riesgo/risk.service';
import { Risk } from 'src/app/core/models/Risk/risk';
import { Observable } from 'rxjs';
import { Frecuency } from 'src/app/views/shared/helpers/frecuency';
import { HasEvidence } from 'src/app/views/shared/helpers/has-evidence';
import { HasResponsible } from 'src/app/views/shared/helpers/has-responsible';
import { Events } from 'src/app/views/shared/helpers/events';
import { ControlEfective } from 'src/app/views/shared/helpers/control-efective';
import { EvidenceEfective } from 'src/app/views/shared/helpers/evidence-efective';
import { CorrectTime } from 'src/app/views/shared/helpers/correct-time';
import { HeatmapItem } from 'src/app/core/models/Risk/impacto-frecuencia';
import { ImpactService } from 'src/app/core/services/Riesgo/impact.service';

@Component({
  selector: 'app-add-control',
  templateUrl: './add-control.component.html'
})
export class AddControlComponent implements OnInit {
  private data$: Observable<Control>;
  responsables: Responsibles[];
  form: UntypedFormGroup;
  id: number;
  loading = false;
  submitted = false;
  showList = false;
  showListSelect = true;
  showListRisks = false;
  showListSelectRisks = true;
  onAsociar = false;
  selectedRow;
  userSelect: any[] = [];
  risksSelect: Risk[] = [];
  risks: Risk[] = [];
  heatmapItem: HeatmapItem[] = [];

  displayedColumns: string[] = ['fullName', 'dependence', 'position', 'actions'];
  dataSource: MatTableDataSource<Responsibles>;
  @ViewChild('paginatorUsers') paginatorUsers: MatPaginator;
  @ViewChild('sortUsers', { static: false }) sortUsers: MatSort;

  displayedColumnsSelect: string[] =  ['fullName', 'dependence', 'position', 'actions'];
  dataSourceSelect: MatTableDataSource<any>;

  displayedColumnsRisk: string[] = ['id', 'name', 'inherente', 'residual', 'actions'];
  dataSourceRisk: MatTableDataSource<Risk>;
  @ViewChild('paginatorRisks') paginatorRisks: MatPaginator;
  @ViewChild('sortRisks', { static: false }) sortRisks: MatSort;

  dataSourceRiskSelect: MatTableDataSource<Risk>;

  type: any[] = [];
  typeExecution: any[] = [];
  frecuency: any[] = [];
  documented: any[] = [];
  hasEvidence: any[] = [];
  hasResponsible: any[] = [];
  eventsAssociated: any[] = [];
  controlEfective: any[] = [];
  evidenceEfective: any[] = [];
  correctTime: any[] = [];

  params: ControlParams[] = [];

  qualification = 'Sin calificación';
  color: string;
  qualificationExecution = 'Sin calificación';
  executionColor: string;
  porcentage: number = 0;
  porcentageExecution: number = 0;
  resultQualification: number = 0;
  finalQualification: string;
  finalColor: string;

  constructor(
    private controlService: ControlService,
    private riskService: RiskService,
    private userService: UserService,
    private impactService: ImpactService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    public matDialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {
      this.myFormValues();
      this.documented = Documented;
      this.type = TypeControl;
      this.typeExecution = TypeExecution;
      this.frecuency = Frecuency;
      this.hasEvidence = HasEvidence;
      this.hasResponsible = HasResponsible;
      this.eventsAssociated = Events;
      this.controlEfective = ControlEfective;
      this.evidenceEfective = EvidenceEfective;
      this.correctTime = CorrectTime;
      this.data$ = controlService.sharing;
   }

  get f() { return this.form.controls; }

  
  async ngOnInit() {
    this.setValues();
    this.getParams();
    this.getUsers();
    this.getMapaCalor();
    this.getRisks();
    this.cdr.detectChanges();
  }

  getUsers(){
    this.userService.getAll().subscribe( data => {
      this.initTable(data);
    });
  }

  getParams(){
    this.controlService.getAllParams().subscribe(( data => {
        this.params = data;
      }
    ));
  }
  
  ngAfterViewInit() {

  }

  getRisks(){
    this.riskService.getAllForAccosiate().subscribe(( data => {
        this.risks = data;
        this.initTableRisk(data);
      }
    ));
    this.cdr.detectChanges(); 
  }

  
  getMapaCalor(){
    this.impactService.getMapaCalor().subscribe(( data => {
        this.heatmapItem = data;
      }
    ));
  }

  getQualification(): void {
    let totalWeightedScore = 0;

    const controlKeys = [
      'qualify',
      'executionType',
      'isFrequent',
      'isDocument',
      'hasEvidence',
      'responsibleAssigned'
    ];

    for (const key of controlKeys) {
      const selectedOption = this.form.get(key)?.value;

      if (selectedOption && selectedOption.id != null) {
        // Encuentra el peso de la variable
        const variableWeightConfig = this.params.find(p => p.id === selectedOption.id);
        if (variableWeightConfig) {
          const variableWeight = parseFloat(variableWeightConfig.parama) || 0; // Peso definido en params
          const optionWeight = selectedOption.porcentage || 0;                 // Peso de la opción seleccionada

          totalWeightedScore += (variableWeight * optionWeight) / 100;
        }
      }
    }

    this.porcentage = totalWeightedScore;

    // Determinar calificación final según el módulo 'Solidity'
    const solidityParams = this.params.filter(p => p.module === 'Solidity');
    const match = this.getNameByValue(this.porcentage, solidityParams);

    if (match) {
      this.qualification = match.name;     // Nombre a mostrar
      this.color = match.paramc;       // Color asociado
    } else {
      this.qualification= '';
      this.color = '#ccc'; // Color por defecto
    }

    //Resultado Final TODO: ajustar no es entre 2. Hay que tomar el peso del diseño y la ejecución para obtener ... 
    this.resultQualification = (this.porcentage + this.porcentageExecution) / 2;
    const finalResult = this.getNameByValue(this.resultQualification, solidityParams);

    if (finalResult) {
      this.finalQualification = finalResult.name;     // Nombre a mostrar
      this.finalColor = finalResult.paramc;       // Color asociado
    } else {
      this.finalQualification= '';
      this.finalColor = '#ccc'; // Color por defecto
    }
  }

  getQualificationExecution(): void {
    let totalWeightedScore = 0;

    const controlKeys = [
      'eventsAssociated',
      'isEffective',
      'isEvidenceEffective',
      'correctTime',
    ];

    for (const key of controlKeys) {
      const selectedOption = this.form.get(key)?.value;

      if (selectedOption && selectedOption.id != null) {
        // Encuentra el peso de la variable
        const variableWeightConfig = this.params.find(p => p.id === selectedOption.id);
        if (variableWeightConfig) {
          const variableWeight = parseFloat(variableWeightConfig.parama) || 0; // Peso definido en params
          const optionWeight = selectedOption.porcentage || 0;                 // Peso de la opción seleccionada

          totalWeightedScore += (variableWeight * optionWeight) / 100;
        }
      }
    }

    this.porcentageExecution = totalWeightedScore;

    // Determinar calificación final según el módulo 'Solidity'
    const solidityParams = this.params.filter(p => p.module === 'Solidity');
    const match = this.getNameByValue(this.porcentageExecution, solidityParams);

    if (match) {
      this.qualificationExecution = match.name;     // Nombre a mostrar
      this.executionColor = match.paramc;       // Color asociado
    } else {
      this.qualificationExecution = '';
      this.executionColor = '#ccc'; // Color por defecto
    }

    //Resultado Final
    this.resultQualification = (this.porcentage + this.porcentageExecution) / 2;
    const finalResult = this.getNameByValue(this.resultQualification, solidityParams);

    if (finalResult) {
      this.finalQualification = finalResult.name;     // Nombre a mostrar
      this.finalColor = finalResult.paramc;       // Color asociado
    } else {
      this.finalQualification= '';
      this.finalColor = '#ccc'; // Color por defecto
    }

  }
  
  getNameByValue(value: number, items: ControlParams[]): ControlParams | null {
    return items.find(item => {
      const from = parseFloat(item.parama);
      const to = parseFloat(item.paramb);
      return value >= from && value <= to;
    }) || null;
  }


  initTable(user: Responsibles[]){
    this.dataSource = new MatTableDataSource(user);
    if (this.paginatorUsers) {
      this.dataSource.paginator = this.paginatorUsers;
      this.dataSource.sort = this.sortUsers;
    }
    this.loading = false;
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
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }

    this.showList = false;
    this.showListSelect = true;
  }

  applyFilterRisks(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceRisk.filter = filterValue.trim().toLowerCase();
    if (this.dataSourceRisk.paginator) {
      this.dataSourceRisk.paginator.firstPage();
    }

    this.showListRisks = false;
    this.showListSelectRisks = true;
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

  getResidualData(row: any): { value: string; color: string } | null {
    if (!row?.frequencyWeight || !row?.impactWeight || this.resultQualification === undefined) {
      return null;
    }

    const inherent = row.frequencyWeight * row.impactWeight;
    const residual = inherent * (1 - (this.resultQualification / 100));

    let value = 'Bajo';
    let color = '#66cc66';

    if (residual >= 15) {
      value = 'Alto';
      color = '#ff4d4d';
    } else if (residual >= 8) {
      value = 'Medio';
      color = '#ffcc00';
    }

    return { value, color };
  }


  back() {
    this.router.navigate(['/controls/control']);
    this.controlService.resetData();
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

  onAddRisk(risk: Risk){
    let exist = false;
    this.risksSelect.forEach((element)=>{
      if(element.id===risk.id) {
        exist = true
        Swal.fire('', `${ risk.name } ya fue agregado`, 'info');
      }
    });

    if(!exist){
      this.onAddRiskToControl(risk);
    }
  }

  onAddRiskToControl(item: Risk){
    this.risksSelect.push(item);
    this.refreshListRisks();
  }

  onAdd(item: Responsibles){
    let exist = false;
    this.userSelect.forEach((element)=>{
      if(element.id===item.id) {
        exist = true
        Swal.fire('', `${ item.fullName } ya fue agregado`, 'info');
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
      title:  `¿ Estás seguro que deseas eliminar de la lista a ${ item.fullName }?`,
      showDenyButton: true,
      confirmButtonText: `Eliminar`,
    }).then((result) => {
      if (result.isConfirmed){
          this.userSelect.forEach((element,index)=>{
            if(element.id==item.id) {
              this.userSelect.splice(index,1);
              this.controlService.deleteUser(this.id, item.id);
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
              this.riskService.deleteControl(item.id, this.id);
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

  onResponsibleRiesgo(row: Control){
    this.matDialog.open(ModalResponsibleComponent, {
        data: { responsible: row.responsibles },
        width: '50%',
        maxWidth: '50vw',
        disableClose: true,
        id: 'modal-resposible'
      });
  }

  setValues(){
    this.data$.subscribe( data => {
      if(data.id > 0){
        this.f.name.setValue(data.name);

        const selectedQualityItem = this.type.find(item => item.value === data.qualify);
        this.f.qualify.setValue(selectedQualityItem);

        const selectedExecutionTypeItem = this.typeExecution.find(item => item.value === data.executionType);
        this.f.executionType.setValue(selectedExecutionTypeItem);

        const selectedDocumentItem = this.documented.find(item => item.value === data.isDocument);
        this.f.isDocument.setValue(selectedDocumentItem);
     
        const selectedFrecuentItem = this.frecuency.find(item => item.value === data.isFrequent);
        this.f.isFrequent.setValue(selectedFrecuentItem);

        const selectedHasEvidenceItem = this.hasEvidence.find(item => item.value === data.hasEvidence);
        this.f.hasEvidence.setValue(selectedHasEvidenceItem);

        const selectedHasResponsibleItem = this.hasResponsible.find(item => item.value === data.responsibleAssigned);
        this.f.responsibleAssigned.setValue(selectedHasResponsibleItem);

        const selectedEventsAssociatedItem = this.eventsAssociated.find(item => item.value === data.eventsAssociated);
        this.f.eventsAssociated.setValue(selectedEventsAssociatedItem);

        const selectedisEffectiveItem = this.controlEfective.find(item => item.value === data.isEffective);
        this.f.isEffective.setValue(selectedisEffectiveItem);

        const selectedIsEvidenceEffectiveItem = this.evidenceEfective.find(item => item.value === data.isEvidenceEffective);
        this.f.isEvidenceEffective.setValue(selectedIsEvidenceEffectiveItem);

        const selectedItem = this.correctTime.find(item => item.value === data.correctTime);
        this.f.correctTime.setValue(selectedItem);

        this.porcentage = parseFloat(data.percentageDesign);
        this.porcentageExecution = parseFloat(data.percentageExecution);
        this.resultQualification = parseFloat(data.percentageResult);

        this.finalQualification = data.solidityResult;
        this.qualification = data.solidityDesign;
        this.qualificationExecution = data.solidityExecution;


        this.f.description.setValue(data.description);
        this.id = data.id;
        this.userSelect = data.responsibles;
        this.refreshList();
        this.risksSelect = data.risks;
        this.refreshListRisks();
      }
    });
  }


  myFormValues() {
    this.form = this.formBuilder.group({
      name: ['',Validators.required], 
      qualify: ['',Validators.required], 
      executionType: ['',Validators.required], 
      isFrequent: ['',Validators.required], 
      isDocument: ['',Validators.required], 
      hasEvidence: ['',Validators.required],
      responsibleAssigned: ['',Validators.required],
      eventsAssociated: ['',Validators.required], 
      isEffective: ['',Validators.required], 
      isEvidenceEffective: ['',Validators.required], 
      correctTime: ['',Validators.required], 
      description: [''], 
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

    const control: Control = {
      name: this.f.name.value,
      description:  this.f.description.value,
      executionType:  this.f.executionType.value.value,
      qualify:  this.f.qualify.value.value,
      isFrequent:  this.f.isFrequent.value.value,
      isDocument:  this.f.isDocument.value.value,
      hasEvidence:  this.f.hasEvidence.value.value,
      responsibleAssigned:  this.f.responsibleAssigned.value.value, 
      eventsAssociated:  this.f.eventsAssociated.value.value,
      isEffective:  this.f.isEffective.value.value,
      isEvidenceEffective:  this.f.isEvidenceEffective.value.value,
      correctTime:  this.f.correctTime.value.value,
      solidityDesign: this.qualification,
      solidityExecution: this.qualificationExecution,
      solidityResult: this.finalQualification,
      percentageDesign: this.porcentage.toString(),
      percentageExecution: this.porcentageExecution.toString(),
      percentageResult: this.resultQualification.toString(),
      responsibles: this.userSelect,
      risks: this.risksSelect
    }

    console.log(control);

    if(this.id == 0 || this.id == undefined){
      this.controlService.add(control);
    }else{
      this.controlService.update(this.id, control);
    }
  }
}
