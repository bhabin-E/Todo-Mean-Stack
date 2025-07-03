import { Component } from '@angular/core';
import axios from 'axios';
import { TokenService } from '../services/token.service'; // Import
import { AuthService } from '../services/auth.service'; 
import { Router } from '@angular/router';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})


export class SigninComponent {
  email = '';
  password = '';
  loginErrorMessage = '';
  signupErrorMessage = '';

  
  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  onSubmit() {
    this.loginErrorMessage = '';
    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        const token = response.token;
        this.tokenService.setToken(token);
        this.router.navigate(['todo-list']);
      },
      (error) => {
        this.loginErrorMessage = error?.error?.message || 'Login failed';
      }
    );
  }

  username = '';

  signup() {
    this.signupErrorMessage = '';
    this.authService.signup(this.username, this.email, this.password).subscribe(
      (response) => {
        console.log('Signup successful', response);
        alert('Signup successful! Please login.');
        const chk = document.getElementById('chk') as HTMLInputElement;
        if (chk) {
          chk.checked = false; 
        }
      },
      (error) => {
        this.signupErrorMessage = error?.error?.message || 'Signup failed';
      }
    );
  }




}
