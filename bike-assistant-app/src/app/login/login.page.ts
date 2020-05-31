import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';


@Component({
    selector: 'app-login',
    templateUrl: './login.page.html',
    styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
    username = '';
    password = '';
    validationsLoginForm;
    buttonDisabled = true;
    constructor(private authService: AuthenticationService, private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.validationsLoginForm = this.formBuilder.group({
            username: new FormControl('', Validators.compose([
                Validators.required,
                Validators.pattern('^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$')
            ])),
            password: new FormControl('', Validators.compose([
                Validators.required,
                Validators.pattern('^[A-Za-z]\\w{7,14}$')
            ]))
        });
        this.buttonDisabled = this.getFormControl('username').invalid || this.getFormControl('password').invalid;

    }

    getFormControl(name) {
        return this.validationsLoginForm.get(name);
    }

    login() {
        const loginData = {
            username: this.username,
            password: this.password
        };
        this.authService.login(loginData);
    }

}
