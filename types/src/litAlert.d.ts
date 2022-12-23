import { LitElement } from 'lit';
import { AlertType } from './enums/AlertType';
export declare class LitAlert extends LitElement {
    msg: string;
    type: AlertType;
    noDismiss: boolean;
    isDismissed: boolean;
    static styles: import("lit").CSSResult[];
    renderInnerContent(): import("lit-html").TemplateResult<1>;
    render(): import("lit-html").TemplateResult<1> | undefined;
}
