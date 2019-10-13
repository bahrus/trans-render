import { deleteMe } from './init.js';
/**
 *
 * @param target
 * @param template
 */
export function replaceTargetWithTag(target, tag, ctx, preSwapCallback) {
    const tagEl = document.createElement(tag);
    ctx.replacedElement = target;
    target[deleteMe] = true;
    if (preSwapCallback)
        preSwapCallback(tagEl);
    target.insertAdjacentElement('afterend', tagEl);
}
