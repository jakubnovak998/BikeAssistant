import { Component } from '@angular/core';
import {Storage} from '@ionic/storage';
import {HTTP} from '@ionic-native/http/ngx';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})
export class Tab3Page {

  constructor(private storage: Storage, private http: HTTP) {}
  ipKey = '10.0.2.2';
  planValue = 0;
  planPeriod = 'day';

  createPlan() {
    this.storage.get('auth-token').then((apiKey) => {
      console.log('log:', apiKey);

      const postData = {
        API_KEY: apiKey,
        value: this.planValue,
        period: this.planPeriod,

      };
      console.log(postData);
      /*return new Promise((resolve, reject) => {
        this.http.post('https://' + this.ipKey + ':5000/api/saveTrace', postData, {'Content-Type': 'application/json'})
            .then(data => {
                  resolve(data);
                }
            )
            .catch(error => {
              reject(error);
            });
      }); */
    });
  }

}
