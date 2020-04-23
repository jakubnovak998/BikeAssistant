import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
    username = '';
    password = '';
  constructor(private authService: AuthenticationService) { }

  ngOnInit() {
  }

  login() {
      console.log(this.username);
      console.log(this.password);
      const loginData = {
          username: this.username,
          password: this.password
      };
      this.authService.login(loginData);
  }

}
