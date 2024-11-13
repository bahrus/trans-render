const values = new Map();
export async function weave(schema) {
    return new Weave(schema);
}
export async function when(guid) {
    if (values.has(guid))
        return values.get(guid);
    const { waitForEvent } = await import('./lib/waitForEvent.js');
    await waitForEvent(window, guid);
    return values.get(guid);
}
export class Weave {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    #to;
    async into(guid) {
        if (values.has(guid))
            return;
        this.#to = guid;
        const objToPipe = await this.#yield();
        values.set(guid, objToPipe);
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
