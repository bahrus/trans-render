import { USLMapping } from '../ts-refs/trans-render/XV/types.js';

const values: Map<string | number  | symbol, any> = new Map();

export async function weave(schema: USLMapping){
    return new Weave(schema);
}

export async function when(guid: string){
    if(values.has(guid)) return values.get(guid);
    const {waitForEvent} = await import('./waitForEvent.js');
    await waitForEvent(window, guid);
    return values.get(guid);
}

export class Weave {
    constructor(public schema: USLMapping){}
    #into: string | number  | symbol | undefined;
    async into(guid: string | number | symbol){
        if(values.has(guid)) return;
        this.#into = guid;

        const objToPipe = await this.#draw();
        values.set(guid, objToPipe);
        window.dispatchEvent(new Event(guid.toString()));
    }

    async #draw() : Promise<any>{
        return new Promise(async (resolve, reject) => {
            const {draw} = await import('../XV/draw.js');
            const drawn = await draw(this.schema);
            if(this.#isComplete(drawn)){
                resolve(drawn);
                return;
            }
            throw 'NI';
        });
    }

    #isComplete(obj: any){
        for(const key in this.schema){
            if(obj[key] === undefined || obj[key] === null) return false;
        }
        return true;
    }
}