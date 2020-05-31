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
  beginDate = new Date ();
  endDate = new Date(this.beginDate.getFullYear() - 2, this.beginDate.getMonth() + 22, this.beginDate.getDate() + 63);
  period = 'day';
  apiKey = '';
  plans = [];

  ngOnInit() {
      this.getAllData();
  }

  onChange() {
    switch (this.period) {
      case 'day':
        this.endDate = new Date(this.beginDate.getFullYear() - 2, this.beginDate.getMonth() + 22, this.beginDate.getDate() + 63);
        break;
      case 'week':
        this.endDate = new Date(this.beginDate.getFullYear(), this.beginDate.getMonth(), this.beginDate.getDate() + 8);
        break;
      case 'month':
        this.endDate = new Date(this.beginDate.getFullYear(), this.beginDate.getMonth() + 1, this.beginDate.getDate() + 1);
        break;
      case 'year':
        this.endDate = new Date(this.beginDate.getFullYear() + 1, this.beginDate.getMonth(), this.beginDate.getDate() + 1);
        break;
    }
  }

  getApiKey(): any {
      return new Promise((resolve, reject) => {
          this.storage.get('auth-token').then((apiKey) => {
              this.apiKey = apiKey;
              resolve();
          }).catch(() => {
              reject();
          });
      });
  }

  createPlan() {
      if (this.apiKey) {
      const postData = {
        API_KEY: this.apiKey,
        goal: this.planValue,
        beginDate: this.beginDate.toISOString().substr(0, 10),
        endDate: this.endDate.toISOString().substr(0, 10),
      };

      this.http.post('https://' + this.ipKey + ':5000/api/plan', postData, {'Content-Type': 'application/json'})
            .then(data => {
                  console.log(data);
                  this.getAllData();
                }
            )
            .catch(error => {
              console.log(error);
            });
      }
  }

  getPlans() {
        this.http.get('https://' + this.ipKey + ':5000/api/plans/' + this.apiKey, {}, {'Content-Type': 'application/json'})
        .then(response => {
              const data = JSON.parse(response.data);
              this.plans = data.plans;
              console.log(data.plans);
            }
        )
        .catch(error => {
          console.log(error);
        });
  }

  getAllData() {
      this.getApiKey().then(response => {
          this.getPlans();
          }
      ).catch(error => {
              console.log(error);
          });
  }

    doRefresh(event) {
        this.getAllData();
        setTimeout(() => {
            event.target.complete();
        }, 2000);
    }
}
