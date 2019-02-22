/* global HTMLElement fetch */

const componentName = 'profile-form'
const css = `
  <style>
    :host([hidden]) { display: none; }
    :host {
      display: block;
    }
    
    label {
      display: block;
      font-size: 18px;
    }
    
    input[type='text'] {
      border: 1px solid #ccc;
      border-radius: 100px;
      font-size: 16px;
      padding: 12px 16px;
      width: 350px;
    }
    input[type='text']:focus {
      border-color: #3c4;
      outline: 0;
    }
    
    fieldset {
      border: 0;
      padding: 0 0 15px 0;
      margin: 0;
    }
    
    button {
      background-color: #3c4;
      border: 0;
      border-radius: 100px;
      color: #333;
      font-size: 16px;
      margin-top: 4px;
      padding: 16px;
      width: 100%;
    }
    button:hover {
      background-color: #1a2;
      color: #000;
    }
    
    span[data-success] {
      color: #3c4;
      font-size: 16px;
      font-weight: bold;
    }
  </style>
`

const html = `
<form>
    <span data-success></span>
    <fieldset>
        <label for="sensor-name">Sensor name</label>
        <input type="text" name="sensor-name" id="sensor-name" />
    </fieldset>

    <fieldset>
        <label for="location">Sensor location</label>
        <input type="text" name="location" id="location" />
    </fieldset>

    <fieldset>
        <label for="threshold">Temperature threshold (in &deg;F)</label>
        <input type="text" name="threshold" id="threshold" />
    </fieldset>

    <fieldset>
        <label for="phone">Phone number</label>
        <input type="text" name="phone" id="phone" />
    </fieldset>

    <button>Update profile</button>
</form>
`

class ProfileForm extends HTMLElement {
  constructor () {
    super()

    this.simplifyWovynJSON = this._simplifyWovynJSON.bind(this)
    this.updateFormFields = this._updateFormFields.bind(this)
    this.updateProfile = this._updateProfile.bind(this)

    this.attachShadow({mode: 'open'})
    this.shadowRoot.appendChild(template.content.cloneNode(true))

    this.sensorName = this.shadowRoot.getElementById('sensor-name')
    this.location = this.shadowRoot.getElementById('location')
    this.threshold = this.shadowRoot.getElementById('threshold')
    this.phone = this.shadowRoot.getElementById('phone')
    this.form = this.shadowRoot.querySelector('form')
    this.successMessage = this.shadowRoot.querySelector('span[data-success]')

    this.baseApiUri = 'http://localhost:8080/sky/event/6eJd1iFfiaCNatjvbsiL5D/spa/sensor'
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
      sensorName: options['current_name'],
      location: options['location'],
      threshold: options['threshold'],
      phone: options['sms_number']
    }
  }

  _updateFormFields (json) {
    const { sensorName, location, threshold, phone } = this.simplifyWovynJSON(json)
    this.sensorName.value = sensorName
    this.location.value = location
    this.threshold.value = threshold
    this.phone.value = phone
  }

  _updateProfile (event) {
    event.preventDefault()
    const successDuration = 3000
    const params = {
      location: this.location.value,
      current_name: this.sensorName.value,
      threshold: this.threshold.value,
      sms_number: this.phone.value
    }
    const queryString = Object.keys(params).map(key => `${key}=${params[key]}`).join('&')
    fetch(`${this.baseApiUri}/profile_updated?${queryString}`)
      .then(response => {
        this.successMessage.innerText = 'Updated successfully!'
        setTimeout(() => {
          this.successMessage.innerText = ''
        }, successDuration)
      })
  }

  connectedCallback () {
    fetch(`${this.baseApiUri}/profile_info`)
      .then(response => response.json())
      .then(this.updateFormFields)

    this.form.addEventListener('submit', this.updateProfile)
  }
}

const template = document.createElement('template')
template.innerHTML = `${css}${html}`

window.customElements.define('profile-form', ProfileForm)
export default componentName
