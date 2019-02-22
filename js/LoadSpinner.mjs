/* global HTMLElement */

const componentName = 'load-spinner'
const css = `
  <style>
    :host([hidden]) { display: none; }
    :host {
      --size: 40px;
      --color: #333;
      animation: spin 1s infinite linear;
      border: calc(var(--size) / 8) solid rgba(51, 51, 51, 0.2);
      border-radius: 100%;
      border-top-color: var(--color);
      box-sizing: border-box;
      display: inline-block;
      height: var(--size);
      width: var(--size);
    }
    
    @keyframes spin {
      100% {
        transform: rotate(360deg);
      }
    }
  </style>
`

class LoadSpinner extends HTMLElement {
  static get observedAttributes () {
    return ['size', 'color']
  }

  constructor () {
    super()

    this.attachShadow({mode: 'open'})
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }

  get size () {
    return this.getAttribute('size')
  }
  set size (newValue) {
    this.setAttribute('size', newValue)
  }

  get color () {
    return this.getAttribute('color')
  }
  set color (newValue) {
    this.setAttribute('color', newValue)
  }

  attributeChangedCallback (name, oldValue, newValue) {
    switch (name) {
      case 'size':
        this.style.setProperty('--size', `${newValue}`)
        break
      case 'color':
        this.style.setProperty('--color', `${newValue}`)
        break
    }
  }
}

const template = document.createElement('template')
template.innerHTML = `${css}`

window.customElements.define(componentName, LoadSpinner)
export default componentName
