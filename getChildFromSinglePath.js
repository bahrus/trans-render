import { getChildren } from './getChildren.js';
export function getChildFromSinglePath(el, token) {
    let idx = 0;
    let nonIndexedToken = token;
    if (token === '..') {
        return el.parentNode;
    }
    if (token.endsWith(']')) {
        const posOfOpen = token.indexOf('[');
        const indxString = token.substring(posOfOpen + 1, token.length - 1);
        idx = parseInt(indxString);
        nonIndexedToken = token.substring(0, posOfOpen);
    }
    const matchingNodes = [];
    getChildren(el).forEach((child) => {
        if (child.matches && child.matches(nonIndexedToken)) {
            matchingNodes.push(child);
        }
    });
    return matchingNodes[idx];
}
