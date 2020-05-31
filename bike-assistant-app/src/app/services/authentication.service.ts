import {Platform} from '@ionic/angular';
import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';
import {BehaviorSubject} from 'rxjs';
import {HTTP} from '@ionic-native/http/ngx';
import {Router} from '@angular/router';

const TOKEN_KEY = 'auth-token';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    authenticationState = new BehaviorSubject(false);
    ipKey = '10.0.2.2';

    constructor(private storage: Storage, private plt: Platform, private http: HTTP, private router: Router) {
        this.plt.ready().then(() => {
            this.checkToken();
            this.http.setServerTrustMode('nocheck');
            this.http.setDataSerializer('json');
        });
    }

    checkToken() {
        this.storage.get(TOKEN_KEY).then(res => {
            if (res) {
                this.authenticationState.next(true);
            }
        });
    }


    register(postData) {
        return new Promise((resolve, reject) => {
            this.http.post('https://' + this.ipKey + ':5000/api/register', postData, {'Content-Type': 'application/json'})
                .then(data => {
                        resolve(data);
                    }
                )
                .catch(error => {
                    reject(error);
                });
        });
    }

    login(loginData) {
        this.storage.set('TTS', 0);
        this.http.post('https://' + this.ipKey + ':5000/api/login', loginData, {'Content-Type': 'application/json'})
            .then((response: any) => {
                    const data = JSON.parse(response.data);
                    if (response.status === 200 && data.RESPONSE === 'SUCCESS') {
                        const tokenKey = data.API_KEY;
                        this.storage.set(TOKEN_KEY, tokenKey).then(() => {
                            this.authenticationState.next(true);
                            this.router.navigate(['tabs']);
                        });
                    }
                }
            )
            .catch(error => {
                console.log(error);
            });
    }


    logout() {
        return this.storage.remove(TOKEN_KEY).then(() => {
            this.authenticationState.next(false);
            this.router.navigate(['home']);
        });
    }

    isAuthenticated() {
        return this.authenticationState.value;
    }

}
