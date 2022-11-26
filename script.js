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
    id = (date.now() + '').slice(-10)

    constructor (coords, distance, duration) {
        this.coords = coords
        this.distance = distance
        this.duration = duration
    }

    _setDescription () {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${ months[this.date.getMonth()]} ${this.date.getDate()}`
    }
    
}

class Running extends Workout {
    type = 'running'
    constructor(coords , distance, duration, Cadence){
        super(coords, distance, duration)
        this.Cadence  = Cadence
        this.calcPace()
        this.description()
    }

    calcPace(){
        this.pace = this.duration / this.distance
    }
}

class Cycling extends Workout {
    type = 'running'

    constructor(coords , distance, duration, elevationGain){
        super(coords, distance, duration)
        this.elevationGain  = elevationGain
        this.calcSpeed()
        this.description()
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60)
    }
}

///////////////////////////////////////////
/////////APPLICATION ARCHITECTURE /////////
///////////////////////////////////////////
class App {
    #map;
    #mapEvent;
    #workouts = []

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

    _hideForm(){
        // Empty inputs
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value
        form.style.display = 'none'
        form.classList.add('hidden')
        setTimeout(() => form.style.display = 'grid', 1000)
    }

    _toggleElevationField() {
        inputType.addEventListener('click' , function(){
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden')
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden') 
        })
    }

    _newWorkout() {
        e.preventDefault()
        let validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp))
        let Allpositive = (...inputs) => inputs.every(inp => inp > 0);

        // Get data from form
        let type = inputType.type
        let distance = +inputDistance.value
        let duration = +inputDuration.value
        let {lat , lng} = this.#mapEvent.latlng
        let workout;

        // if workout running, create running object
        if (type === 'running') { 
            // Check if data is valid
            let cadence = +inputCadence.value
            if (
                !validInputs(distance, duration, cadence) ||
                !Allpositive(distance, duration, cadence)
            ) 
            return alert('Inputs have to be a Positive numbers ')

            workout = new Running ([lat, lng] , distance, duration, cadence)
        }
        
        // if workout cycling, create cycling object
        if (type === 'cycling') {
            let elevation = +inputElevation.value
            if (
                !validInputs(distance, duration, elevation) ||
                !Allpositive(distance, duration)
            )
            return alert('Inputs have to be a Positive numbers ')

            workout = new Cycling ([lat, lng] , distance, duration, elevation)

        }

        // Add new object to workout array
        this.#workouts.push(workout)

        // Render workout on map as marker
        this.renderWorkoutMarker(workout)

        // Render workout on list 
        this._renderWorkout(workout)

        // Hide form + clear input fields
        this._hideForm()
    }


    _renderWorkoutMarker(workout){
        L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(
            L.popup({
              maxWidth: 250,
              minWidth: 100,
              autoClose: false,
              closeOnClick: false,
              className: `${workout.type}-popup`
            })
        )
        .setPopupContent(`${workout.type === 'running' ? '🏃' : '🚴‍♀️'}${workout.description}`)
        .openPopup();
    }

    _renderWorkout(workout){
        let html = `
            <li class="workout workout--${workout.type}" data-id="${workout.id}">
               <h2 class="workout__title">${workout.description}</h2>
                <div class="workout__details">
                  <span class="workout__icon">${workout.type === 'running' ? '🏃' : '🚴‍♀️'}</span>
                  <span class="workout__value">${workout.duration}</span>
                  <span class="workout__unit">km</span>
                </div>
                <div class="workout__details">
                  <span class="workout__icon">⏱</span>
                  <span class="workout__value">${workout.duration}</span>
                  <span class="workout__unit">min</span>
                </div>    
        `;

        if (workout.type === 'running')
          html += `
            <div class="workout__details">
                <span class="workout__icon">⚡️</span> 
                <span class="workout__value">${workout.pace.toFixed(1)}</span>
                <span class="workout__unit">min/km</span>
            </div>
            <div class="workout__details">
                <span class="workout__icon">🦶🏼</span>
                <span class="workout__value">${workout.cadence}</span>
                <span class="workout__unit">spm</span>
            </div>
           </li>
        `;

        if (workout.type === 'cycling')
          html += `
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed[1]}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        `;

        form.insertAdjacentHTML('afterend' , html)
    }
}
let app = new App();
