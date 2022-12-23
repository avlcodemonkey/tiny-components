import { LitElement } from 'lit';
import { SortOrder } from './enums/SortOrder';
interface Row {
    _index: number;
}
type SortColumn = {
    property: string;
    sortOrder: SortOrder;
};
export declare class LitTable extends LitElement {
    src: string;
    rowKeyProperty: string;
    addUrl: string;
    editUrl: string;
    deleteUrl: string;
    values?: Row[];
    sortColumns: SortColumn[];
    private hasActions?;
    private actionName;
    private columnHeaders;
    static styles: import("lit").CSSResult[];
    defaultCompare(a: Row, b: Row): 1 | -1 | 0;
    compare(this: SortColumn[], a: Row, b: Row): 1 | -1 | 0;
    onSorted(event: CustomEvent): void;
    replaceInUrl(url: string, row: object): string;
    renderActions(row: object): import("lit-html").TemplateResult<1>;
    renderInnerContent(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1>;
    firstUpdated(): Promise<void>;
    fetchData(): Promise<void>;
}
export {};
