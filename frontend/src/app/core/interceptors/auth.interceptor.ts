import { Injectable } from '@angular/core';
import {
  HttpRequest, HttpHandler, HttpEvent,
  HttpInterceptor, HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { TokenService } from '../../services/token.service';
import { AuthService } from '../../services/auth.service';

const PUBLIC_PATHS = [
  '/api/auth/',
  '/api/events/track',
  '/api/widgets/public/',
  '/api/gamif-page/public/',
  '/api/levels/config/',
  '/api/streaks/config/',
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private tokenService: TokenService,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isPublicGet = req.method === 'GET' &&
      PUBLIC_PATHS.some(path => req.url.includes(path));

    const token = this.tokenService.getToken();

    const authReq = (token && !isPublicGet)
      ? req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })
      : req;

    return next.handle(authReq).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 401 && !isPublicGet) this.authService.logout();
        return throwError(() => err);
      })
    );
  }
}