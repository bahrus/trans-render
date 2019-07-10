import { deleteMe } from './init.js';
/**
 *
 * @param target
 * @param template
 */
export function replaceTargetWithTag(target, tag, ctx, postSwapCallback) {
    const tagEl = document.createElement(tag);
    target.insertAdjacentElement('afterend', tagEl);
    ctx.replacedElement = target;
    target[deleteMe] = true;
    if (postSwapCallback)
        postSwapCallback(tagEl);
}
