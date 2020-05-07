import { Component } from '@angular/core';
import {TraceService} from '../services/datasync.service';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  history  = [];
  constructor(private traceService: TraceService) {
    this.traceService.getTrace().then((response: any) => {
      this.history = response;
    });
  }
  hmsToSeconds(hms) {
    const a = hms.split(':');
    return (+a[0]) * 60 * 60 + (+a[1]) * 60 + (+a[2]);
  }
  getAvgSpeed(duration, distance) {
    const avg = parseFloat(distance) / (this.hmsToSeconds(duration) / 3600.0);
    return avg.toFixed(3);
  }
  doRefresh(event) {
    console.log('Begin async operation');
    this.traceService.getTrace().then((response: any) => {
      this.history = response;
    });
    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }
}
