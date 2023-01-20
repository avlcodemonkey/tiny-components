import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SortOrder } from './enums/SortOrder';
import styles from '../src/styles/index.scss?inline';

@customElement('lit-table-header')
export class LitTableHeader extends LitElement {
    @property() property = '';
    @property({ type: Boolean, attribute: 'no-sort' }) noSort = false;

    @state() sortOrder: SortOrder | undefined = undefined;

    static styles = [
        unsafeCSS(styles),
    ];

    toggleSort() {
        if (this.sortOrder === SortOrder.asc) {
            this.sortOrder = SortOrder.desc;
        } else if (this.sortOrder === SortOrder.desc) {
            this.sortOrder = undefined;
        } else {
            this.sortOrder = SortOrder.asc;
        }

        this.dispatchEvent(new CustomEvent('litTableSorted', {
            detail: {
                property: this.property,
                sortOrder: this.sortOrder,
            },
            bubbles: true,
            composed: true,
        }));
    }

    renderSort() {
        if (!this.sortOrder) {
            return;
        }

        return html`<i class="lcc ${this.sortOrder === SortOrder.asc ? 'lcc-up' : 'lcc-down' }"></i>`;
    }

    render() {
        if (this.noSort) {
            return html`<slot></slot>`;
        }

        return html`
            <span @click="${this.toggleSort}" class="cursor-pointer" role="button">
                <slot></slot>
                ${this.renderSort()}
            </span>
        `;
    }
}
