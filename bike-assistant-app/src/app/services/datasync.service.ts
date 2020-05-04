import { Injectable } from '@angular/core';
import {Storage} from '@ionic/storage';
import {Platform} from '@ionic/angular';
import {HTTP} from '@ionic-native/http/ngx';


const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class TraceService {
  ipKey = '10.0.2.2';
  api;
  constructor(private storage: Storage, private plt: Platform, private http: HTTP) {
    this.plt.ready().then(() => {
      this.http.setServerTrustMode('nocheck');
      this.http.setDataSerializer('json');
    });
  }

  saveTrace(trace, date, distance, duration) {
    this.api = '';
    this.storage.get(TOKEN_KEY).then((res) => {
     console.log('log:', res);
     this.api = res;
     console.log('log2:', this.api);
     const postData = {
      API_KEY: this.api,
      TRACE: trace,
      DATE: date,
      DURATION: duration,
      DISTANCE: distance
     };
     return new Promise((resolve, reject) => {
      this.http.post('https://' + this.ipKey + ':5000/api/saveTrace', postData, {'Content-Type': 'application/json'})
          .then(data => {
                resolve(data);
              }
          )
          .catch(error => {
            reject(error);
          });
    }); });
  }

}
