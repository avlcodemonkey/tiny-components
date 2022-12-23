import { LitElement } from 'lit';
import { SortOrder } from './enums/SortOrder';
export declare class LitColumnHeader extends LitElement {
    property: string;
    noSort: boolean;
    sortOrder: SortOrder | undefined;
    static styles: import("lit").CSSResult[];
    toggleSort(): void;
    renderSort(): import("lit-html").TemplateResult<1> | undefined;
    render(): import("lit-html").TemplateResult<1>;
}
