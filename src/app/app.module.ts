import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AgmCoreModule } from '@agm/core';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';

import { MDBBootstrapModule } from 'angular-bootstrap-md';
import { FormsModule } from '@angular/forms';
import { AutocompleteComponent } from './auto-complete.component';
import { NgScrollbarModule } from 'ngx-scrollbar';

import {config} from '../config.js';

@NgModule({
  declarations: [
    AppComponent,
    AutocompleteComponent
  ],
  imports: [
    BrowserModule,
    MDBBootstrapModule.forRoot(),
    AppRoutingModule,
    AgmCoreModule.forRoot({
      apiKey:config.G_MAPS_KEY
    }),
    AgmJsMarkerClustererModule,
    FormsModule,
    NgScrollbarModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
