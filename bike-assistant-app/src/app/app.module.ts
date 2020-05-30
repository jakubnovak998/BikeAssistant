import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { GoogleMaps } from '@ionic-native/google-maps/ngx';
import { Toast } from '@ionic-native/toast/ngx';
import { HTTP } from '@ionic-native/http/ngx';
import { LocalNotifications} from '@ionic-native/local-notifications/ngx';

import { IonicStorageModule } from '@ionic/storage';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {TabsPageModule} from './tabs/tabs.module';
import {TabsPage} from './tabs/tabs.page';

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [BrowserModule, IonicModule.forRoot(), AppRoutingModule, IonicStorageModule.forRoot(), TabsPageModule],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    GoogleMaps,
    Toast,
    HTTP,
    LocalNotifications,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
