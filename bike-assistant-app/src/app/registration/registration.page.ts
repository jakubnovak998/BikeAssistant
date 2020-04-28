import {Component, OnInit} from '@angular/core';
import {HTTP} from '@ionic-native/http/ngx';
import {AuthenticationService} from '../services/authentication.service';

@Component({
    selector: 'app-registration',
    templateUrl: './registration.page.html',
    styleUrls: ['./registration.page.scss'],
})
export class RegistrationPage implements OnInit {
    name = '';
    email = '';
    password = '';

    constructor(private http: HTTP, private authService: AuthenticationService) {
    }

    ngOnInit() {
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
