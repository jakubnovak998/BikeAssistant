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
import {TraceService} from '../services/datasync.service';
import { TextToSpeech } from '@ionic-native/text-to-speech/ngx';
import {Storage} from '@ionic/storage';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {
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
    ttsDistance;
    ttsPrevDistance;
    ttsTimeTemp;
    ttsActive = true;
    headphones;

    constructor(private platform: Platform, private navController: NavController,
                private geoLocation: Geolocation, private toastCtrl: ToastController,
                private traceService: TraceService, private tts: TextToSpeech,
                private storage: Storage, private socialSharing: SocialSharing) {
        setInterval(() => {
            this.refTime();
        }, 1000);
        this.headphoneStatus();
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
        this.geoLocation.getCurrentPosition({enableHighAccuracy: true}).then((pos) => {
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
                icon: {url: 'assets/icon/bike.png'},
                animation: 'DROP',
                position: latLng
            });
        }).catch((error) => {
            console.log(error);
        });

        const watch = this.geoLocation.watchPosition(
            {enableHighAccuracy: true, timeout: 10000});
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
        this.map.clear();
        this.traceService.getTrace().then((response: any) => {
            for (const i of response) {
                this.map.addPolyline({
                    points: i.TRACE,
                    geodesic: true,
                    color: '#DCDCDC',
                    strokeWeight: 2
                });

            }
        });
        this.storage.get('TTS').then((res) => {
            if (res === 1) {
                this.ttsActive = true;
            } else {
                this.ttsActive = false;
            }
        });
        this.ttsDistance = 0;
        this.ttsPrevDistance = 0.0;
        this.timeStart = new Date();
        this.ttsTimeTemp = new Date();
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
                    if (((this.ttsActive === true && this.headphones === true) || this.ttsActive === false)
                        && parseInt(this.distance, 10) > this.ttsDistance) {
                        this.ttsStats();
                        this.ttsPrevDistance = parseFloat(this.distance);
                        this.ttsDistance = parseInt(this.distance, 10);
                        this.ttsTimeTemp = new Date();
                    }
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
        if ((this.ttsActive === true && this.headphones === true) || this.ttsActive === false) {
            this.ttsStats();
        }
        this.traceService.saveTrace(this.trackedRoute, this.timeEnd.toISOString().substr(0, 10), this.distance, this.duration);
        const newRoute = {finished: new Date().getTime(), path: this.trackedRoute};
        this.isTracking = false;
        this.positionSubscritpion.unsubscribe();
        this.currentMapTrack.setMap(null);

    }

    ttsStats() {
        const timer = new Date(this.timeEnd - this.ttsTimeTemp);
        let timeSeconds = timer.getUTCHours() * 3600 + timer.getUTCMinutes() * 60 + timer.getUTCSeconds();
        if (timeSeconds === 0) {
            timeSeconds = 1;
        }
        const newDistance = parseFloat(this.distance) - parseFloat(this.ttsPrevDistance);
        let readyTime = '';
        let temp = timer.getUTCHours();
        if (temp === 1) {
            readyTime += temp.toString() + 'hour ';
        } else if (temp > 1) {
            readyTime += temp.toString() + 'hours ';
        }
        temp = timer.getUTCMinutes();
        if (temp === 1) {
            readyTime += temp.toString() + 'minute ';
        } else if (temp > 1) {
            readyTime += temp.toString() + 'minutes ';
        }
        temp = timer.getUTCSeconds();
        if (temp === 1) {
            readyTime += temp.toString() + 'second ';
        } else if (temp > 1) {
            readyTime += temp.toString() + 'seconds ';
        }
        this.tts.speak('Time: ' + readyTime + ' average speed ' + (newDistance / (timeSeconds / 3600)).toFixed(2) + 'kilometers per hour')
            .then(() => console.log('Success'))
            .catch((reason: any) => console.log(reason));
    }

    headphoneStatus() {
        const that = this;
        (<any> window).HeadsetDetection.detect(
            function(detected) {
                that.headphones = detected;
            });
        document.addEventListener('deviceready', function() {
            (<any> window).HeadsetDetection.registerRemoteEvents(function(status) {
                switch (status) {
                    case 'headsetAdded':
                        that.headphones = true;
                        break;
                    case 'headsetRemoved':
                        that.headphones = false;
                        break;
                }
            });
        });
    }

    shareStats(mode) {
        const message = 'Today I reached ' + this.distance + ' km in ' + this.duration;
        switch (mode) {
            case 1:
                this.socialSharing.shareViaFacebook(message, null, null).catch(error => {
                    console.log('Facebook:' + error);
                });
                break;
            case 2:
                this.socialSharing.shareViaTwitter(message, null, null).catch(error => {
                    console.log(error);
                });
                break;
            case 3:
                this.socialSharing.share(message, null, null, null).catch(error => {
                console.log(error);
                });
                break;
        }
    }
}
