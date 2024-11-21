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
        if (Array.isArray(data)) {
            let foundMatch = false;
            for (const item of data) {
                if (item === usl) {
                    foundMatch = true;
                    continue;
                }
                if (item === parsed.usp) {
                    foundMatch = true;
                    continue;
                }
            }
            if (foundMatch) {
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
