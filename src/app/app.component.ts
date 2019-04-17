import { Component, OnInit, ViewChild, NgZone, HostListener } from '@angular/core';
import { MouseEvent,MapsAPILoader, AgmMap } from '@agm/core';
declare var google: any;

interface Marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
  visible:boolean;
}

interface Location {
  lat: number;
  lng: number;
  viewport?: Object;
  zoom: number;
  address_level_1?: string;
  address_level_2?: string;
  address_country?: string;
  address_zip?: string;
  address_state?: string;
  marker?: Marker;
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit{
  image = "/assets/images/haircut.png";
  image2 = "/assets/images/haircut2.png";
  address: Object;
  establishmentAddress: Object;
  infoWindowIsOpen: boolean = false;
  formattedAddress: string;
  formattedEstablishmentAddress: string;

  phone: string;
  geocoder: any;
  lat: number = 38.7341836;
  lng: number = -9.1443516;

  public location: Location = {
    lat: 38.7341836,
    lng: -9.1443516,
    marker: {
      lat: 38.7341836,
      lng: -9.1443516,
      draggable: true,
      visible:false
    },
    zoom: 15
  };

  @ViewChild(AgmMap) private map: any;
  @HostListener('window:resize')
    onWindowResize() {
    this.map.triggerResize()
        .then(() =>  this.map._mapsWrapper.setCenter({lat: this.location.lat, lng: this.location.lng}));
  }

  constructor(public mapsApiLoader: MapsAPILoader, public zone: NgZone) {
    this.getMyLocation = this.getMyLocation.bind(this);
    this.mapsApiLoader = mapsApiLoader;

    this.mapsApiLoader.load().then(() => {
      this.geocoder = new google.maps.Geocoder();
    });
  }
  
  ngOnInit(): void {
    this.getMyLocation();
  }

  updateOnMap() {
    this.findLocation(this.establishmentAddress);
  }

  findLocation(address) {
    if (!this.geocoder) { this.geocoder = new google.maps.Geocoder(); }
    this.geocoder.geocode({
      'address': address
    }, (results, status) => {
      if (status == google.maps.GeocoderStatus.OK) {
        for (var i = 0; i < results[0].address_components.length; i++) {
          let types = results[0].address_components[i].types;

          if (types.indexOf('locality') !== -1) {
            this.location.address_level_2 = results[0].address_components[i].long_name;
          }
          if (types.indexOf('country') !== -1) {
            this.location.address_country = results[0].address_components[i].long_name;
          }
          if (types.indexOf('postal_code') !== -1) {
            this.location.address_zip = results[0].address_components[i].long_name;
          }
          if (types.indexOf('administrative_area_level_1') !== -1) {
            this.location.address_state = results[0].address_components[i].long_name;
          }
        }

        if (results[0].geometry.location) {
          this.location.lat = results[0].geometry.location.lat();
          this.location.lng = results[0].geometry.location.lng();
          this.location.marker.lat = results[0].geometry.location.lat();
          this.location.marker.lng = results[0].geometry.location.lng();
          this.location.marker.draggable = true;
          this.location.marker.visible = true;
          this.location.viewport = results[0].geometry.viewport;
        }

        this.map.triggerResize()
        .then(() =>  this.map._mapsWrapper.setCenter({lat: this.location.lat, lng: this.location.lng}));

        this.location.zoom = 18;

      } else {
        alert("Sorry, this search produced no results.");
      }
    });
  }

  findAddressByCoordinates() {
    this.geocoder.geocode({
      'location': {
        lat: this.location.marker.lat,
        lng: this.location.marker.lng
      }
    }, (results, status) => {
      this.decomposeAddressComponents(results);
    });
  }

  decomposeAddressComponents(addressArray) {
    if (addressArray.length == 0) { return false; }
    let address = addressArray[0].address_components;

    for (let element of address) {
      if (element.length == 0 && !element['types']) { continue; }

      if (element['types'].indexOf('street_number') > -1) {
        this.location.address_level_1 = element['long_name'];
        continue;
      }
      if (element['types'].indexOf('route') > -1) {
        this.location.address_level_1 += ', ' + element['long_name'];
        continue;
      }
      if (element['types'].indexOf('locality') > -1) {
        this.location.address_level_2 = element['long_name'];
        continue;
      }
      if (element['types'].indexOf('administrative_area_level_1') > -1) {
        this.location.address_state = element['long_name'];
        continue;
      }
      if (element['types'].indexOf('country') > -1) {
        this.location.address_country = element['long_name'];
        continue;
      }
      if (element['types'].indexOf('postal_code') > -1) {
        this.location.address_zip = element['long_name'];
        continue;
      }
    }
  }

  getAddress(place: object) {
    this.address = place['formatted_address'];
    this.phone = this.getPhone(place);
    this.formattedAddress = place['formatted_address'];
    this.zone.run(() => this.formattedAddress = place['formatted_address']);
  }

  getEstablishmentAddress(place: object) {
    this.establishmentAddress = place['formatted_address'];
    this.phone = this.getPhone(place);
    this.formattedEstablishmentAddress = place['formatted_address'];
    this.zone.run(() => {
      this.formattedEstablishmentAddress = place['formatted_address'];
      this.phone = place['formatted_phone_number'];
      this.findLocation(this.establishmentAddress);
    });

    
  }

  getAddrComponent(place, componentTemplate) {
    let result;

    for (let i = 0; i < place.address_components.length; i++) {
      const addressType = place.address_components[i].types[0];
      if (componentTemplate[addressType]) {
        result = place.address_components[i][componentTemplate[addressType]];
        return result;
      }
    }
    return;
  }

  getStreetNumber(place) {
    const COMPONENT_TEMPLATE = { street_number: 'short_name' },
      streetNumber = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return streetNumber;
  }

  getStreet(place) {
    const COMPONENT_TEMPLATE = { route: 'long_name' },
      street = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return street;
  }

  getCity(place) {
    const COMPONENT_TEMPLATE = { locality: 'long_name' },
      city = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return city;
  }

  getState(place) {
    const COMPONENT_TEMPLATE = { administrative_area_level_1: 'short_name' },
      state = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return state;
  }

  getDistrict(place) {
    const COMPONENT_TEMPLATE = { administrative_area_level_2: 'short_name' },
      state = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return state;
  }

  getCountryShort(place) {
    const COMPONENT_TEMPLATE = { country: 'short_name' },
      countryShort = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return countryShort;
  }

  getCountry(place) {
    const COMPONENT_TEMPLATE = { country: 'long_name' },
      country = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return country;
  }

  getPostCode(place) {
    const COMPONENT_TEMPLATE = { postal_code: 'long_name' },
      postCode = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return postCode;
  }

  getPhone(place) {
    const COMPONENT_TEMPLATE = { formatted_phone_number: 'formatted_phone_number' },
      phone = this.getAddrComponent(place, COMPONENT_TEMPLATE);
    return phone;
  }

  getMyLocation(){
    navigator.geolocation.watchPosition(position => this.updateGeocodes(position));
  }

  updateGeocodes(position){
    this.lat = position.coords.latitude;
    this.lng =  position.coords.longitude;
  }

  markerDragEnd(m: Marker, $event: MouseEvent) {
    let lat = $event.coords.lat;
    let lng = $event.coords.lng;
    const geocoder = new google.maps.Geocoder();
    const latlng = new google.maps.LatLng(lat, lng);
    const request = {
      latLng: latlng
    };

    geocoder.geocode(request, (results, status) => {
      this.zone.run(() => {
        this.formattedEstablishmentAddress = results[0].formatted_address
        this.findLocation(results[0].formatted_address);
      })
    });


  }
  
  title: string = 'Angular Maps';
  coordinates= [
    {
      "lat":"38.73189729",
      "lon":"-9.12099244"
    },
    {
      "lat":"38.72859432",
      "lon":"-9.1531508"
    },
    {
      "lat":"38.72837575",
      "lon":"-9.12637335"
    },
    {
      "lat":"38.75554776",
      "lon":"-9.13844235"
    },
    {
      "lat":"38.75492086",
      "lon":"-9.13864636"
    },
    {
      "lat":"38.71956896",
      "lon":"-9.10173635"
    },
    {
      "lat":"38.76901401",
      "lon":"-9.10387957"
    },
    {
      "lat":"38.73732394",
      "lon":"-9.15822104"
    },
    {
        "lon":"-9.17109489440918",
        "lat":"38.73942318235305"
    },
    {
        "lon":"-9.172897338867186",
        "lat":"38.71926901003093"
    },
    {
        "lon":"-9.144487380981445",
        "lat":"38.70674511619313"
    },
    {
        "lon":"-9.123544692993164",
        "lat":"38.71371054721669"
    },
    {
        "lon":"-9.117193222045898",
        "lat":"38.73092028807231"
    },
    {
        "lon":"-9.130582809448242",
        "lat":"38.749129973637835"
    },
    {
        "lon":"-9.153928756713867",
        "lat":"38.7486614002349"
    },
    {
        "lon":"-9.17109489440918",
        "lat":"38.73942318235305"
    }
  ]

  styles = [
    {
        "featureType": "administrative",
        "elementType": "labels.text.fill",
        "stylers": [
            {
                "color": "#444444"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "color": "#f2f2f2"
            }
        ]
    },
    {
        "featureType": "poi",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "saturation": -100
            },
            {
                "lightness": 45
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "transit",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "color": "#46bcec"
            },
            {
                "visibility": "on"
            }
        ]
    }
]

  styles2 = [
  {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#a0d6d1"
          },
          {
              "lightness": 17
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#ffffff"
          },
          {
              "lightness": 20
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#dedede"
          },
          {
              "lightness": 17
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#dedede"
          },
          {
              "lightness": 29
          },
          {
              "weight": 0.2
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#dedede"
          },
          {
              "lightness": 18
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#ffffff"
          },
          {
              "lightness": 16
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#f1f1f1"
          },
          {
              "lightness": 21
          }
      ]
  },
  {
      "elementType": "labels.text.stroke",
      "stylers": [
          {
              "visibility": "on"
          },
          {
              "color": "#ffffff"
          },
          {
              "lightness": 16
          }
      ]
  },
  {
      "elementType": "labels.text.fill",
      "stylers": [
          {
              "saturation": 36
          },
          {
              "color": "#333333"
          },
          {
              "lightness": 40
          }
      ]
  },
  {
      "elementType": "labels.icon",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  },
  {
      "featureType": "transit",
      "elementType": "geometry",
      "stylers": [
          {
              "color": "#f2f2f2"
          },
          {
              "lightness": 19
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [
          {
              "color": "#fefefe"
          },
          {
              "lightness": 20
          }
      ]
  },
  {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [
          {
              "color": "#fefefe"
          },
          {
              "lightness": 17
          },
          {
              "weight": 1.2
          }
      ]
  }
]
}