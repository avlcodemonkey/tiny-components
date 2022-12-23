import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AlertType } from './enums/AlertType';
import styles from '../src/styles/index.scss?inline';

@customElement('lit-alert')
export class LitAlert extends LitElement {
    @property() msg = '';
    @property({ converter: (value) => value ? AlertType[value as keyof typeof AlertType] : undefined }) type: AlertType = AlertType.success
    @property({ type: Boolean, attribute: 'no-dismiss' }) noDismiss = false;

    @state() isDismissed = false;

    static styles = [
        unsafeCSS(styles),
    ];

    renderInnerContent() {
        if (this.noDismiss) {
            return html`<span class="col-12">${this.msg}</span>`;
        }
        return html`
            <span class="col-11">${this.msg}</span>
            <span class="col-1 pull-right"><i class="lit lit-dismiss btn-cursor" @click="${() => this.isDismissed = true }"></i></span>
        `;
    }

    render() {
        // don't render anything if type is invalid, or the alert has been dismissed
        if (!this.type || this.isDismissed) {
            return;
        }

        return html`
            <div class="card bg-${this.type}">
                <div class="text-white">
                    ${this.renderInnerContent()}
                </div>
            </div>
            <br />
        `;
    }
}
