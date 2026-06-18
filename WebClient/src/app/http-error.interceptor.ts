import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError, timeout  } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {

  return next(req).pipe(
    timeout(10000),
    catchError((error: HttpErrorResponse | Error) => {

      if ((error as any)?.name === 'TimeoutError') {
        const message = 'Il backend non ha risposto entro il tempo massimo.';

        console.error('TIMEOUT HTTP:', {
          url: req.url,
          message,
          originalError: error
        });

        return throwError(() => ({
          name: 'TimeoutError',
          url: req.url,
          status: 0,
          message,
          userMessage: message,
          originalError: error
        }));
      }
      
      let message = 'Errore imprevisto';
      const httpError = error as HttpErrorResponse;

      if (httpError.status === 0) {
        message = 'Backend non raggiungibile o problema di rete';
      } else if (httpError.status === 400) {
        message = 'Richiesta non valida';
      } else if (httpError.status === 401) {
        message = 'Sessione non autorizzata';
      } else if (httpError.status === 403) {
        message = 'Accesso negato';
      } else if (httpError.status === 404) {
        message = 'Risorsa non trovata';
      } else if (httpError.status >= 500) {
        message = 'Errore interno del server';
      }

      console.error('ERRORE HTTP CENTRALIZZATO:', {
        url: req.url,
        status: httpError.status,
        message,
        originalError: error
      });

      return throwError(() => ({
        name: 'HttpError',
        url: req.url,
        status: httpError.status,
        message,
        userMessage: message,
        originalError: error
      }));
    })
  );
};
