import { html, LitElement, unsafeCSS, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AlertType } from './enums/AlertType';
import styles from '../src/styles/index.scss?inline';

@customElement('lit-alert')
export class LitAlert extends LitElement {
    @property({ converter: (value) => value ? AlertType[value as keyof typeof AlertType] : undefined }) type: AlertType = AlertType.success;
    @property({ type: Boolean, attribute: 'no-dismiss' }) noDismiss = false;
    @property({ attribute: 'dismiss-msg' }) dismissMsg = 'Dismiss';

    @state() isDismissed = false;

    static styles = [
        unsafeCSS(styles),
        css`
            col, [class*=" col-"], [class^="col-"] { margin: 0 calc(var(--grid-gutter) / 2) 0 calc(var(--grid-gutter) / 2); }
            .button-dismiss { border: none; color: inherit; background: inherit; margin-top: -1rem; }
        `,
    ];

    renderInnerContent() {
        if (this.noDismiss) {
            return html`<slot></slot>`;
        }

        return html`
            <div class="row">
                <span class="col-11"><slot></slot></span>
                <span class="col-1 text-right">
                    <button class="button icon-only button-dismiss" @click="${() => this.isDismissed = true}" title="${this.dismissMsg}"
                        aria-label="${this.dismissMsg}"
                    >
                        <i class="lcc lcc-dismiss"></i>
                    </button>
                </span>
            </div>
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
