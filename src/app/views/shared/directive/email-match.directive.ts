import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, ValidationErrors, UntypedFormGroup } from '@angular/forms';

@Directive({
  selector: '[emailMatch]',
  providers: [{ provide: NG_VALIDATORS, useExisting: EmailMatchDirective, multi: true }]

})
export class EmailMatchDirective implements Validator {

  @Input('emailMatch') emailMatch: string[] = [];

  constructor() { }

  validate(formGroup: UntypedFormGroup): ValidationErrors {
    return EmailMatch(this.emailMatch[0], this.emailMatch[1])(formGroup);
  }



}

function EmailMatch(controlName: string, matchingControlName: string) {
  return (formGroup: UntypedFormGroup) => {
    
    const control = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    // return null if controls haven't initialised yet
    if (!control || !matchingControl) {
      return null;
    }

    // return null if another validator has already found an error on the matchingControl
    if (matchingControl.errors && !matchingControl.errors.emailMatch) {
      return null;
    }

    // set error on matchingControl if validation fails
    if (control.value !== matchingControl.value) {
      matchingControl.setErrors({ emailMatch: true });
    } else {
      matchingControl.setErrors(null);
    }
  }
}

