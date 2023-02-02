import { beforeEach, describe, expect, it } from 'vitest'
import { tick } from './functions/utils'
import '../src/LitAlert'
import i18nJson from '../src/i18n/i18n.json';

const textContent = 'Alert test';

function getShadowRoot(): ShadowRoot | null | undefined {
    return document.body.querySelector('lit-alert')?.shadowRoot;
}

function isRendered() {
    return new Promise<void>((resolve) => {
        const interval = setInterval(() => {
            if (getShadowRoot()) {
                clearInterval(interval);
                resolve();
            }
        })
    });
}

function getAlertDiv(): HTMLElement | null | undefined {
    return getShadowRoot()?.querySelector('div');
}

function getDismissButton(): HTMLElement | null | undefined {
    return getShadowRoot()?.querySelector('.button-dismiss');
}

describe('dismissable success alert', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `<lit-alert type="success" lang="en">${textContent}</lit-alert>`;
        await isRendered();
    });

    it('should have success style', async () => {
        expect(Array.from(getAlertDiv()?.classList ?? [])).toContain('bg-success');
    })

    it('should have test text', async () => {
        const slots = getAlertDiv()?.querySelector('.col-11')?.querySelectorAll('slot');
        expect(slots?.length).toBe(1);
        expect(slots && slots[0].assignedNodes()[0].textContent).toContain(textContent);
    });

    it('should go away on dismiss click', async () => {
        getDismissButton()?.click();
        await tick();
        expect(getDismissButton()).toBeFalsy();
    });

    it('should have English title', async () => {
        expect(getDismissButton()?.title).toBe(i18nJson.en.alert.dismiss);
    });
});

describe('dismissible error alert', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `<lit-alert type="error">${textContent}</lit-alert>`;
        await isRendered();
    });

    it('should have error style', async () => {
        expect(Array.from(getAlertDiv()?.classList ?? [])).toContain('bg-error');
    });

    it('should have test text', async () => {
        const slots = getAlertDiv()?.querySelector('.col-11')?.querySelectorAll('slot');
        expect(slots?.length).toBe(1);
        expect(slots && slots[0].assignedNodes()[0].textContent).toContain(textContent);
    });

    it('should go away on dismiss click', async () => {
        getDismissButton()?.click();
        await tick();
        expect(getDismissButton()).toBeFalsy();
    });
});

describe('not dismissible alert', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `<lit-alert type="success" no-dismiss>${textContent}</lit-alert>`;
        await isRendered();
    });

    it('should have no dismiss btn', async () => {
        expect(getDismissButton()).toBeFalsy();
    });

    it('should have test text', async () => {
        const slots = getAlertDiv()?.querySelectorAll('slot');
        expect(slots?.length).toBe(1);
        expect(slots && slots[0].assignedNodes()[0].textContent).toContain(textContent);
    });
});

describe('alert with defaults', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `<lit-alert>${textContent}</lit-alert>`;
        await isRendered();
    });

    it('should have success style', async () => {
        expect(Array.from(getAlertDiv()?.classList ?? [])).toContain('bg-success');
    });

    it('should have English title', async () => {
        expect(getDismissButton()?.title).toBe(i18nJson.en.alert.dismiss);
    });
});

describe('alert with invalid type', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `<lit-alert type="gibberish">${textContent}</lit-alert>`;
        await isRendered();
    });

    it('should have no content', async () => {
        expect(getShadowRoot()?.querySelectorAll('div').length).toBeFalsy();
    });
});

describe('alert in spanish', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `<lit-alert lang="es">${textContent}</lit-alert>`;
        await isRendered();
    });

    it('should have Spanish title', async () => {
        expect(getDismissButton()?.title).toBe(i18nJson.es.alert.dismiss);
    });
});
