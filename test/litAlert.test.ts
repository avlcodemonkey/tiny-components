import { beforeEach, describe, expect, it, vi } from 'vitest'
import '../src/LitAlert'

describe('Button with increment', async () => {
    function getAlertDiv(): HTMLElement | null | undefined {
        return document.body.querySelector('lit-alert')?.shadowRoot?.querySelector('div');
    }

    function getDismissButton(): HTMLElement | null | undefined {
        return document.body.querySelector('lit-alert')?.shadowRoot?.querySelector('.button-dismiss');
    }

    beforeEach(async () => {
        document.body.innerHTML = '<lit-alert type="success">Alert test</lit-alert>';
        await new Promise<void>((resolve) => {
            const interval = setInterval(() => {
                if (getAlertDiv()) {
                    clearInterval(interval);
                    resolve();
                }
            })
        })
    })

    it('should go away on dismiss click', () => {
        getDismissButton()?.click();
        expect(getDismissButton()).toBeFalsy()
    })

    /*
    it('should show name props', () => {
        getInsideButton()
        expect(document.body.querySelector('my-button')?.shadowRoot?.innerHTML).toContain('World')
    })

    it('should dispatch count event on button click', () => {
        const spyClick = vi.fn()

        document.querySelector('my-button')!.addEventListener('count', spyClick)

        getInsideButton()?.click()

        expect(spyClick).toHaveBeenCalled()
    })
    */
})