import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'; 
import { ControlParams } from 'src/app/core/models/Risk/control';
import { ControlService } from 'src/app/core/services/Riesgo/control.service';

export interface DialogData { param: ControlParams }

@Component({
  selector: 'app-modal-variables',
  templateUrl: './modal-variables.component.html'
})
export class ModalVariablesComponent implements OnInit {
  title: string = '';
  submitted = false;
  loading = false;
  form: UntypedFormGroup;
  constructor(
    private controlService: ControlService,
     public dialogRef: MatDialogRef<ModalVariablesComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private formBuilder: UntypedFormBuilder,
  ) {
    this.myFormValues();
  }

  get f() { return this.form.controls; }

  ngOnInit(): void {
    console.log(this.data.param);
    this.title = this.data.param.name;
  }


  closeModal() {
    this.dialogRef.close();
  }

  myFormValues() {
    this.form = this.formBuilder.group({
      weight: [this.data.param.parama,Validators.required],
    })
  }

  onSubmit() {

    this.submitted = true;

    if (this.form.invalid) { return; }

    this.loading = true;

    
    const params: ControlParams = {
      name: this.data.param.name,
      parama:  this.f.weight.value,
      paramb:  '0',
      paramc:  '0',
      module:  this.data.param.module
    }

    console.log(params);

    this.controlService.updateParams(this.data.param.id, params);

    this.dialogRef.close({result:this.f});
  }


}
