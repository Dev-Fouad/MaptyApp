'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    date = new Date()
    id = (new Date() + '').slice(-10)

    constructor (coords, distance, duration) {
        this.coords = coords
        this.distance = distance
        this.duration = duration
    }

}

class Running extends Workout {
    constructor(coords , distance, duration, Cadence){
        super(coords, distance, duration)
        this.Cadence  = Cadence
        this.calcPace()
    }

    calcPace(){
        this.pace = this.duration / this.distance
    }
}

class Cycling extends Workout {
    constructor(coords , distance, duration, elevationGain){
        super(coords, distance, duration)
        this.elevationGain  = elevationGain
        this.calcSpeed()
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60)
    }
}

class App {
    #map;
    #mapEvent;

    constructor() {
      this._getPosition();
      form.addEventListener('submit' , this._newWorkout.bind(this))
      inputType.addEventListener('change' , this._toggleElevationField)
    }

    _getPosition() {
        if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition( this._loadMap.bind(this) , function() {
            alert('Could not get your Position')
        }
    )} 

    _loadMap(position) {
        let {latitude} = position.coords
        let {longitude} = position.coords
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

        let coords = [latitude , longitude]

        this.#map = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        // Handling clicks on map
        this.#map.on('click' , this._showform.bind(this))
    }

    _showform(mapE) {
        this.#mapEvent = mapE
        form.classList.remove('hidden')
        inputDistance.focus()
    }

    _toggleElevationField() {
        inputType.addEventListener('click' , function(){
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden') 
        })
    }

    _newWorkout() {
        e.preventDefault()

        // Clear input fields
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value

        // Display Marker
        let {lat , lng} = this.#mapEvent.latlng
            L.marker([lat , lng])
            .addTo(this.#map)
            .bindPopup(
                L.popup({
                  maxWidth: 250,
                  minWidth: 100,
                  autoClose: false,
                  closeOnClick: false,
                  className: 'running-popup'
                })
            )
            .setPopupContent('Workout')
            .openPopup();
    }
}

let app = new App()
