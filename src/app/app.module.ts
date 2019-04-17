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
      apiKey: 'AIzaSyB-L9pOYUZqlx7fQLmEkHSfcsE__AuqD-I'
    }),
    AgmJsMarkerClustererModule,
    FormsModule,
    NgScrollbarModule
    
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
