/* global HTMLElement */

const componentName = 'nav-header'
const css = `
  <style>
    :host([hidden]) { display: none; }
    :host {
      --nav-height: 60px;
      display: block;
    }
    nav {
      align-items: center;
      background-color: #333;
      box-sizing: border-box;
      color: #ccc;
      display: flex;
      height: var(--nav-height);
      width: 100%;
    }
    nav a {
      box-sizing: border-box;
      color: #fff;
      line-height: var(--nav-height);
      padding: 0 15px;
      text-decoration: none;
    }
    nav a:hover {
      --border-size: 4px;
      border-bottom: var(--border-size) solid #3c4;
      line-height: calc(var(--nav-height) - var(--border-size));
    }
  </style>
`

const html = `
  <nav>
    <a href="index.html" title="Home">Home</a>
    <a href="profile.html" title="Profile">Profile</a>
  </nav>
`

class NavHeader extends HTMLElement {
  constructor () {
    super()

    this.attachShadow({mode: 'open'})
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

const template = document.createElement('template')
template.innerHTML = `${css}${html}`

window.customElements.define('nav-header', NavHeader)
export default componentName
