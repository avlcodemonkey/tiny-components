import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('lit-tab')
export class LitTab extends LitElement {
    @property() key = '';
    @property({ type: Boolean, attribute: 'is-active' }) isActive = false;

    render() {
        return html`<slot></slot>`;
    }
}
