import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { HTTP } from '@ionic-native/http/ngx';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  authenticationState = new BehaviorSubject(false);

  constructor(private storage: Storage, private plt: Platform, private http: HTTP) {
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
      const self = this;
      return new Promise((resolve, reject) => {
          self.http.post('https://10.0.2.2:5000/api/register', postData, {'Content-Type': 'application/json'})
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
      const self = this;
      return new Promise((resolve, reject) => {
          self.http.post('https://10.0.2.2:5000/api/login', loginData, {'Content-Type': 'application/json'})
              .then((data: any) => {
                  if (data.API_KEY) {
                      this.storage.set(TOKEN_KEY, data.API_KEY).then(() => {
                          this.authenticationState.next(true);
                          resolve(data);
                      });
                  }
                  }
              )
              .catch(error => {
                  reject(error);
              });
      });
  }

  logout() {
    return this.storage.remove(TOKEN_KEY).then(() => {
      this.authenticationState.next(false);
    });
  }

  isAuthenticated() {
    return this.authenticationState.value;
  }

}
