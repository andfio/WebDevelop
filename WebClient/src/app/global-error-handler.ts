import { ErrorHandler, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogContent } from './dialog-component';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  constructor(private dialog: MatDialog) {}

  handleError(error: unknown): void {
    const normalizedError = this.normalizeError(error);

    const errorDetails = {
      timestamp: new Date().toISOString(),
      page: window.location.href,
      message: normalizedError.message,
      stack: normalizedError.stack,
      originalError: error
    };

    console.group('ERRORE GLOBALE FRONTEND');
    console.error(errorDetails);
    console.error(normalizedError.stack);
    console.groupEnd();

    let stack = errorDetails.stack;

    this.dialog.open(DialogContent, {
      data: {
        DialogTitle: 'Errore',
        DialogMessage:
          `An unexpected error has occurred.\n\n` +
          `Message: ${normalizedError.message} \n\n\ Stack: ${stack}`
      },
      disableClose: true,
      hasBackdrop: true
    });
  }

  private normalizeError(error: unknown): Error {
    // Errore proveniente da Promise
    if (
      typeof error === 'object' &&
      error !== null &&
      'rejection' in error
    ) {
      return this.normalizeError((error as any).rejection);
    }

    // Errore standard JavaScript
    if (error instanceof Error) {
      return error;
    }

    // Errore generato dal browser
    if (error instanceof ErrorEvent) {
      return new Error(error.message);
    }

    // Stringhe o oggetti generici
    if (typeof error === 'string') {
      return new Error(error);
    }

    try {
      return new Error(JSON.stringify(error));
    } catch {
      return new Error('Errore non identificato');
    }
  }

}