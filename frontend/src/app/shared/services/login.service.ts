import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { User } from '../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Credentials } from '../models/credentials';

const jsonOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'accept': 'application/json',
  }), credentials: 'same-origin',
  withCredentials: true
};

const LOGIN_URL = environment.BaseApiUrl + "/login";
const LOGOUT_URL = environment.BaseApiUrl + "/logout";

@Injectable({
  providedIn: 'root'
})

export class LoginService {
  isUserLoggedIn = false;

  constructor(private http: HttpClient) { }

  isLoggedIn(): boolean {
    return this.isUserLoggedIn;
  }

  logout() {
    this.isUserLoggedIn = false;
    this.http.post(LOGOUT_URL, null, jsonOptions).subscribe();
  }

  login(credentials: Credentials): Observable<User> {
    console.log("login with credentials");
    return this.http.post<User>(LOGIN_URL, credentials, jsonOptions).pipe(tap({
      next: user => {
        if (user.id) {
          console.log("logged in with cookie");
          this.isUserLoggedIn = true;
        }
      },
      error: err => { console.error(err); },
    }));

  }

  loginWithCookie(): Observable<User> {
    console.log("tried login with cookie");
    return this.http.get<User>(LOGIN_URL, jsonOptions).pipe(tap({
      next: user => {
        if (user.id) {
          console.log("logged in with cookie");
          this.isUserLoggedIn = true;
        }
      },
      error: err => { console.error(err); },
    }));
  }
}
