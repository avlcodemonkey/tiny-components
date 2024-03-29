import { html, LitElement, unsafeCSS, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { AlertType } from './enums/AlertType';
import { TranslateMixin } from './mixins/TranslateMixin';
import styles from '../src/styles/index.css?inline';

@customElement('lit-alert')
export class LitAlert extends TranslateMixin(LitElement) {
    @property({ converter: (value) => value ? AlertType[value as keyof typeof AlertType] : undefined }) type: AlertType = AlertType.success;
    @property({ type: Boolean, attribute: 'no-dismiss' }) noDismiss = false;

    @state() isDismissed = false;

    static styles = [
        unsafeCSS(styles),
        css`
            col, [class*=" col-"], [class^="col-"] { margin: 0 calc(var(--grid-gutter) / 2) 0 calc(var(--grid-gutter) / 2); }
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
                    <button class="button icon-only button-dismiss" @click="${() => this.isDismissed = true}" title="${this.localize('common.dismiss')}"
                        aria-label="${this.localize('common.dismiss')}"
                    >
                        &#10006;
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

        return html`<div class="card bg-${this.type} mb-1 text-white" role="alert">${this.renderInnerContent()}</div>`;
    }
}
