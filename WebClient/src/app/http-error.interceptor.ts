import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Errore imprevisto';

      if (error.status === 0) {
        message = 'Backend non raggiungibile o problema di rete';
      } else if (error.status === 400) {
        message = 'Richiesta non valida';
      } else if (error.status === 401) {
        message = 'Sessione non autorizzata';
      } else if (error.status === 403) {
        message = 'Accesso negato';
      } else if (error.status === 404) {
        message = 'Risorsa non trovata';
      } else if (error.status >= 500) {
        message = 'Errore interno del server';
      }

      console.error('ERRORE HTTP CENTRALIZZATO:', {
        url: req.url,
        status: error.status,
        message,
        originalError: error
      });

      return throwError(() => ({
        ...error,
        userMessage: message
      }));
    })
  );
};