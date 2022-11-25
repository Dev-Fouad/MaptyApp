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

let map , mapEvent;

class App {

    #map;
    #mapEvent;
    
    constructor() {
        this._getPosition();
    }

    _getPosition() {
        if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition( this._loadMap , function() {
            alert('Could not get your Position')
        }
    )} 

    _loadMap(position) {
        let {latitude} = position.coords
        let {longitude} = position.coords
        console.log(`https://www.google.com/maps/@${latitude},${longitude}`);

        let coords = [latitude , longitude]

        map = L.map('map').setView(coords, 13);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);


        map.on('click' , function(mapE){
            mapEvent = mapE
            form.classList.remove('hidden')
            inputDistance.focus()
        })
    }

    _showform() {}

    _toggleElevationField() {}

    _newWorkout() {}
}

let app = new App()
form.addEventListener('submit' , function(e){
    e.preventDefault()

    inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value
    let {lat , lng} = mapEvent.latlng
        L.marker([lat , lng])
        .addTo(map)
        .bindPopup(
        L.popup({
            maxWidth: 250,
            minWidth: 100,
            autoClose: false,
            closeOnClick: false,
            className: 'running-popup'
        }))
        .setPopupContent('Workout')
        .openPopup();
})

inputType.addEventListener('click' , function(){
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden') 
})
