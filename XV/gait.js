import { get } from './get.js';
export async function gait(usl) {
    let test = await get(usl);
    if (test !== null)
        return test;
    const { parse } = await import('./parse.js');
    const parsed = parse(usl);
    const { waitForMatchingEvent } = await import('../lib/waitForMatchingEvent.js');
    //timeout?
    await waitForMatchingEvent(window, 'message', async (e) => {
        const { data } = e;
        if (data instanceof Set) {
            if (data.has(usl) || data.has(parsed.usp)) {
                test = await get(usl);
                if (test !== null)
                    return true;
            }
            return false;
        }
        else {
            throw 400;
        }
    });
    return test;
}
