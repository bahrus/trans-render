const values = new Map();
export function weave(schema) {
    return new Weave(schema);
}
export class Weave {
    schema;
    constructor(schema) {
        this.schema = schema;
    }
    #into;
    into(guid) {
        if (values.has(guid))
            return;
        this.#into = guid;
        this.#finishInto(guid);
        return this;
    }
    async #finishInto(guid) {
        const objToPipe = await this.#draw();
        values.set(guid, objToPipe);
        window.dispatchEvent(new Event(guid.toString()));
    }
    async #draw() {
        return new Promise(async (resolve, reject) => {
            const { draw } = await import('../XV/draw.js');
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
    andWeave(schema) {
        return new Weave(schema);
    }
}
export async function when(guid) {
    if (values.has(guid))
        return values.get(guid);
    const { waitForEvent } = await import('mount-observer/waitForEvent.js');
    if (values.has(guid))
        return values.get(guid);
    await waitForEvent(window, guid);
    return values.get(guid);
}
