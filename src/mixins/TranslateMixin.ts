import {LitElement} from 'lit';
import { property } from 'lit/decorators.js';
import { Language } from '../enums/Language';
import i18nJson from '../i18n/i18n.json';

// eslint-disable-next-line
type Constructor<T = object> = new (...args: any[]) => T;

// Define the interface for the mixin
export declare class TranslateMixinInterface {
    lang: string;
    protected localize(key: string): string;
}

function flatten(obj: object, prefix = '') {
    return Object.keys(obj).reduce((acc, k) => {
        const pre = prefix.length ? prefix + '.' : '';
        const currentValue = obj[k as keyof typeof obj];
        if (Array.isArray(currentValue) || Object(currentValue) === currentValue) {
            Object.assign(acc, flatten(currentValue, pre + k));
        } else {
            // @ts-expect-error TS doesn't like this key
            acc[pre + k] = currentValue;
        }
        return acc;
    }, {});
}

export const TranslateMixin = <T extends Constructor<LitElement>>(superClass: T) => {
    class TranslateMixinClass extends superClass {
        @property({ converter: (value) => value && value in Language ? Language[value as keyof typeof Language] : Language.en }) lang: Language = Language.en;

        private i18n: object | undefined;

        localize(key: string) {
            if (!this.i18n) {
                this.i18n = flatten(i18nJson);
            }

            const fullKey = `${this.lang}.${key}`;
            if (!Object.prototype.hasOwnProperty.call(this.i18n, fullKey)) {
                return key;
            }
            return this.i18n[fullKey as keyof typeof this.i18n];
        }
    }

    return TranslateMixinClass as unknown as Constructor<TranslateMixinInterface> & T;
}