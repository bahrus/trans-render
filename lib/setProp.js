import { assignGingerly } from './assignGingerly.js';
export function setProp(obj, path, val) {
    const splitPath = path.split('.');
    const last = splitPath.pop();
    let context = obj;
    for (const token of splitPath) {
        switch (token) {
            case '':
                continue;
            default:
                let newContext = context[token];
                if (newContext === undefined) {
                    context[token] = {};
                    newContext = context[token];
                }
                context = newContext;
        }
    }
    if (typeof (context[last]) === 'object' && typeof (val) === 'object') {
        assignGingerly(context[last], val);
    }
    else {
        context[last] = val;
    }
}
