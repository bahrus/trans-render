/**
 *
 * @param target
 * @param template
 */
export function replaceTargetWithTag(target, ctx, tag, preSwapCallback) {
    const tagEl = document.createElement(tag);
    ctx.replacedElement = target;
    target.dataset.deleteMe = 'true';
    if (preSwapCallback)
        preSwapCallback(tagEl);
    target.insertAdjacentElement('afterend', tagEl);
}
