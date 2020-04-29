import { Component, OnInit } from '@angular/core';
import {
  ToastController,
  Platform,
  NavController
} from '@ionic/angular';
import {
    GoogleMaps,
    GoogleMap,
    Marker,
    GoogleMapOptions,
    LatLng, Spherical
} from '@ionic-native/google-maps/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page  {
  private map: GoogleMap;
  currentMapTrack = null;
  isTracking = null;
  trackedRoute = [];
  positionSubscritpion: Subscription;
  marker: Marker;
  timeStart;
  timeEnd;
  current;
  duration = '00:00:00';
  distance = '0.0';
  speed = '0.0';
  constructor(private platform: Platform, private navController: NavController,
              private geoLocation: Geolocation, private toastCtrl: ToastController) {
      setInterval(() => {this.refTime(); }, 1000 );
  }

  public ngAfterViewInit() {
    this.platform.ready().then(() => this.initMap());
  }
  checkTime(i) {
        if (i < 10) {
            i = '0' + i.toString();
        }
        return i;
    }
  refTime() {
      if (this.isTracking === true) {
          this.timeEnd = new Date();
          this.current = new Date(this.timeEnd - this.timeStart);
          let temp = '';
          temp += this.checkTime(this.current.getUTCHours()) + ':';
          temp += this.checkTime(this.current.getUTCMinutes()) + ':';
          temp += this.checkTime(this.current.getUTCSeconds());
          this.duration = temp;
      }
  }
  private initMap(): void {
      this.geoLocation.getCurrentPosition({ enableHighAccuracy : true }).then((pos) => {
          const latLng: LatLng = new LatLng(pos.coords.latitude, pos.coords.longitude);
          const mapOptions: GoogleMapOptions = {
              camera: {
                  target: latLng,
                  zoom: 20,
                  tilt: 30
              }
          };
          this.map = GoogleMaps.create('map_canvas', mapOptions);
          this.marker = this.map.addMarkerSync({
              title: 'You',
              icon: { url: 'assets/icon/bike.png'},
              animation: 'DROP',
              position: latLng
          });
      }).catch((error) => {
          console.log(error);
      });

      const watch = this.geoLocation.watchPosition(
          { enableHighAccuracy : true, timeout: 10000 });
      watch.subscribe((pos) => {
          const position = new LatLng(pos.coords.latitude, pos.coords.longitude);
          const Cameraposition: any = {
              target: position
          };
          this.map.moveCamera(Cameraposition);
          this.marker.setPosition(position);
      });
  }

  startTracking() {
      this.timeStart = new Date();
      this.duration = '00:00:00';
      this.distance = '0.0';
      this.speed = '0.0';
      this.isTracking = true;
      this.trackedRoute = [];
      this.positionSubscritpion = this.geoLocation.watchPosition()
          .pipe(
              filter(p => p.coords !== undefined)
          ).subscribe(data => {
              setTimeout(() => {
                  this.trackedRoute.push(
                      {lat: data.coords.latitude, lng: data.coords.longitude});
                  this.redraw(this.trackedRoute);
                  this.marker.setPosition({
                      lat: data.coords.latitude,
                      lng: data.coords.longitude
                  });
                  this.distance = (Spherical.computeLength(this.trackedRoute) / 1000).toFixed(3);
                  this.speed = (Number.isNaN(data.coords.speed) ? 0 : (data.coords.speed * 3.6)).toFixed(3);
              });
          });
  }

  redraw(path) {
      if (this.currentMapTrack) {
          this.currentMapTrack.setMap(null);
      }
      if (path.length > 1) {
          this.map.addPolyline({
              points: path,
              geodesic: true,
              color: '#ff00ff',
              strokeWeight: 3
          });
      }
  }

  stopTracking() {
      this.isTracking = false;
      const newRoute = {finished: new Date().getTime(), path: this.trackedRoute};
      this.isTracking = false;
      this.positionSubscritpion.unsubscribe();
      this.currentMapTrack.setMap(null);
  }
}
