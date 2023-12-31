import { setProp } from './setProp.js';
export function setEnhProp(obj, path, val) {
    path = path.replace('+', "beEnhanced.by.");
    setProp(obj, path, val);
}
