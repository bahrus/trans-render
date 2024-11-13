import { USLMapping } from './ts-refs/trans-render/XV/types.js';

const values: Map<string, any> = new Map();

export async function weave(schema: USLMapping){
    return new Weave(schema);
}

export async function when(guid: string){
    if(values.has(guid)) return values.get(guid);
    const {waitForEvent} = await import('./lib/waitForEvent.js');
    await waitForEvent(window, guid);
    return values.get(guid);
}

export class Weave {
    constructor(public schema: USLMapping){}
    #to: string | undefined;
    async into(guid: string){
        if(values.has(guid)) return;
        this.#to = guid;

        const objToPipe = await this.#yield();
        values.set(guid, objToPipe);
        window.dispatchEvent(new Event(guid));
    }

    async #yield() : Promise<any>{
        return new Promise(async (resolve, reject) => {
            const {draw} = await import('./XV/draw.js');
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