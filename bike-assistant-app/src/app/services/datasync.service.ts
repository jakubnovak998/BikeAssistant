import { Injectable } from '@angular/core';
import {Storage} from '@ionic/storage';
import {Platform} from '@ionic/angular';
import {HTTP} from '@ionic-native/http/ngx';
import {AuthenticationService} from './authentication.service';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class TraceService {
  ipKey = '10.0.2.2';
  constructor(private storage: Storage, private plt: Platform, private http: HTTP, private authService: AuthenticationService) {
    this.plt.ready().then(() => {
      this.authService.checkToken();
      this.http.setServerTrustMode('nocheck');
      this.http.setDataSerializer('json');
    });
  }
  saveTrace(trace, date, distance, duration) {
    const self = this;
    const postData = {
      API_KEY: this.storage.get(TOKEN_KEY),
      TRACE: trace,
      DATE: date,
      DURATION: duration,
      DISTANCE: distance
    };
    return new Promise((resolve, reject) => {
      self.http.post('https://' + this.ipKey + ':5000/api/saveTrace', postData, {'Content-Type': 'application/json'})
          .then(data => {
                resolve(data);
              }
          )
          .catch(error => {
            reject(error);
          });
    });
  }

}
