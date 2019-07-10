import { deleteMe } from './init.js';
/**
 *
 * @param target
 * @param template
 */
export function replaceTargetWithTemplate(target, tag, ctx) {
    const tagEl = document.createElement(tag);
    target.insertAdjacentElement('afterend', tagEl);
    ctx.replacedElement = target;
    target[deleteMe] = true;
}
