// forgot-password.component.ts

import { Component } from '@angular/core';
import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  formData = {
    username: '',
    security_question: '',
    security_answer: '',
    new_password: '',
    confirm_password: ''
  };

  constructor(private apiService: ApiService, private toastr: ToastrService, private route:Router) { }

  securityQuestions: string[] = [
    'What is your mother\'s maiden name?',
    'What city were you born in?',
    'What is the name of your first pet?'
  ];


  onSubmit() {
    console.log(this.formData)
    this.apiService.resetPassword(this.formData).subscribe(
      (response: any) => {
      
        this.toastr.success('Password reset successfully.');

        this.route.navigate(['login'])

      },
      (error: any) => {
        console.log(error)
        this.toastr.error('Failed to reset password. Please try again.');
      }
    );
  }
}
