import { html, css, LitElement, unsafeCSS } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit-html/directives/repeat.js';
import type { LitTableHeader } from './LitTableHeader';
import { SortOrder } from './enums/SortOrder';
import styles from '../src/styles/index.scss?inline';
import { TableSetting } from './enums/TableSetting';
import { TranslateMixin } from './mixins/TranslateMixin';

interface Row {
    _index: number;
}

type SortColumn = {
    property: string;
    sortOrder: SortOrder;
}

@customElement('lit-table')
export class LitTable extends TranslateMixin(LitElement) {
    @property() src = '';
    @property() key = '';
    @property({ attribute: 'row-key' }) rowKey = '';
    @property({ attribute: 'add-url' }) addUrl = '';
    @property({ attribute: 'edit-url' }) editUrl = '';
    @property({ attribute: 'delete-url' }) deleteUrl = '';

    @state() data: Row[] = [];
    @state() filteredRecordTotal = 0;
    @state() filteredData: Row[] = [];
    @state() sortColumns: SortColumn[] = [];
    @state() page = 0;
    @state() perPage = 10;
    @state() maxPage = 0;
    @state() searchQuery = '';
    @state() hasActions?: boolean = false;
    @state() tableHeaders: Map<string, LitTableHeader> = new Map();

    private actionName = 'actions';
    private debounceTimer: ReturnType<typeof setTimeout> | undefined;

    static styles = [
        unsafeCSS(styles),
        css`
            .col-min-width { min-width:100px; }
            .button-action {
                padding: .7rem;
                font-size: 1.8rem;
                font-weight: bold;
                margin-right: .5rem;
                min-width: 34px;
                justify-content: center;
            }
            .button + .button { margin-left: inherit; }
            .flip-horizontal { transform: scaleX(-1); }
            .flip-horizontal:active { transform: scaleX(-.98); }
            .rotate45 { transform: rotate(-45deg); }
            .arrow { font-size: 2.5rem; line-height: .3; }
            .spinner { display: inline-block; width: 80px; height: 80px; }
            .spinner:after {
                content: " ";
                display: block;
                width: 64px;
                height: 64px;
                margin: 8px;
                border-radius: 50%;
                border: 6px solid var(--color-primary);
                border-color: var(--color-primary) transparent var(--color-primary) transparent;
                animation: spinner 1.2s linear infinite;
            }
            @keyframes spinner {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
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

        this.saveSetting(TableSetting.Sort, JSON.stringify(this.sortColumns));

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

    fetchSetting(name: string): string | null {
        return sessionStorage.getItem(`${this.key}_${name}`);
    }

    saveSetting(name: string, value: string | number) {
        sessionStorage.setItem(`${this.key}_${name}`, value.toString());
    }

    filterData() {
        // create a new array and filter by the search query
        const filteredData = this.searchQuery ? this.data?.filter(this.filterArray.bind(this.searchQuery.toLowerCase())) : [...this.data];

        // sort the new array
        filteredData.sort(this.sortColumns?.length ? this.compare.bind(this.sortColumns) : this.defaultCompare)

        // cache the total number of filtered records and max number of pages for paging
        this.filteredRecordTotal = filteredData.length;
        this.maxPage = Math.max(Math.ceil(this.filteredRecordTotal / this.perPage) - 1, 0);

        // determine the correct slice of data for the current page, and reassign our array to trigger the update
        this.filteredData = filteredData.slice(this.perPage * this.page, (this.perPage * this.page) + this.perPage);
    }

    async fetchData() {
        if (!this.src.length) {
            return;
        }

        this.data = (await fetch(this.src).then((res) => res.json())).map((x: Row, index: number) => {
            x._index = index;
            return x;
        }) ?? [];

        this.filterData();
    }

    async firstUpdated() {
        // check sessionStorage for saved settings
        this.perPage = parseInt(this.fetchSetting(TableSetting.PerPage) ?? '10', 10);
        this.page = parseInt(this.fetchSetting(TableSetting.Page) ?? '0', 10);
        this.searchQuery = this.fetchSetting(TableSetting.SearchQuery) ?? '';
        this.sortColumns = JSON.parse(this.fetchSetting(TableSetting.Sort) ?? '[]');

        if (this.shadowRoot) {
            const slot = this.shadowRoot.querySelector('slot');
            if (slot) {
                const assignedNodes = slot.assignedNodes();
                this.tableHeaders = new Map(assignedNodes.filter((x) => x.nodeName === 'LIT-TABLE-HEADER')
                    .map((x) => x as LitTableHeader).map((x) => [x.property, x])
                );
                this.sortColumns.forEach((x) => {
                    const header = this.tableHeaders.get(x.property);
                    if (header) {
                        header.sortOrder = x.sortOrder;
                    }
                });
            }
        }

        if (this.addUrl || this.editUrl || this.deleteUrl) {
            this.hasActions = true;
        }

        await this.fetchData();
    }

    onSearchQueryInput(searchQuery: string) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        this.debounceTimer = setTimeout(() => {
            if (this.searchQuery !== searchQuery) {
                this.page = 0;
                this.saveSetting(TableSetting.SearchQuery, searchQuery);
            }
            this.searchQuery = searchQuery;
            this.filterData();
        }, 250);
    }

    onPerPageInput(perPage: string) {
        const newVal = parseInt(perPage, 10) ?? 10;
        if (this.perPage !== newVal) {
            this.page = 0;
            this.saveSetting(TableSetting.PerPage, newVal);
        }
        this.perPage = newVal;

        this.filterData();
    }

    onFirstPageClick() {
        this.setPage(0);
    }

    onLastPageClick() {
        this.setPage(this.maxPage);
    }

    onPreviousPageClick() {
        this.setPage(Math.max(this.page - 1, 0));
    }

    onNextPageClick() {
        this.setPage(Math.min(this.page + 1, this.maxPage));
    }

    setPage(page: number) {
        this.page = page;
        this.saveSetting(TableSetting.Page, this.page);
        this.filterData();
    }

    renderActions(row: object) {
        const editUrl = this.replaceInUrl(this.editUrl, row);
        const deleteUrl = this.replaceInUrl(this.deleteUrl, row);

        return html`
            ${editUrl ?
                html`<a href="${editUrl}" class="button primary button-action icon" title="${this.localize('table.edit')}">&#9998;</a>`
                : ''
            }
            ${deleteUrl ?
                html`<lit-modal href="${deleteUrl}" type="confirm" lang="${this.lang}">
                    <span slot="button">
                        <button class="button dark button-action icon" title="${this.localize('table.delete')}">&#10006;</button>
                    </span>
                    <span slot="modal-header"><h4>${this.localize('table.confirmDelete')}</h4></span>
                    <span slot="modal-content">${this.localize('table.areYouSure')}</span>
                </lit-modal>`
                : ''
            }
        `;
    }

    renderRows(keys: string[]) {
        if (!this.filteredData?.length) {
            return html`<tr><td colspan="${keys.length}" class="text-center">${this.localize('table.noData')}</td></tr>`;
        }

        return html`
            ${repeat(this.filteredData, (row) => row[this.rowKey as keyof typeof row], (row) => {
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

    renderCount() {
        if (!this.filteredRecordTotal) {
            return;
        }
        return html`${(this.page * this.perPage) + 1} ${this.localize('table.to')} ${Math.min((this.page + 1) * this.perPage,
            this.filteredRecordTotal)} ${this.localize('table.of')} ${this.filteredRecordTotal}`;
    }

    renderInnerContent() {
        // Check if data is loaded
        if (!this.data.length) {
            return html`<slot name="loading"><h1 class="text-center"><div class="spinner"></div></h1></slot>`;
        }

        const keys = [ ...(this.hasActions ? [this.actionName] : []),  ...Array.from(this.tableHeaders.keys()) ];

        return html`
            <div class="container" id="${this.key}">
                <div class="row">
                    <div class="col col-10-md">
                        <input type="text" name="litTableSearchQuery" placeholder="${this.localize('table.search')}" class="col-6 col-4-md"
                            value="${this.searchQuery}" @input=${(e: InputEvent) => this.onSearchQueryInput((e.target as HTMLInputElement).value)}
                        >
                    </div>
                    <div class="col col-2-md is-right is-vertical-align">
                        ${this.renderCount()}
                    </div>
                </div>
                <div class="row">
                    <div class="col">
                        <table class="striped">
                            <thead @litTableSorted="${this.onSorted}">
                                <tr>
                                    ${keys.map((key) => {
                                        if (key === this.actionName) {
                                            return html`
                                                <th class="col-min-width">
                                                    ${this.addUrl ?
                                                        html`<a href="${this.addUrl}" class="button secondary button-action icon"
                                                            title="${this.localize('table.add')}"
                                                        >
                                                            <span class="rotate45">&#10006;</span>
                                                        </a>` : ''
                                                    }
                                                </th>
                                            `;
                                        }
                                        const header = this.tableHeaders.get(key);
                                        return html`
                                            <th class="col-min-width">${header ? header : key.replace(/\b([a-z])/g, (_, val) => val.toUpperCase())}</th>
                                        `;
                                    })}
                                </tr>
                            </thead>
                            <tbody>
                                ${this.renderRows(keys)}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="row">
                    <div class="col col-10-md">
                        <button class="button button-action primary flip-horizontal" title="${this.localize('table.first')}" @click="${this.onFirstPageClick}"
                            ?disabled="${this.page === 0}"
                        >
                            <span class="arrow">&#187;</span>
                        </button>
                        <button class="button button-action primary flip-horizontal" title="${this.localize('table.previous')}"
                            @click="${this.onPreviousPageClick}" ?disabled="${this.page === 0}"
                        >
                            <span class="arrow">&#8250;</span>
                        </button>
                        <button class="button button-action primary" title="${this.localize('table.next')}" @click="${this.onNextPageClick}"
                            ?disabled="${this.page === this.maxPage}"
                        >
                            <span class="arrow">&#8250;</span>
                        </button>
                        <button class="button button-action primary" title="${this.localize('table.last')}" @click="${this.onLastPageClick}"
                            ?disabled="${this.page === this.maxPage}"
                        >
                            <span class="arrow">&#187;</span>
                        </button>
                    </div>
                    <div class="col col-2-md">
                        <select name="litTablePerPage" @input=${(e: InputEvent) => this.onPerPageInput((e.target as HTMLInputElement).value)}>
                            <option disabled>${this.localize('table.perPage')}</option>
                            <option value="10" ?selected="${this.perPage === 10}">10</option>
                            <option value="20" ?selected="${this.perPage === 20}">20</option>
                            <option value="50" ?selected="${this.perPage === 50}">50</option>
                            <option value="100" ?selected="${this.perPage === 100}">100</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    render() {
        return html`<slot></slot>${this.renderInnerContent()}`;
    }
}
