import { html, LitElement, unsafeCSS, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ModalType } from './enums/ModalType';
import { TranslateMixin } from './mixins/TranslateMixin';
import styles from '../src/styles/index.scss?inline';

const focusableElements = 'button:not(.no-focus), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

@customElement('lit-modal')
export class LitModal extends TranslateMixin(LitElement) {
    @property() key = '';
    @property({ converter: (value) => value ? ModalType[value as keyof typeof ModalType] : undefined }) type: ModalType = ModalType.dialog;
    @property() href = '';

    @state() isDismissed = true;

    private boundOnKeyDown = this.onKeyDown.bind(this);

    static styles = [
        unsafeCSS(styles),
        css`
            .button-dismiss { border: none; color: inherit; background: inherit; margin-top: -1rem; }
            .modal-overlay {
                background: rgba(0,0,0,.6);
                top: 0;
                right: 0;
                bottom: 0;
                left: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                position: fixed;
                z-index: 16777270;
            }
            .modal-container { width: 40%; z-index: 16777271; }
            form { display: inline; }
        `,
    ];

    onConfirmClick() {
        this.isDismissed = true;

        const forms = Array.from(this.shadowRoot?.querySelectorAll('form') ?? []);
        if (forms.length && forms[0].action) {
            forms[0].submit();
        }
    }

    onOverlayClick(event: PointerEvent) {
        const target = event?.composedPath()[0] as HTMLElement;
        if (!target.classList.contains('modal-overlay')) {
            return;
        }

        this.isDismissed = true;
    }

    onCancelClick() {
        this.isDismissed = true;
    }

    keepFocus(event: KeyboardEvent) {
        // find the elements within the component that can be focused on
        const focusableContent = Array.from(this.shadowRoot?.querySelectorAll(focusableElements) ?? []).map((x) => x as HTMLElement);
        if (!focusableContent.length) {
            return;
        }

        if (event.shiftKey) {
            // if this is the first focusable element, loop around to the last
            if (this.shadowRoot?.activeElement === focusableContent[0]) {
                focusableContent[focusableContent.length - 1].focus();
                event.preventDefault();
            }
        } else {
            // if this is the last focusable element, loop around to the first
            if (this.shadowRoot?.activeElement === focusableContent[focusableContent.length - 1]) {
                focusableContent[0].focus();
                event.preventDefault();
            }
        }
    }

    onKeyDown(event: KeyboardEvent) {
        if (this.isDismissed) {
            return;
        }

        if (event.key) {
            if (event.key === 'Escape') {
                this.isDismissed = true;
            }
            if (event.key === 'Tab') {
                this.keepFocus(event);
            }
        } else if (event.keyCode) {
            if (event.keyCode === 27) {
                this.isDismissed = true;
            }
            if (event.keyCode === 9) {
                this.keepFocus(event);
            }
        }
    }

    async onSubmitClick(event: PointerEvent) {
        event.preventDefault();
        this.isDismissed = false;
        await this.updateComplete;

        // focus on dismiss button after rendering completes
        (this.shadowRoot?.querySelector('.button-dismiss') as HTMLButtonElement)?.focus();
    }

    renderDismissButton() {
        return html`
            <button class="button icon-only button-dismiss" @click="${this.onCancelClick}" title="${this.localize('modal.dismiss')}"
                aria-label="${this.localize('modal.dismiss')}"
            >
                <i class="lcc lcc-dismiss"></i>
            </button>
        `;
    }

    renderFooterContent() {
        if (this.type === ModalType.dialog) {
            return;
        }

        return html`
            <footer class="text-right" role="presentation">
                <button class="button primary" @click="${this.onConfirmClick}">${this.localize('modal.confirm')}</button>
                <button class="button secondary" @click="${this.onCancelClick}">${this.localize('modal.cancel')}</button>
            </footer>
        `;
    }

    renderModal() {
        return html`
            <div id="${this.key}-modal" ?aria-hidden="${this.isDismissed}" tabindex="-1">
                <div class="modal-overlay" tabindex="-1" @click="${this.onOverlayClick}" @keydown="${this.onKeyDown}">
                    <div class="modal-container card bd-grey" role="dialog" aria-modal="true" aria-labelledby="${this.key}-header"
                        aria-describedby="${this.key}-content"
                    >
                        <header class="row" role="presentation">
                            <span class="col-11" id="${this.key}-header">
                                <slot name="modal-header"></slot>
                            </span>
                            <span class="col-1 text-right">
                                ${this.renderDismissButton()}
                            </span>
                        </header>
                        <section id="${this.key}-content" class="mb-1">
                            <slot name="modal-content"></slot>
                        </section>
                        ${this.renderFooterContent()}
                    </div>
                </div>
            </div>
        `;
    }

    renderInnerContent() {
        return html`
            <slot name="button" @click="${this.onSubmitClick}"></slot>
            <slot><button type="submit" class="button primary no-focus" @click="${this.onSubmitClick}">Click</button></slot>
            ${this.isDismissed ? '' : this.renderModal()}
        `;
    }

    render() {
        // don't render anything if type is invalid
        if (!this.type) {
            return;
        }

        if (this.type === ModalType.dialog || !this.href) {
            return html`<div>${this.renderInnerContent()}</div>`;
        }

        return html`<form action="${this.href}">${this.renderInnerContent()}</form>`;
    }

    connectedCallback() {
        super.connectedCallback();
        window.addEventListener('keydown', this.boundOnKeyDown);
    }

    disconnectedCallback() {
        window.removeEventListener('keydown', this.boundOnKeyDown);
        super.disconnectedCallback();
    }
}
