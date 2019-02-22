/* global HTMLElement, fetch */
import { getReadableDateString } from './dates.mjs'
import LoadSpinner from './LoadSpinner.mjs'

const componentName = 'current-temperature'
const css = `
  <style>
    @import url('https://fonts.googleapis.com/css?family=Lato:400,700');
    :host([hidden]) { display: none; }
    :host {
      align-items: center;
      display: flex;
      flex-direction: column;
      font-family: Lato, sans-serif;
      font-size: 160px;
      justify-content: center;
      width: 100%;
    }
    p {
      margin: 0;
    }
    span[data-danger] {
      color: #f03;
    }
    slot[name='timestamp'] {
      display: inline;
      font-size: 32px;
    }
  </style>
`

const html = `
  <p>
    <slot name="temperature">
      <${LoadSpinner} size='160px' color='#3c4'></${LoadSpinner}>
    </slot>&deg;F
  </p>
  <slot name="timestamp"></slot>
`

class CurrentTemperature extends HTMLElement {
  constructor () {
    super()

    this.simplifyWovynJSON = this._simplifyWovynJSON.bind(this)
    this.update = this._update.bind(this)

    this.attachShadow({mode: 'open'})
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    this.temperatureSlot = this.shadowRoot.querySelector(`slot[name='temperature']`)
    this.timestampSlot = this.shadowRoot.querySelector(`slot[name='timestamp']`)

    this.baseApiUri = 'http://localhost:8080/sky/event/6eJd1iFfiaCNatjvbsiL5D/spa/wovyn'
  }

  _simplifyWovynJSON (json) {
    if (!json.hasOwnProperty('directives')) {
      console.error('Nothing came back.', json)
      return json
    }

    if (json['directives'].length === 0) {
      console.error('No directives were returned by the pico', json)
      return json
    }

    const options = json['directives'][0]['options']

    return {
      temperature: options['current_temperature']['temperature'][0]['temperatureF'],
      threshold: options['temperature_threshold'],
      timestamp: options['current_temperature']['timestamp']
    }
  }

  _update (json) {
    const { temperature, threshold, timestamp } = this.simplifyWovynJSON(json)
    const timestampDate = new Date(timestamp)

    if (temperature > threshold) {
      this.temperatureSlot.innerHTML = `<span data-danger>${temperature}</span>`
    } else {
      this.temperatureSlot.innerHTML = temperature
    }

    this.timestampSlot.innerHTML = `
      As of ${timestampDate.toLocaleTimeString().toLowerCase()}
      on ${getReadableDateString(timestampDate)}
    `
  }

  connectedCallback () {
    fetch(`${this.baseApiUri}/current_temperature`)
      .then(response => response.json())
      .then(this.update)
  }
}

const template = document.createElement('template')
template.innerHTML = `${css}${html}`

window.customElements.define(componentName, CurrentTemperature)
export default componentName
