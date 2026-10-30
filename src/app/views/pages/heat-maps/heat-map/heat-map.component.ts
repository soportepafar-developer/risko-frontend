import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { HeatmapItem, ImpactoFrecuencia } from 'src/app/core/models/Risk/impacto-frecuencia';
import { ImpactService } from 'src/app/core/services/Riesgo/impact.service';
import { FrecuenceService } from 'src/app/core/services/Riesgo/frequency.service';
import { ModalImpactComponent } from 'src/app/views/shared/components/modal-impact/modal-impact.component';
import { RiskService } from 'src/app/core/services/Riesgo/risk.service';
import { Risk } from 'src/app/core/models/Risk/risk';

  
@Component({
  selector: 'app-heat-map',
  templateUrl: './heat-map.component.html',
  styleUrls: ['./heat-map.component.scss']
})
export class HeatMapComponent implements OnInit {
  form: UntypedFormGroup;
  submitted = false;
  loading = false;
  impacts: ImpactoFrecuencia[] = [];
  frecuences: ImpactoFrecuencia[] = [];
  risks: Risk[] = [];

  heatmapItem: HeatmapItem[] = [];
  selectedItem: any = null;
  //frecuenciaLabels = ['Frecuente', 'Probable', 'Ocasional', 'Posible', 'Improbable'];
  //impactoLabels = ['Insignificante', 'Menor', 'Moderado', 'Mayor', 'Catastrófico'];

  frecuenciaLabels: string[] = [];
  impactoLabels: string[] = [];


  selectedRow;
  displayedColumns: string[] = ['descripcion', 'peso', 'porcentaje', 'actions'];
  dataSource: MatTableDataSource<ImpactoFrecuencia>;
  dataSourceFrecuencia: MatTableDataSource<ImpactoFrecuencia>;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('paginatorFrecuencia') paginatorFrecuencia: MatPaginator;

  
  constructor(
    private impactService: ImpactService,
    private frequenceService: FrecuenceService,
    private riskService: RiskService,
    public matDialog: MatDialog,
    private formBuilder: UntypedFormBuilder,
  ) { 
    this.myFormValues();
  }

  
  get f() { return this.form.controls; }

  ngOnInit(): void {
    this.getImpacts();
    this.getFrecuences();
    this.getMapaCalor();
    this.getRisks();
  }

  getImpacts(){
    this.impactService.getAll().subscribe(( data => {
         this.impactoLabels = data.map(item => item.descripcion);
         this.impacts = data;
         this.initTableImpacto(data);
      }
    ));
  }

  getFrecuences(){
    this.frequenceService.getAll().subscribe(( data => {
        this.frecuenciaLabels = data.map(item => item.descripcion);
        this.frecuences = data;
        this.initTableFrecuencia(data);
      }
    ));
  }

  getRisks(){
      this.riskService.getAll().subscribe(( data => {
        this.risks = data;
      }
    ));
  }

  getMapaCalor(){
    this.impactService.getMapaCalor().subscribe(( data => {
        this.heatmapItem = data;
      }
    ));
  }

  getGridArea(item: HeatmapItem): string {
    return `${item.frecuencia + 1} / ${item.impacto + 1}`;
  }

  getCellStyle(item: { impacto: number; frecuencia: number; color: string }) {
    const col = item.impacto + 1;          // Impacto crece de izquierda a derecha (1 → columna 2)
    const row = 7 - item.frecuencia;       // Frecuencia crece de abajo a arriba (1 → fila 6)

    return {
      background: item.color,
      gridColumn: col,
      gridRow: row
    };
  }

  //No esta funcionando correctamente
  // onColorSelected(event: Event): void {
  //   const color = (event.target as HTMLInputElement).value;
  //   if (this.selectedItem) {
  //     this.selectedItem.color = color;
  //   }
  // }


  getRisksIdsForCell(item: HeatmapItem): number[] {
  return this.risks
    .filter(risk => risk.impact === item.impacto && risk.frequency === item.frecuencia)
    .map(risk => risk.id);
  }

  getRiskNameById(id: number): string {
    const risk = this.risks.find(r => r.id === id);
    return risk ? risk.name : '';
  }

  addImpacto(){
    
    this.submitted = true;
  
    const impacto: ImpactoFrecuencia = {
      descripcion: this.f.impacto.value,
      peso: this.f.peso.value,
      porcentaje: this.f.porcentaje.value,
    }

    console.log(impacto);

    this.loading = true;

    this.impactService.add(impacto).then(() => {
      this.impacts.push({
        descripcion: this.f.impacto.value,
        peso: this.f.peso.value,
        porcentaje: this.f.porcentaje.value,
      });

      this.initTableImpacto(this.impacts);

      this.f.impacto.setValue('');
      this.f.peso.setValue('');
      this.f.porcentaje.setValue('');
    });
  }

  initTableImpacto(values: ImpactoFrecuencia[]){
    this.dataSource = new MatTableDataSource(values);
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    this.loading = false;
    this.paginator._intl.itemsPerPageLabel = 'Filas';
  }

  addFrecuencia(){
    
    this.submitted = true;
  
    const impacto: ImpactoFrecuencia = {
      descripcion: this.f.frecuencia.value,
      peso: this.f.pesof.value,
      porcentaje: this.f.porcentajef.value,
    }

    this.loading = true;

    console.log(impacto);

    this.frequenceService.add(impacto).then(() => {
      this.frecuences.push({
        descripcion: this.f.frecuencia.value,
        peso: this.f.pesof.value,
        porcentaje: this.f.porcentajef.value,
      });

      this.loading = false;
      this.initTableFrecuencia(this.frecuences);

      
      this.f.frecuencia.setValue('');
      this.f.pesof.setValue('');
      this.f.porcentajef.setValue('');
    });
  }

  initTableFrecuencia(values: ImpactoFrecuencia[]){
    this.dataSourceFrecuencia = new MatTableDataSource(values);
    if (this.paginatorFrecuencia) {
      this.dataSourceFrecuencia.paginator = this.paginatorFrecuencia;
    }

    this.paginator._intl.itemsPerPageLabel = 'Filas';
  }

  onEdit(row: ImpactoFrecuencia, module: string){
   const modalDialog =  this.matDialog.open(ModalImpactComponent, {
        data: { values: row, module: module },
        width: '40%',
        maxWidth: '40vw',
        disableClose: true,
        id: 'modal-impact'
    });

    modalDialog.afterClosed().subscribe(data => {
      if (data != undefined){
        if(data.entity == 'Impacto'){
          this.impacts.filter((value)=>{
            // Verifica si el ID del impacto coincide con el ID del dato recibido
            if(value.id === data.id){
                value.descripcion = data.result.descripcion.value;
                value.peso = data.result.peso.value;
                value.porcentaje = data.result.porcentaje.value;
            }

            // Actualiza impactoLabels con las nuevas descripciones
            this.impactoLabels = this.impacts.map(i => i.descripcion);

            return true;

          });
        }else{
          this.frecuences.filter((value)=>{
            if(value.id === data.id){
                value.descripcion = data.result.descripcion.value;
                value.peso = data.result.peso.value;
                value.porcentaje = data.result.porcentaje.value;
            }

            // Actualiza frecuenciaLabels con las nuevas descripciones
            this.frecuenciaLabels = this.frecuences.map(i => i.descripcion);

            return true;

          });

        }
      }
    })
  }

  onDelele(id:number, name: string){

  }

  onCellClick(item: any): void {
    this.selectedItem = item;
    console.log('Celda seleccionada:', item);

    var cell = {
      impactoId: item.impacto,
      frecuenciaId: item.frecuencia,
      color: this.f.color.value,
    }

    console.log(cell);
  
    //this.impactService.updateMapaCalor(item.id, cell);
  }

  myFormValues() {
    this.form = this.formBuilder.group({
      impacto: ['',Validators.required], 
      peso: ['',Validators.required], 
      porcentaje: ['',Validators.required],
      frecuencia: ['',Validators.required], 
      pesof: ['',Validators.required], 
      porcentajef: ['',Validators.required],
      color: ['#000000'] // Default color
    })
  }
}
