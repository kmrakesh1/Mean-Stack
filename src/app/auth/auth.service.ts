import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

const BACKEND_URL ='http://localhost:3000/api/user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private token: string;
  private isAuthenticated = false;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer : any;
  private userId : string;

  constructor(private http: HttpClient, private router: Router) {}
  createUser(email:string, password:string) {
    const authData: AuthData = { email:email, password:password };
    this.http.post(BACKEND_URL+ '/signup',authData)
      .subscribe((response) => {
        this.router.navigate(["/"]);
      },error=> {
        this.authStatusListener.next(false);
      });
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  getIsAuth(){
    return this.isAuthenticated;
  }

  getUserId(){
    return this.userId;
  }

  login(email:string, password:string) {
    const authData: AuthData = { email:email, password:password };
    this.http
      .post<{token: string , expiresIn: number, userId:string}>(BACKEND_URL+ '/login',authData)
      .subscribe((response) => {
        const token = response.token;
        this.token = token;
        if(token){
          const expireInDuration = response.expiresIn;
          this.setAuthTimer(expireInDuration);
          this.isAuthenticated = true;
          this.userId = response.userId;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expireInDuration*1000);
          this.saveAuthData(token, expirationDate,  this.userId);
          this.router.navigate(["/"]);
        }
      }, error => {
        this.authStatusListener.next(false);
      });
  }

  logout(){
    this.token = null;
    this.userId = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(["/"]);
  }


  getToken(){
    return this.token;
  }

  autoAuthUser(){
    const authInformation = this.getAuthData();
    if(!authInformation){
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if(expiresIn > 0) {
      this.token = authInformation.token;
      this.userId = authInformation.userId;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn/1000);
      this.authStatusListener.next(true);
    }
  }

  private saveAuthData(token: string , expirationDate: Date, userId:string){
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
    localStorage.setItem('userId',  userId);
  }

  private setAuthTimer(duration: number){
    console.log("Setting Timer:"+duration)
    this.tokenTimer = setTimeout(()=> { 
      this.logout();
    }, duration * 1000);


  }

  private clearAuthData(){
    localStorage.removeItem('token');
    localStorage.removeItem('expirationDate');
    localStorage.removeItem('userId');
  }
  private getAuthData(){
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expirationDate");
    const userId = localStorage.getItem("userId");
    if(!token || !expirationDate) {
      return;
    }
    return {
      token : token ,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }
}
