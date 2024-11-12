import { USLMapping } from './ts-refs/trans-render/XV/types';

export const yields: Map<string, any> = new Map();

export async function y(schema: USLMapping){
    return new Yield(schema);
}

export async function a(guid: string){
    if(yields.has(guid)) return yields.get(guid);
    const {waitForEvent} = await import('./lib/waitForEvent.js');
    await waitForEvent(window, guid);
    return yields.get(guid);
}

export class Yield {
    constructor(public schema: USLMapping){}
    #to: string;
    async to(guid: string){
        if(yields.has(guid)) return;
        this.#to = guid;

        const objToPipe = await this.#yield();
        yields.set(guid, objToPipe);
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