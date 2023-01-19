import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AlertType } from './enums/AlertType';
import styles from '../src/styles/index.scss?inline';

@customElement('lit-alert')
export class LitAlert extends LitElement {
    @property({ converter: (value) => value ? AlertType[value as keyof typeof AlertType] : undefined }) type: AlertType = AlertType.success
    @property({ type: Boolean, attribute: 'no-dismiss' }) noDismiss = false;

    @state() isDismissed = false;

    static styles = [
        unsafeCSS(styles),
    ];

    renderInnerContent() {
        if (this.noDismiss) {
            return html`<span class="col-12"><slot></slot></span>`;
        }

        return html`
            <span class="col-11"><slot></slot></span>
            <span class="col-1 pull-right">
                <i class="lcc lcc-dismiss cursor-pointer" @click="${() => this.isDismissed = true}" title="Dismiss" aria-label="Dismiss" role="button"></i>
            </span>
        `;
    }

    render() {
        // don't render anything if type is invalid, or the alert has been dismissed
        if (!this.type || this.isDismissed) {
            return;
        }

        return html`
            <div class="card bg-${this.type} mb-1" role="alert">
                <div class="text-white">
                    ${this.renderInnerContent()}
                </div>
            </div>
        `;
    }
}
