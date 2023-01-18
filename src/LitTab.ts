import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import styles from '../src/styles/index.scss?inline';

@customElement('lit-tab')
export class LitTab extends LitElement {
    @property({ attribute: 'key' }) key = '';

    @property({ type: Boolean, attribute: 'is-active' }) isActive = false;

    // @todo do i really need styles here?
    static styles = [
        unsafeCSS(styles),
    ];

    render() {
        return html`<slot></slot>`;
    }
}
