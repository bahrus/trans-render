import { camelToLisp } from "./camelToLisp.js";
export const attribs = ['parts', 'classes', 'attribs', 'elements', 'props'];
export function getQuery(key) {
    const lpKey = camelToLisp(key);
    for (const type of attribs) {
        if (lpKey.endsWith(type)) {
            const attrib = lpKey.substr(0, lpKey.length - type.length - 1);
            let query;
            switch (type) {
                case 'parts': {
                    query = `[part*="${attrib}"]`;
                    break;
                }
                case 'classes': {
                    query = `.${attrib}`;
                    break;
                }
                case 'attribs': {
                    query = `[${attrib}]`;
                    break;
                }
                case 'elements': {
                    query = attrib;
                    break;
                }
                case 'props': {
                    query = `[-${attrib}]`;
                    break;
                }
            }
            if (query !== undefined) {
                return { query, type, attrib };
            }
        }
    }
    return null;
}
