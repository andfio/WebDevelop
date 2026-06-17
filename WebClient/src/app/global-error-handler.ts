import { ErrorHandler, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogContent } from './dialog-component';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private dialog: MatDialog) {}

  handleError(error: unknown): void {
    console.error('ERRORE GLOBALE FRONTEND:', error);

    this.dialog.open(DialogContent, {
      data: {
        DialogTitle: 'Errore',
        DialogMessage: 'Si è verificato un errore imprevisto:' + (error ?? "")
      },
      disableClose: true,
      hasBackdrop: true
    });
  }
}