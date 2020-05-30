import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {LocalNotifications} from '@ionic-native/local-notifications/ngx';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

  constructor(private authService: AuthenticationService, private localNotifications: LocalNotifications) {}

  isScheduled = false;

  ngOnInit() {
    this.localNotifications.isScheduled(1).then((isScheduled) => {
      this.isScheduled = isScheduled;
    });
  }

  ttsActive = false;
  constructor(private authService: AuthenticationService, private storage: Storage) {
    this.getTTS();
  }
  getTTS() {
    this.storage.get('TTS').then((res) => {
      if (res === 1) {
        this.ttsActive = true;
      } else {
        this.ttsActive = false;
      }
    });
  }
  setTTS() {
    let temp;
    print();
    if (this.ttsActive) {
      temp = 1;
    } else {
      temp = 0;
    }
    this.storage.set('TTS', temp);
    console.log('state: ' + this.ttsActive);
  }
  print() {
    console.log('state: ' + this.ttsActive);
  }
  logout() {
    this.authService.logout();
  }

  scheduleNotification() {
    this.localNotifications.schedule({
      id: 1,
      title: 'BikeAssistant',
      text: 'There is next week of cycling waiting for You !',
      trigger: { count: 1, every: { weekday: 7, hour: 20, minute: 0 } },
    });
    this.isScheduled = !this.isScheduled;
  }

  cancelNotification() {
  this.localNotifications.cancelAll()
      .then(response => {
        this.isScheduled = !this.isScheduled;
      }
      ).catch(error => {
        console.log(error);
      });
  }

  toggleNotifications() {
    if (this.isScheduled) {
      this.cancelNotification();
    } else {
      this.scheduleNotification();
    }
  }

}
