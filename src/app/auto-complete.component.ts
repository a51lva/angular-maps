import { Component, ViewChild, EventEmitter, Output, OnInit, AfterViewInit, Input } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'AutocompleteComponent',
    template: `
    <div class="md-form">
        <input type="text" [(ngModel)]='autocompleteInput' class="form-control" #addresstext mdbInput>
        <label for="searchField">Search location</label>
    </div>
    `,
})
export class AutocompleteComponent implements OnInit, AfterViewInit {
    @Input() adressType: string;
    @Output() setAddress: EventEmitter<any> = new EventEmitter();
    @ViewChild('addresstext') addresstext: any;

    autocompleteInput: string;
    queryWait: boolean;

    constructor() {
    }

    ngOnInit() {
    }

    ngAfterViewInit() {
        this.getPlaceAutocomplete();
    }

    private getPlaceAutocomplete() {
        const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
            {
                componentRestrictions: { country: 'PT' },
                types: [this.adressType]  // 'establishment' / 'address' / 'geocode'
            });
        google.maps.event.addListener(autocomplete, 'place_changed', () => {
            const place = autocomplete.getPlace();
            this.invokeEvent(place);
        });
    }

    invokeEvent(place: Object) {
        this.setAddress.emit(place);
    }

}