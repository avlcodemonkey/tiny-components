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

    @state() data: Row[] = [];

    @state() filteredData: Row[] = [];

    @state() sortColumns: SortColumn[] = [];

    @state() searchQuery = '';

    private hasActions?: boolean = false;

    private actionName = 'actions';

    private columnHeaders: Map<string, LitColumnHeader> = new Map();

    private debounceTimer: ReturnType<typeof setTimeout> | undefined;

    static styles = [
        unsafeCSS(styles),
        css`
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

    /**
     * Filter an array of objects to find objects where value contains the value of `this`.
     * @this {String} Value to search for
     * @param {Object} obj - Object to search in.
     * @returns {bool} True if object contains `this`.
     */
    filterArray(this: string, obj: object): boolean {
        const tokens = (this || '').split(' ');
        for (const key in obj) {
            if (key.indexOf('_') < 0 && Object.prototype.hasOwnProperty.call(obj, key)) {
                const objVal = (obj[key as keyof typeof obj] + '').toLowerCase();
                if (tokens.every((x) => objVal.indexOf(x) > -1)) {
                    return true;
                }
            }
        }
        return false;
    }

    onSorted(event: CustomEvent) {
        if (!event?.detail?.property) {
            return;
        }

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

        this.filterData();
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

    filterData() {
        // create a new array and filter by the search query
        const filteredData = this.searchQuery ? this.data?.filter(this.filterArray.bind(this.searchQuery.toLowerCase())) : [...this.data];

        // now sort the new array
        filteredData.sort(this.sortColumns?.length ? this.compare.bind(this.sortColumns) : this.defaultCompare)

        // now determine the correct slice of data for paging

        // reassign our new array to trigger the update
        this.filteredData = filteredData;
    }

    onSearchQueryInput(searchQuery: string) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            this.searchQuery = searchQuery;
            this.filterData();
        }, 250);
    }

    renderActions(row: object) {
        const editUrl = this.replaceInUrl(this.editUrl, row);
        const deleteUrl = this.replaceInUrl(this.deleteUrl, row);

        return html`
            ${editUrl ? html`<a href="${editUrl}" class="button primary btn-action" title="Edit"><i class="lcc lcc-pencil"></i></a>` : ''}
            ${deleteUrl ? html`<a href="${deleteUrl}" class="button dark btn-action" title="Delete"><i class="lcc lcc-dismiss"></i></a>` : ''}
        `;
    }

    renderRows(keys: string[]) {
        if (!this.filteredData?.length) {
            return html`<tr><td colspan="${keys.length}" class="text-center">No matching data to display.</td></tr>`;
        }

        return html`
            ${repeat(this.filteredData, (row) => row[this.rowKeyProperty as keyof typeof row], (row) => {
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
        `;
    }

    renderInnerContent() {
        // Check if data is loaded
        if (!this.data) {
            return html`<slot name="loading"><h3><i class="lcc lcc-spinner animate-spin"></h3></slot>`;
        }

        const keys = [ ...(this.hasActions ? [this.actionName] : []),  ...Array.from(this.columnHeaders.keys()) ];

        return html`
            <div class="container">
                <div class="row">
                    <input type="text" name="litTableSearchQuery" placeholder="Search" class="col-6 col-3-md" value="${this.searchQuery}" 
                        @input=${(e: InputEvent) => this.onSearchQueryInput((e.target as HTMLInputElement).value)}>
                </div>
                <div class="row">
                    <table class="striped">
                        <thead @litTableSorted="${this.onSorted}">
                            <tr>
                                ${keys.map((key) => {
                                    if (key === this.actionName) {
                                        return html`
                                            <th class="col-min-width">
                                                ${this.addUrl ? html`<a href="${this.addUrl}" class="button secondary btn-action" title="Add"><i class="lcc lcc-plus"></i></a>` : ''}
                                            </th>
                                        `;
                                    }
                                    const header = this.columnHeaders.get(key);
                                    return html`<th class="col-min-width">${header ? header : key.replace(/\b([a-z])/g, (_, val) => val.toUpperCase())}</th>`;
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            ${this.renderRows(keys)}
                        </tbody>
                    </table>
                </div>
            </div>
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
        this.data = data.map((x: Row, index: number) => {
            x._index = index;
            return x;
        }) ?? [];
        this.filterData();
    }
}
