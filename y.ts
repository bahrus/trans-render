import { USLMapping } from './ts-refs/trans-render/XV/types';

export const yields: Map<string, any> = new Map();

export async function y(schema: USLMapping){
    return new Yield(schema);
}



export class Yield {
    constructor(public schema: USLMapping){}
    #to: string;
    async to(guid: string){
        if(yields.has(guid)) return;
        this.#to = guid;

        const objToPipe = await this.#yield();
        yields.set(guid, objToPipe);
        window.postMessage(guid)
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