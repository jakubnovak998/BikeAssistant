import { Component, OnInit } from '@angular/core';
import {AuthenticationService} from '../services/authentication.service';
import {Storage} from '@ionic/storage';

@Component({
  selector: 'app-tab4',
  templateUrl: './tab4.page.html',
  styleUrls: ['./tab4.page.scss'],
})
export class Tab4Page implements OnInit {

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

  ngOnInit() {
  }

}
