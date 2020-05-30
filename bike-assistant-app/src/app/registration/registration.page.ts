import {Component, OnInit} from '@angular/core';
import {HTTP} from '@ionic-native/http/ngx';
import {AuthenticationService} from '../services/authentication.service';
import { Validators, FormBuilder, FormGroup, FormControl } from '@angular/forms';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.page.html',
    styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
    name = '';
    email = '';
    password = '';
    validationsRegisterForm;

    constructor(private http: HTTP, private authService: AuthenticationService, private formBuilder: FormBuilder) {
    }

    ngOnInit() {
        this.validationsRegisterForm = this.formBuilder.group({
            username: new FormControl('', Validators.compose([
                Validators.required,
                Validators.pattern('^(?=[a-zA-Z0-9._]{8,20}$)(?!.*[_.]{2})[^_.].*[^_.]$')
            ])),
            password: new FormControl('', Validators.compose([
                Validators.required,
                Validators.pattern('^[A-Za-z]\\w{7,14}$')
            ])),
            email: new FormControl('', Validators.compose([
                Validators.required,
                Validators.pattern('^(([^<>()\\[\\]\\\\.,;:\\s@"]+(\\.[^<>()\\[\\]\\\\.,;:\\s@"]+)*)' +
                    '|(".+"))@((\\[[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\])|(([a-zA-Z\\-0-9]+\\.)+[a-zA-Z]{2,}))$')
            ])),
        });
    }

    getFormControl(name) {
        return this.validationsRegisterForm.get(name);
    }

    async onSubmit() {
        const registerData = {
            username: this.name,
            password: this.password,
            mail: this.email
        };
        const loginData = {
            username: this.name,
            password: this.password
        };
        this.authService.register(registerData).then((response: any) => {
            const data = JSON.parse(response.data);
            if (response.status === 200 && data.RESPONSE === 'SUCCESS') {
                this.authService.login(loginData);
            }
        });
    }
}
