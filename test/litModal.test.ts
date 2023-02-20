import { beforeEach, describe, expect, it, vi } from 'vitest'
import { tick } from './functions/utils'
import '../src/LitModal'
import { LitModal } from '../src/LitModal'
import i18nJson from '../src/i18n/i18n.json';

const modal1Key = 'modal1';
const modal1Href = 'http://localhost/';
const modal1Btn = 'Open Confirm';
const modal1Header = 'Confirm Modal Header';
const modal1Content = 'Confirm modal inner content';

const modal2Key = 'modal2';
const modal2Btn = 'Open Dialog';
const modal2Header = 'Dialog Modal Header';
const modal2Content = 'Dialog modal inner content';

function getComponent(): LitModal {
    return document.body.querySelector('lit-modal') as LitModal;
}

function getShadowRoot(): ShadowRoot | null | undefined {
    return document.body.querySelector('lit-modal')?.shadowRoot;
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

function getSlots(): NodeListOf<HTMLSlotElement> | null | undefined {
    return getShadowRoot()?.querySelectorAll('slot');
}

function getCustomTriggerButton(): HTMLElement | null | undefined {
    const slots = getSlots();
    const customButtonSlot = slots && slots[0];
    const nodes = customButtonSlot?.assignedNodes();
    return nodes && nodes[0] as HTMLElement;
}

function getFooter(): HTMLElement | null | undefined {
    return getShadowRoot()?.querySelector('footer');
}

describe('basic confirm modal', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `
            <lit-modal lang="en" key="${modal1Key}" type="confirm" href="${modal1Href}">
                <div slot="button"><button class="button primary">${modal1Btn}</button></div>
                <div slot="modal-header">${modal1Header}</div>
                <div slot="modal-content">${modal1Content}</div>
            </lit-modal>
        `;
        await isRendered();
    });

    it('should have btn trigger', async () => {
        expect(getCustomTriggerButton()).toBeTruthy();
        expect(getCustomTriggerButton()?.querySelector('button')).toBeTruthy();
        expect(getCustomTriggerButton()?.querySelector('button')?.textContent).toBe(modal1Btn);
    });

    it('should open on btn click', async () => {
        getCustomTriggerButton()?.click();
        await tick();
        expect(getShadowRoot()?.querySelector('.modal-overlay')).toBeTruthy();
    });

    it('should have modal content when opened', async () => {
        getCustomTriggerButton()?.click();
        await tick();

        expect(getShadowRoot()?.querySelector(`#${modal1Key}-modal`)).toBeTruthy();
        expect(getShadowRoot()?.querySelector(`#${modal1Key}-header`)).toBeTruthy();
        expect(getShadowRoot()?.querySelector(`#${modal1Key}-content`)).toBeTruthy();
        expect(getFooter()).toBeTruthy();
    });

    it('should have form with action', async () => {
        getCustomTriggerButton()?.click();
        await tick();

        const form = getShadowRoot()?.querySelector('form');
        expect(form).toBeTruthy();
        expect(form?.action).toBe(modal1Href);
    });

    it('should have dismiss/confirm/cancel btns when opened', async () => {
        getCustomTriggerButton()?.click();
        await tick();

        const confirmBtn = getFooter()?.querySelector('.primary');
        const cancelBtn = getFooter()?.querySelector('.secondary');
        const dismissBtn = getShadowRoot()?.querySelector('.button-dismiss') as HTMLElement;

        expect(confirmBtn).toBeTruthy();
        expect(confirmBtn?.textContent).toBe(i18nJson.en.modal.confirm);
        expect(cancelBtn).toBeTruthy();
        expect(cancelBtn?.textContent).toBe(i18nJson.en.modal.cancel);
        expect(dismissBtn).toBeTruthy();
        expect(dismissBtn?.title).toBe(i18nJson.en.modal.dismiss);
    });

    it('should close when dismiss btn clicked', async () => {
        const spy = vi.spyOn(getComponent(), 'onCancelClick');
        getCustomTriggerButton()?.click();
        await tick();

        const dismissBtn = getShadowRoot()?.querySelector('.button-dismiss') as HTMLElement;
        dismissBtn.click();
        await tick();

        expect(getShadowRoot()?.querySelector(`#${modal1Key}-modal`)).toBeFalsy();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should close when cancel btn clicked', async () => {
        const spy = vi.spyOn(getComponent(), 'onCancelClick');
        getCustomTriggerButton()?.click();
        await tick();

        const cancelBtn = getFooter()?.querySelector('.secondary') as HTMLElement;
        cancelBtn.click();
        await tick();

        expect(getShadowRoot()?.querySelector(`#${modal1Key}-modal`)).toBeFalsy();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should close when confirm btn clicked', async () => {
        const spy = vi.spyOn(getComponent(), 'onConfirmClick');
        getCustomTriggerButton()?.click();
        await tick();

        const confirmBtn = getFooter()?.querySelector('.primary') as HTMLElement;
        confirmBtn.click();
        await tick();

        expect(getShadowRoot()?.querySelector(`#${modal1Key}-modal`)).toBeFalsy();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should close when overlay clicked', async () => {
        const spy = vi.spyOn(getComponent(), 'onOverlayClick');
        getCustomTriggerButton()?.click();
        await tick();

        const overlay = getShadowRoot()?.querySelector('.modal-overlay') as HTMLElement;
        overlay.click();
        await tick();

        expect(getShadowRoot()?.querySelector(`#${modal1Key}-modal`)).toBeFalsy();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should focus on dismiss btn on open', async () => {
        getCustomTriggerButton()?.click();
        await tick();

        const dismissBtn = getShadowRoot()?.querySelector('.button-dismiss') as HTMLElement;

        expect(getShadowRoot()?.activeElement).toBe(dismissBtn);
    });
});

describe('basic dialog modal', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `
            <lit-modal lang="en" key="${modal2Key}" type="dialog">
                <div slot="button"><button class="button primary">${modal2Btn}</button></div>
                <div slot="modal-header">${modal2Header}</div>
                <div slot="modal-content">${modal2Content}</div>
            </lit-modal>
        `;
        await isRendered();
    });

    it('should have btn trigger', async () => {
        expect(getCustomTriggerButton()).toBeTruthy();
        expect(getCustomTriggerButton()?.querySelector('button')).toBeTruthy();
        expect(getCustomTriggerButton()?.querySelector('button')?.textContent).toBe(modal2Btn);
    });

    it('should open on btn click', async () => {
        getCustomTriggerButton()?.click();
        await tick();
        expect(getShadowRoot()?.querySelector('.modal-overlay')).toBeTruthy();
    });

    it('should have modal content when opened', async () => {
        getCustomTriggerButton()?.click();
        await tick();

        expect(getShadowRoot()?.querySelector(`#${modal2Key}-modal`)).toBeTruthy();
        expect(getShadowRoot()?.querySelector(`#${modal2Key}-header`)).toBeTruthy();
        expect(getShadowRoot()?.querySelector(`#${modal2Key}-content`)).toBeTruthy();
        expect(getFooter()).toBeFalsy();
    });

});

describe('spanish confirm modal', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `
            <lit-modal lang="es" key="${modal1Key}" type="confirm" href="${modal1Href}">
                <div slot="button"><button class="button primary">${modal1Btn}</button></div>
                <div slot="modal-header">${modal1Header}</div>
                <div slot="modal-content">${modal1Content}</div>
            </lit-modal>
        `;
        await isRendered();
    });

    it('should have Spanish btns when opened', async () => {
        getCustomTriggerButton()?.click();
        await tick();

        const confirmBtn = getFooter()?.querySelector('.primary');
        const cancelBtn = getFooter()?.querySelector('.secondary');
        const dismissBtn = getShadowRoot()?.querySelector('.button-dismiss') as HTMLElement;

        expect(confirmBtn).toBeTruthy();
        expect(confirmBtn?.textContent).toBe(i18nJson.es.modal.confirm);
        expect(cancelBtn).toBeTruthy();
        expect(cancelBtn?.textContent).toBe(i18nJson.es.modal.cancel);
        expect(dismissBtn).toBeTruthy();
        expect(dismissBtn?.title).toBe(i18nJson.es.modal.dismiss);
    });
});

describe('modal with invalid type', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `
            <lit-modal lang="en" key="${modal1Key}" type="gibberish" href="${modal1Href}">
                <div slot="button"><button class="button primary">${modal1Btn}</button></div>
                <div slot="modal-header">${modal1Header}</div>
                <div slot="modal-content">${modal1Content}</div>
            </lit-modal>
        `;
        await isRendered();
    });

    it('should render nothing', async () => {
        expect(getShadowRoot()?.querySelectorAll('div').length).toBeFalsy();
    });
});
