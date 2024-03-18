import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

interface User {
  username: string;
  email: string;
  password: string;
  password2?: string;
  security_question: string;
  security_answer: string;
}

interface formData{
  username: string
  security_question: string
  security_answer: string
  new_password: string
  confirm_password: string

}

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  API_URL = 'http://localhost:8000/api'; //Django API URL


  constructor(private http: HttpClient) { }

  register(userData: User): any {
    return this.http.post(`${this.API_URL}/register/`, userData);
  }

  login(loginData: {username: string, password: string}): any {
    return this.http.post(`${this.API_URL}/token/`, loginData);
  }

  resetPassword(userData: formData): any {
    return this.http.post(`http://127.0.0.1:8000/api/forgot-password/`, userData);
  }
  
  // User Operations
  getUserDetail(username: string): any {
    return this.http.get(`${this.API_URL}/users/${username}/`);
  }

  getUserProfile(username: string): any {
    return this.http.get(`${this.API_URL}/users/${username}/profile/`);
  }

  updateUserProfile(username: string, profileData: any): any {
    return this.http.put(`${this.API_URL}/users/${username}/profile/`, profileData);
  }

  getCurrentUser(): any {
    return this.http.get(`${this.API_URL}/users/me/`);
  }

 

}