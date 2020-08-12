import { insertAdjacentTemplate } from '../insertAdjacentTemplate.js';
/**
 * Clones the template element within the container, matching the select string,
 * and inserts according to the position parameter, relative to the optional target element,
 * or the container if no target element is provided.
 * @param container
 * @param select
 * @param position
 * @param target
 *
 */
export function chooser(container, select, position, target) {
    const templ = container.querySelector(select);
    insertAdjacentTemplate(templ, target || container, position);
}
