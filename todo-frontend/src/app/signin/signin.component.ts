import { Component } from '@angular/core';
import { TokenService } from '../services/token.service';
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
  username = '';
  loginErrorMessage = '';
  signupErrorMessage = '';
  isLoginLoading = false;
  isSignupLoading = false;

  constructor(
    private authService: AuthService,
    private tokenService: TokenService,
    private router: Router
  ) {}

  onSubmit() {
    this.loginErrorMessage = '';
    this.isLoginLoading = true;

    this.authService.login(this.email, this.password).subscribe(
      (response: any) => {
        this.isLoginLoading = false;
        const token = response.token;
        this.tokenService.setToken(token);
        this.router.navigate(['todo-list']);
      },
      (error) => {
        this.isLoginLoading = false;
        this.loginErrorMessage = error?.error?.message || 'Login failed';
      }
    );
  }

  signup() {
    this.signupErrorMessage = '';
    this.isSignupLoading = true;

    this.authService.signup(this.username, this.email, this.password).subscribe(
      (response) => {
        this.isSignupLoading = false;
        console.log('Signup successful', response);
        alert('Signup successful! Please login.');

        const chk = document.getElementById('chk') as HTMLInputElement;
        if (chk) chk.checked = false;
      },
      (error) => {
        this.isSignupLoading = false;
        this.signupErrorMessage = error?.error?.message || 'Signup failed';
      }
    );
  }
}
