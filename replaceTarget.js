import { insertAdjacentTemplate } from "./insertAdjacentTemplate";
export function replaceTargetWithTemplate(target, template) {
    insertAdjacentTemplate(template, target, 'afterend');
    target.remove();
}
