import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (value === null || value === undefined || value === '') {
            return null;
        }
        /* Prüfe, ob nach dem Trimmen noch echte Zeichen übrig bleiben */
        const isWhitespaceOnly = String(value).trim().length === 0;
        /* Wenn es NUR Leerzeichen sind -> Fehler { whitespace: true } */
        return isWhitespaceOnly ? { whitespace: true } : null;
    };
}

export function limitYearLengthToFourDigits(event: Event, form: FormGroup): void {
    const input = event.target as HTMLInputElement;
    if (!input.value) return;
    const parts = input.value.split('-'); /* Format "YYYY-MM-DD" */
    const year = parts[0];
    if (year.length > 4) {
        const correctedYear = year.slice(0, 4);
        parts[0] = correctedYear;
        input.value = parts.join('-');
        /* Ganz wichtig bei Reactive Forms: Wir müssen Angular mitteilen, 
         dass wir den Wert im DOM manuell geändert haben! */
        form.get('enddate')?.setValue(input.value, { emitEvent: false });
    }
}

export function dateValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;
        if (isEmptyNullUndefined(value)) { return null }
        const inputDate = new Date(value);
        const invalidDateError = isInvalidDate(inputDate);
        if (invalidDateError) { return invalidDateError }; /* returns { invalidDate: true } */
        const minDateError = isMinDate(inputDate);
        if (minDateError) { return minDateError };
        const yearError = isYearInRange(inputDate);
        if (yearError) { return yearError };
        return null; /* all is valid */
    };
}

function isEmptyNullUndefined(value: any): boolean {
    return value === null || value === undefined || value === ''
}

function isInvalidDate(inputDate: Date): ValidationErrors | null {
    return isNaN(inputDate.getTime()) ? { invalidDate: true } : null;
}

function isMinDate(inputDate: Date): ValidationErrors | null {
    const today = new Date();
    today.setHours(0, 0, 0, 0); /* set time to 00:00:00.000 */
    const compareDate = new Date(inputDate);
    compareDate.setHours(0, 0, 0, 0); /* set InputDate time to 00:00:00.000 */
    if (compareDate < today) {
        return { minDate: true };
    }
    return null; /* date is today ot future date */
}

function isYearInRange(inputDate: Date): ValidationErrors | null {
    const currentYear = new Date().getFullYear(); /* i.e. 2026 */
    const maxYear = currentYear + 2; /* i.e. 2026 + 2 = 2028 */
    const inputYear = inputDate.getFullYear();
    if (inputYear > maxYear) {
        return { maxYear: true };
    }
    return null; /* is year in range of today and +2 */
}