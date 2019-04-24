import { insertAdjacentTemplate } from "./insertAdjacentTemplate";
import { deleteMe } from './init.js';
/**
 *
 * @param target
 * @param template
 */
export function replaceTargetWithTemplate(target, template) {
    insertAdjacentTemplate(template, target, 'afterend');
    target[deleteMe] = true;
}
