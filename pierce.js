import { init } from './init.js';
export function pierce(el, ctx, targetTransform) {
    customElements.whenDefined(el.localName).then(() => {
        requestAnimationFrame(() => {
            const newCtx = { ...ctx };
            newCtx.Transform = targetTransform;
            init(el.shadowRoot, newCtx);
        });
    });
}
