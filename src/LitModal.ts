import { html, LitElement, unsafeCSS, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { ModalType } from './enums/ModalType';
import styles from '../src/styles/index.scss?inline';

const  focusableElements = 'button:not(.no-tab-focus), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

@customElement('lit-modal')
export class LitModal extends LitElement {
    @property({ attribute: 'key' }) key = '';
    @property({ attribute: 'title' }) title = '';
    @property({ converter: (value) => value ? ModalType[value as keyof typeof ModalType] : undefined }) type: ModalType = ModalType.dialog;

    @property({ attribute: 'dismiss-msg' }) dismissMsg = 'Dismiss';
    @property({ attribute: 'confirm-button-msg' }) confirmButtonMsg = 'Okay';
    @property({ attribute: 'cancel-button-msg' }) cancelButtonMsg = 'Cancel';

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
            .modal-container { 
                width: 40%;
                z-index: 16777271;
            }
        `,
    ];

    onConfirmClick() {
        this.isDismissed = true;
        this.dispatchEvent(new CustomEvent('litModalConfirmClick', {
            detail: {
                key: this.key,
            },
            bubbles: true,
            composed: true,
        }));
        console.log('confirmed');
    }

    cancel() {
        this.isDismissed = true;
        this.dispatchEvent(new CustomEvent('litModalCancelClick', {
            detail: {
                key: this.key,
            },
            bubbles: true,
            composed: true,
        }));
        console.log('canceled');
    }

    onOverlayClick(event: PointerEvent) {
        const target = event?.composedPath()[0] as HTMLElement;
        if (!target.classList.contains('modal-overlay')) {
            return;
        }

        this.cancel();
    }

    onCancelClick() {
        this.cancel();
    }

    keepFocus(event: KeyboardEvent) {
        // find the elements within the component that can be focused on
        const focusableContent = Array.from(this.shadowRoot?.querySelectorAll(focusableElements) ?? []).map((x) => x as HTMLElement);
        if (!focusableContent?.length) {
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
                this.cancel();
            }
            if (event.key === 'Tab') {
                // @todo keep focus
                this.keepFocus(event);
            }
        } else if (event.keyCode) {
            if (event.keyCode === 27) {
                this.cancel();
            }
            if (event.keyCode === 9) {
                // @todo keep focus
                this.keepFocus(event);
            }
        }
    }

    renderDismissButton() {
        return html`
            <button class="button icon-only button-dismiss" @click="${this.onCancelClick}" title="${this.dismissMsg}" 
                aria-label="${this.dismissMsg}"
            >
                <i class="lcc lcc-dismiss"></i>
            </button>
        `;
    }

    renderHeaderContent() {
        if (!this.title) {
            return html`<span class="col-12 text-right">${this.renderDismissButton()}</span>`;
        }

        return html`
            <span class="col-11">
                <h4 id="${this.key}-title">${this.title}</h4>
            </span>
            <span class="col-1 text-right">
                ${this.renderDismissButton()}
            </span>
        `;
    }

    renderFooterContent() {
        if (this.type === ModalType.dialog) {
            return;
        }

        return html`
            <footer class="text-right">
                <button class="button primary" @click="${this.onConfirmClick}">${this.confirmButtonMsg}</button>
                <button class="button" @click="${this.onCancelClick}">${this.cancelButtonMsg}</button>
            </footer>
        `;
    }

    renderModal() {
        return html`
            <div id="${this.key}-modal" ?aria-hidden="${this.isDismissed}">
                <div class="modal-overlay" tabindex="-1" @click="${this.onOverlayClick}" @keydown="${this.onKeyDown}">
                    <div class="modal-container card bd-grey" role="dialog" aria-modal="true" aria-labelledby="${this.key}-title">
                        <header class="row">${this.renderHeaderContent()}</header>
                        <div id="${this.key}-content" class="mb-1">
                            <slot></slot>
                        </div>
                        ${this.renderFooterContent()}
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        // don't render anything if type is invalid, or the modal has been dismissed
        if (!this.type) {
            return;
        }

        return html`
            <div>
                <button class="button primary no-tab-focus" @click="${() => this.isDismissed = false}">Primary</button>
                ${this.isDismissed ? '' : this.renderModal()}
            </div>
        `;
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
