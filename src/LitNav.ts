import { html, css, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import type { LitTab } from './LitTab';
import styles from '../src/styles/index.css?inline';

@customElement('lit-nav')
export class LitNav extends LitElement {
    @property({ type: Boolean, attribute: 'is-full' }) isFull = false;

    @state() activeTab = '';
    @state() tabs: Map<string, LitTab> = new Map();

    static styles = [
        unsafeCSS(styles),
        css`
            .tab-content { padding: 2rem 0; }
        `,
    ];

    async firstUpdated() {
        if (!this.shadowRoot) {
            return;
        }

        const slot = this.shadowRoot.querySelector('slot');
        if (slot) {
            const assignedNodes = slot.assignedNodes();
            this.tabs = new Map(assignedNodes.filter((x) => x.nodeName === 'LIT-TAB').map((x) => x as LitTab).map((x) => [x.key, x]));

            this.tabs.forEach((tab, key) => {
                if (tab.isActive && !this.activeTab) {
                    this.activeTab = key;
                }
            });
            if (!this.activeTab && this.tabs.size) {
                this.activeTab = this.tabs.entries().next().value[0];
            }
        }
    }

    renderInnerContent() {
        if (!this.tabs.size) {
            return;
        }

        const keys = Array.from(this.tabs.keys());

        return html`
            <nav class="tabs ${this.isFull ? 'is-full' : ''}">
                ${keys.map((key) => html`
                    <a class="cursor-pointer ${this.activeTab === key ? 'active' : ''}" @click="${() => this.activeTab = key}"
                        id="nav-${key}" aria-controls="${key}" role="tab"
                    >
                        ${this.tabs.get(key)}
                    </a>
                `)}
            </nav>
            ${keys.map((key) => html`
                <div class="tab-content ${this.activeTab === key ? '' : 'is-hidden'}" id="${key}" ?aria-current="${this.activeTab === key}"
                    aria-labelledby="nav-${key}" role="tabpanel"
                >
                    <slot name="${key}"></slot>
                </div>
            `)}
        `;
    }

    render() {
        return html`<slot></slot>${this.renderInnerContent()}`;
    }
}
