import { isDefined } from './isDefined.js';
import { getVal } from './getVal.js';
export async function homeInOn(host, path, resolvedEventPath) {
    await isDefined(host);
    let returnObj = getVal({ host }, path);
    if (returnObj !== undefined)
        return returnObj;
    if (resolvedEventPath !== undefined) {
        host.addEventListener(resolvedEventPath, e => {
            returnObj = getVal({ host }, path);
            return returnObj;
        }, { once: true });
    }
    else {
        returnObj = getVal({ host }, path, 50);
        return returnObj;
    }
    const split = path.split('.');
    let idx = 1;
}
