import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';
import { Responsibles } from 'src/app/core/models/Risk/project';

export interface DialogData { responsible: Responsibles[] }

@Component({
  selector: 'app-modal-responsible',
  templateUrl: './modal-responsible.component.html'
})
export class ModalResponsibleComponent implements OnInit {
  selectedRow;
  displayedColumns: string[] = ['fullName','dependence','position'];
  dataSource: MatTableDataSource<Responsibles>;

  constructor(
     public dialogRef: MatDialogRef<ModalResponsibleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.initTable(this.data.responsible);
  }

  initTable(responsible: Responsibles[]){
    this.dataSource = new MatTableDataSource(responsible);
  }

  closeModal() {
    this.dialogRef.close();
  }

}
