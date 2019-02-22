/* global HTMLElement, fetch */
import { getReadableDateString } from './dates.mjs'

const componentName = 'temperature-list'
const css = `
  <style>
    @import url('https://fonts.googleapis.com/css?family=Lato');
    :host([hidden]) { display: none; }
    :host {
      font-family: Lato, sans-serif;
      font-size: 14px;
      max-height: 100%;
    }
    span[data-danger] {
      color: #f03;
    }
    ul {
      box-sizing: border-box;
      list-style: none;
      margin: 0;
      max-height: 100%;
      overflow-y: scroll;
      padding: 0;
      width: 215px;
    }
    li {
      border-top: 1px solid #ddd;
      box-sizing: border-box;
    }
  </style>
`

const html = `
  <h3>Temperature readings</h3>
  <p>
    <b>Threshold</b>:
    <slot name='threshold'></slot>&deg;F
  </p>
  <slot name='list'></slot>
`

class TemperatureList extends HTMLElement {
  constructor () {
    super()

    this.simplifyWovynJSON = this._simplifyWovynJSON.bind(this)
    this.update = this._update.bind(this)

    this.attachShadow({mode: 'open'})
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    this.listSlot = this.shadowRoot.querySelector(`slot[name='list']`)
    this.thresholdSlot = this.shadowRoot.querySelector(`slot[name='threshold']`)

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
      threshold: options['temperature_threshold'],
      temperatures: options['temperatures'].map(obj => ({
        temperature: obj['temperature'][0]['temperatureF'],
        timestamp: obj['timestamp']
      }))
    }
  }

  _update (json) {
    const { threshold, temperatures } = this.simplifyWovynJSON(json)
    const listItems = temperatures.reduce((htmlString, reading) => {
      const { temperature } = reading
      const timestamp = new Date(reading.timestamp)
      const violator = temperature > threshold

      return `
        ${htmlString}
        <li>
          ${violator ? `<span data-danger><p>${temperature}&deg;F</p></span>` : `<p>${temperature}&deg;F</p>`}
          <p>
            ${timestamp.toLocaleTimeString().toLowerCase()}
            on ${getReadableDateString(timestamp)}
          </p>
        </li>
      `
    }, '')

    this.thresholdSlot.innerHTML = threshold
    this.listSlot.innerHTML = `<ul>${listItems}</ul>`
  }

  connectedCallback () {
    fetch(`${this.baseApiUri}/temperature_readings`)
      .then(response => response.json())
      .then(this.update)
  }
}

const template = document.createElement('template')
template.innerHTML = `${css}${html}`

window.customElements.define(componentName, TemperatureList)
export default componentName
