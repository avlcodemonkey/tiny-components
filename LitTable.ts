import { html, css, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit-html/directives/repeat.js';
import type { LitColumnHeader } from './LitColumnHeader';
import { SortOrder } from './enums/SortOrder';
import styles from '../src/styles/index.scss?inline';

interface Row {
    _index: number;
}

type SortColumn = {
    property: string;
    sortOrder: SortOrder;
}

@customElement('lit-table')
export class LitTable extends LitElement {
    @property() src = '';

    @property({ attribute: 'row-key-property' }) rowKeyProperty = '';

    @property({ attribute: 'add-url' }) addUrl = '';

    @property({ attribute: 'edit-url' }) editUrl = '';

    @property({ attribute: 'delete-url' }) deleteUrl = '';

    @state() values?: Row[];

    @state() sortColumns: SortColumn[] = [];

    private hasActions?: boolean = false;

    private actionName = 'actions';

    private columnHeaders: Map<string, LitColumnHeader> = new Map();

    static styles = [
        unsafeCSS(styles),
        css`
            .spin { 
                animation: spin-animation 1s linear infinite; 
                display: inline-block; 
            }
            @keyframes spin-animation {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }
            .col-min-width { min-width:100px; }
            .btn-action { padding: .7rem; }
            .btn-action + .btn-action { margin-left: .5rem; }
        `,
    ];

    defaultCompare(a: Row, b: Row) {
        return a._index > b._index ? 1 : a._index < b._index ? -1 : 0;
    }

    compare(this: SortColumn[], a: Row, b: Row) {
        let i = 0;
        const len = this.length;
        for (; i < len; i++) {
            const sort = this[i];
            const aa = a[sort.property as keyof typeof a];
            const bb = b[sort.property as keyof typeof b];

            if (aa === null)
                return 1;
            if (bb === null)
                return -1;
            if (aa < bb)
                return sort.sortOrder === SortOrder.asc ? -1 : 1;
            if (aa > bb)
                return sort.sortOrder === SortOrder.asc ? 1 : -1;
        }
        return 0;
    }

    onSorted(event: CustomEvent) {
        if (event?.detail?.property) {
            const property = event.detail.property as string;
            const sortOrder = event.detail.sortOrder as SortOrder;

            if (!sortOrder) {
                // remove this column from the sorting list
                this.sortColumns = this.sortColumns.filter((x) => x.property != property);
            } else {
                const index = this.sortColumns.findIndex((x) => x.property === property) ?? -1;
                if (index > -1) {
                    this.sortColumns[index].sortOrder = sortOrder;
                } else {
                    this.sortColumns.push({ property: property, sortOrder: sortOrder });
                }
            }

            if (this.values) {
                this.values = [...this.values.sort(this.sortColumns?.length ? this.compare.bind(this.sortColumns) : this.defaultCompare)];
            }
        }
    }

    replaceInUrl(url: string, row: object) {
        if (!url) {
            return url;
        }
        let newUrl = url;
        Object.keys(row).forEach((x) => {
            newUrl = newUrl.replace(`$\{${x}}`, encodeURIComponent(row[x as keyof typeof row]));
        });
        return newUrl;
    }

    renderActions(row: object) {
        const editUrl = this.replaceInUrl(this.editUrl, row);
        const deleteUrl = this.replaceInUrl(this.deleteUrl, row);
        return html`
            ${editUrl ? html`<a href="${editUrl}" class="button primary btn-action" title="Edit"><i class="lit lit-pencil"></i></a>` : ''}
            ${deleteUrl ? html`<a href="${deleteUrl}" class="button dark btn-action" title="Delete"><i class="lit lit-dismiss"></i></a>` : ''}
        `;
    }

    renderInnerContent() {
        // Check if data is loaded
        if (!this.values) {
            return html`<slot name="loading"><h3><i class="lit lit-spinner spin"></h3></slot>`;
        }

        // Check if items are not empty
        if (this.values.length === 0) {
            return html`<slot name="empty">No Items Found!</slot>`;
        }

        const keys = [ ...(this.hasActions ? [this.actionName] : []),  ...Array.from(this.columnHeaders.keys()) ];
        return html`
            <table class="striped">
                <thead @litTableSorted="${this.onSorted}">
                    <tr>
                        ${keys.map((key) => {
                            if (key === this.actionName) {
                                return html`
                                    <th class="col-min-width">
                                        ${this.addUrl ? html`<a href="${this.addUrl}" class="button secondary btn-action" title="Add"><i class="lit lit-plus"></i></a>` : ''}
                                    </th>
                                `;
                            }
                            const header = this.columnHeaders.get(key);
                            return html`<th class="col-min-width">${header ? header : key.replace(/\b([a-z])/g, (_, val) => val.toUpperCase())}</th>`;
                        })}
                    </tr>
                </thead>
                <tbody>
                    ${repeat(this.values, (row) => row[this.rowKeyProperty as keyof typeof row], (row) => {
                        return html`
                            <tr>
                                ${keys.map((key) => {
                                    if (key === this.actionName) {
                                        return html`<td>${this.renderActions(row)}</td>`;
                                    }
                                    return html`<td><slot name="column-data-${key}">${row[key as keyof typeof row]}</slot></td>`;
                                })}
                            </tr>
                        `;
                    })}
                </tbody>
            </table>
        `;
    }

    render() {
        return html`<slot></slot>${this.renderInnerContent()}`;
    }

    async firstUpdated() {
        if (this.shadowRoot) {
            const slot = this.shadowRoot.querySelector('slot');
            if (slot) {
                const assignedNodes = slot.assignedNodes();
                this.columnHeaders = new Map(assignedNodes.filter((x) => x.nodeName === 'LIT-COLUMN-HEADER').map((x) => x as LitColumnHeader).map((x) => [x.property, x]));
            }
        }

        if (this.addUrl || this.editUrl || this.deleteUrl) {
            this.hasActions = true;
        }

        await this.fetchData();
    }

    async fetchData() {
        if (!this.src.length) {
            return;
        }
        const data = await fetch(this.src).then((res) => res.json());
        this.values = data.map((x: Row, index: number) => {
            x._index = index;
            return x;
        }) ?? [];
        this.requestUpdate();
    }
}
