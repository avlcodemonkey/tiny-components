import { beforeEach, describe, expect, it } from 'vitest'
import { tick } from './functions/utils'
import '../src/LitTab'
import '../src/LitNav'

const tab1Key = 'tab1';
const tab2Key = 'tab2';
const tab1Title = 'tab 1 title';
const tab2Title = 'tab 2 title';
const tab1Content = 'tab 1 content';
const tab2Content = 'tab 2 content';

function getShadowRoot(): ShadowRoot | null | undefined {
    return document.body.querySelector('lit-nav')?.shadowRoot;
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

function getNavRoot(): HTMLElement | null | undefined {
    return getShadowRoot()?.querySelector('nav');
}

function getTabLinks(): Array<HTMLElement> {
    return Array.from(getNavRoot()?.querySelectorAll('a') ?? []);
}

function getTabContents(): Array<HTMLElement> {
    return Array.from(getShadowRoot()?.querySelectorAll('.tab-content') ?? []);
}

describe('basic nav', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `
            <lit-nav>
                <lit-tab key="${tab1Key}">${tab1Title}</lit-tab>
                <lit-tab key="${tab2Key}">${tab2Title}</lit-tab>
                <div slot="${tab1Key}">${tab1Content}</div>
                <div slot="${tab2Key}">${tab2Content}</div>
            </lit-nav>
        `;
        await isRendered();
    })

    it('should have nav tag', async () => {
        expect(getNavRoot()).toBeTruthy();
    })

    it('should have two tab links', async () => {
        expect(getTabLinks()?.length).toBe(2);
    })

    it('should have active tab1', async () => {
        const tabLink1 = getTabLinks()[0];

        expect(tabLink1?.id).toBe(`nav-${tab1Key}`);
        expect(tabLink1?.attributes.getNamedItem('aria-controls')?.value).toBe(tab1Key);
        expect(Array.from(tabLink1?.classList ?? [])).toContain('active');
    })

    it('should have inactive tab2', async () => {
        const tabLink2 = getTabLinks()[1];

        expect(tabLink2?.id).toBe(`nav-${tab2Key}`);
        expect(tabLink2?.attributes.getNamedItem('aria-controls')?.value).toBe(tab2Key);
        expect(Array.from(tabLink2?.classList ?? []).some((x) => x === 'active')).toBeFalsy();
    })

    it('should have two tab contents', async () => {
        expect(getShadowRoot()?.querySelectorAll('.tab-content').length).toBe(2);
    })

    it('should have active tab1 content', async () => {
        const tabContent = getTabContents()[0];
        const contentSlot = tabContent?.querySelector('slot');

        expect(tabContent?.id).toBe(tab1Key);
        expect(tabContent?.attributes.getNamedItem('aria-current')).toBeTruthy();
        expect(tabContent?.attributes.getNamedItem('aria-labelledby')?.value).toBe(`nav-${tab1Key}`);
        expect(Array.from(tabContent?.classList ?? []).some((x) => x === 'is-hidden')).toBeFalsy();
        expect(contentSlot?.name).toBe(tab1Key);
        expect(contentSlot?.assignedNodes().length).toBe(1);
        expect(contentSlot?.assignedNodes()[0].textContent).toContain(tab1Content);
    })

    it('should have inactive tab2 content', async () => {
        const tabContent = getTabContents()[1];
        const contentSlot = tabContent?.querySelector('slot');

        expect(tabContent?.id).toBe(tab2Key);
        expect(tabContent?.attributes.getNamedItem('aria-current')).toBeFalsy();
        expect(tabContent?.attributes.getNamedItem('aria-labelledby')?.value).toBe(`nav-${tab2Key}`);
        expect(Array.from(tabContent?.classList ?? [])).toContain('is-hidden');
        expect(contentSlot?.name).toBe(tab2Key);
        expect(contentSlot?.assignedNodes().length).toBe(1);
        expect(contentSlot?.assignedNodes()[0].textContent).toContain(tab2Content);
    })

    it('click should change active tab', async () => {
        getTabLinks()[1].click();
        await tick();

        const tabContent1 = getTabContents()[0];
        const tabContent2 = getTabContents()[1];

        expect(tabContent1?.attributes.getNamedItem('aria-current')).toBeFalsy();
        expect(Array.from(tabContent1?.classList ?? [])).toContain('is-hidden');

        expect(tabContent2?.attributes.getNamedItem('aria-current')).toBeTruthy();
        expect(Array.from(tabContent2?.classList ?? []).some((x) => x === 'is-hidden')).toBeFalsy();
    })
})

describe('empty nav', async () => {
    beforeEach(async () => {
        document.body.innerHTML = '<lit-nav><div>gibberish</div></lit-nav>';
        await isRendered();
    })

    it('should have no content', async () => {
        expect(getShadowRoot()?.querySelectorAll('nav').length).toBeFalsy();
    })
})

describe('full width nav', async () => {
    beforeEach(async () => {
        document.body.innerHTML = `<lit-nav is-full><lit-tab key="${tab1Key}">${tab1Title}</lit-tab><div slot="${tab1Key}">${tab1Content}</div></lit-nav>`;
        await isRendered();
    })

    it('should have is-full class', async () => {
        expect(Array.from(getShadowRoot()?.querySelector('nav')?.classList ?? [])).toContain('is-full');
    })
})