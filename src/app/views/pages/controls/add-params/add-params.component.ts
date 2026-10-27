import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { ControlService } from 'src/app/core/services/Riesgo/control.service';
import { Control, ControlParams } from 'src/app/core/models/Risk/control';
import { filter } from 'rxjs';
import { ModalVariablesComponent } from 'src/app/views/shared/components/modal-variables/modal-variables.component';
import { ModalWeightsComponent } from 'src/app/views/shared/components/modal-weights/modal-weights.component';
import { ModalSolidityComponent } from 'src/app/views/shared/components/modal-solidity/modal-solidity.component';

@Component({
  selector: 'app-add-params',
  templateUrl: './add-params.component.html'
})
export class AddParamsComponent implements OnInit {
  loading = true;
  selectedRow;
  valueDesign = 0;
  valueExecution = 0;
  displayedColumns: string[] = ['name', 'weight','actions'];
  displayedColumnsSolidity: string[] = ['name', 'from', 'until', 'color', 'actions'];
  dataSource: MatTableDataSource<any>;
  dataSourceEjecution: MatTableDataSource<any>;
  dataSourceSolidity: MatTableDataSource<any>;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  params: ControlParams[] = [];
  weights: ControlParams[] = [];
  design: ControlParams[] = [];
  execution: ControlParams[] = [];
  solidity: ControlParams[] = [];
 
  constructor(
    private controlService: ControlService,
    public matDialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getParams();
  }

  getParams(){
    this.controlService.getAllParams().subscribe(( data => {
        this.params = data;
        this.weights = data.filter(x => x.module == 'Weights');
        this.design = data.filter(x => x.module == 'Design');
        this.execution = data.filter(x => x.module == 'Execution');
        this.solidity = data.filter(x => x.module == 'Solidity');

        this.valueDesign = Number(this.weights[0].parama);
        this.valueExecution = Number(this.weights[0].paramb);

        this.initTable(this.design);
        this.initTableExecution(this.execution);
        this.initTableSolidity(this.solidity);
      }
    ));
  }


  initTable(params: ControlParams[]){
    this.dataSource = new MatTableDataSource(params);
  }

  
  initTableExecution(params: ControlParams[]){
    this.dataSourceEjecution = new MatTableDataSource(params);
  }

  initTableSolidity(params: ControlParams[]){
    this.dataSourceSolidity = new MatTableDataSource(params);
  }

  openEditWeight(){
    const modalDialog = this.matDialog.open(ModalWeightsComponent, {
      data: { param:  this.weights },
      width: '40%',
      maxWidth: '40vw',
      disableClose: true,
      id: 'modal-params'
    });

    modalDialog.afterClosed().subscribe(data => {
      if (data != undefined){
        this.params.filter((value)=>{
          if(value.id === this.weights[0].id){
            this.valueDesign = data.result.design.value;
            this.valueExecution = data.result.execution.value;
            value.parama = data.result.design.value;
            value.paramb = data.result.execution.value;
          }
            return true;
          });
      }
    });
  }

  onEditVariables(row: ControlParams){
    const modalDialog = this.matDialog.open(ModalVariablesComponent, {
      data: { param: row },
      width: '40%',
      maxWidth: '40vw',
      disableClose: true,
      id: 'modal-variables'
    });

    modalDialog.afterClosed().subscribe(data => {
      if (data != undefined){
        this.params.filter((value)=>{
          if(value.id === row.id){
            value.parama = data.result.weight.value;
          }
          return true;
        });
      }
    });
  }

  onEditSolidity(row: ControlParams){
    const modalDialog = this.matDialog.open(ModalSolidityComponent, {
      data: { param: row },
      width: '40%',
      maxWidth: '40vw',
      disableClose: true,
      id: 'modal-solidity'
    });

    modalDialog.afterClosed().subscribe(data => {
      if (data != undefined){
        this.params.filter((value)=>{
          if(value.id === row.id){
            value.parama = data.result.from.value;
            value.paramb = data.result.until.value;
            value.paramc = data.result.color.value;
          }
          return true;
        });
      }
    });
  }

}
