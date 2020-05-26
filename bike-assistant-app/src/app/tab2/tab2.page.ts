import { Component } from '@angular/core';
import {TraceService} from '../services/datasync.service';
import {
  GoogleMaps,
  GoogleMap,
  Marker,
  GoogleMapOptions
} from '@ionic-native/google-maps/ngx';
@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {
  history  = [];
  showMap = false;
  temp;
  trace = [];
  private map: GoogleMap;
  marker: Marker;
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
  hideShow() {
    this.showMap = ! this.showMap;
  }
  showHistoricalTrace(i)  {
    this.temp = i;
    this.trace = i.TRACE;
    this.hideShow();
    this.loadMap(this.trace[this.trace.length - 1]);
    this.map.addPolyline({
      points: this.trace,
      geodesic: true,
      color: '#ff00ff',
      strokeWeight: 3
    });

  }
  loadMap(pos) {

    const mapOptions: GoogleMapOptions = {
      camera: {
        target: {
          lat: pos.lat,
          lng: pos.lng
        },
        zoom: 20,
        tilt: 30
      }
    };

    this.map = GoogleMaps.create('map_canvas', mapOptions);

    this.marker = this.map.addMarkerSync({
      title: 'END',
      icon: 'blue',
      animation: 'DROP',
      position: {
        lat: pos.lat,
        lng: pos.lng
      }
    });
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
