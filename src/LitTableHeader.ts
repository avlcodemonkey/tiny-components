import { html, LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { SortOrder } from './enums/SortOrder';

@customElement('lit-table-header')
export class LitTableHeader extends LitElement {
    @property() property = '';
    @property({ type: Boolean, attribute: 'no-sort' }) noSort = false;

    @state() sortOrder: SortOrder | undefined = undefined;

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

        return this.sortOrder === SortOrder.asc ? html`&#129053;` : html`&#129055;`;
    }

    render() {
        if (this.noSort) {
            return html`<span style="user-select: none;"><slot></slot></span>`;
        }

        return html`
            <span @click="${this.toggleSort}" style="user-select: none; cursor: pointer;" role="button">
                <slot></slot>
                ${this.renderSort()}
            </span>
        `;
    }
}
