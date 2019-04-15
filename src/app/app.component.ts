import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title: string = 'Angular Maps';

  lat: number = 51.678418;
  lng: number = 7.809007;

  coordinates= [
    {
      "lat":"-20.31601562",
      "lon":"-47.87713101"
    },
    {
      "lat":"28.43503199",
      "lon":"-96.49844316"
    },
    {
      "lat":"-20.6360047",
      "lon":"-177.62016748"
    },
    {
      "lat":"23.44454082",
      "lon":"-116.57702738"
    }
  ]
}
