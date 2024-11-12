export const yields = new Map();
export async function y(schema) {
    return new Yield(schema);
}
export async function a(guid) {
    if (yields.has(guid))
        return yields.get(guid);
    const { waitForEvent } = await import('./lib/waitForEvent.js');
    await waitForEvent(window, guid);
    return yields.get(guid);
}
export class Yield {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    #to;
    async to(guid) {
        if (yields.has(guid))
            return;
        this.#to = guid;
        const objToPipe = await this.#yield();
        yields.set(guid, objToPipe);
        window.dispatchEvent(new Event(guid));
    }
    async #yield() {
        return new Promise(async (resolve, reject) => {
            const { draw } = await import('./XV/draw.js');
            const drawn = await draw(this.schema);
            if (this.#isComplete(drawn)) {
                resolve(drawn);
                return;
            }
            throw 'NI';
        });
    }
    #isComplete(obj) {
        for (const key in this.schema) {
            if (obj[key] === undefined || obj[key] === null)
                return false;
        }
        return true;
    }
}
