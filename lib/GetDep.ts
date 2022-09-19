import {DTR} from './DTR.js';



export class GetDep{
    constructor(public dtr: DTR){
    }

    #dependencies: Set<string> | undefined;
    async getAll() : Promise<Set<string>>{
        if(this.#dependencies === undefined){
            const returnObj = new Set<string>();
            const {ctx} = this.dtr;
            const {match} = ctx;
            for(const key in match){
                const rhs = match[key];
                await this.#getDepRHS(rhs, returnObj)
            }
            this.#dependencies = returnObj;
        }
        return this.#dependencies!;
    }

    async #getDepRHS(rhs: any, returnObj: Set<string>){
        
        switch(typeof rhs){
            case 'string':
                if(rhs[0] === '.'){
                    returnObj.add(this.dtr.getFirstToken(rhs));
                }else{
                    returnObj.add(rhs);
                }
                
                break;
            case 'object':
                if(Array.isArray(rhs)){
                    switch(typeof rhs[0]){
                        case 'string':
                            let isProp = false;
                            for(const item of rhs){
                                if(isProp) returnObj.add(item);
                                isProp = !isProp;
                            }
                            break;
                        case 'boolean':
                            throw 'DTR1.NI'; //not implemented
                        default:
                            await this.#getDepPropAttr(rhs[0], returnObj); //Prop
                            await this.#getDepPropAttr(rhs[2], returnObj); //Attr
                    }
                }else{
                    const props = rhs.$props as string[];
                    if(props !== undefined){
                        //action object.
                        //convention is to specify props needed in a $props string array
                        props.forEach(s => returnObj.add(this.dtr.getFirstToken(s)));
                    }
                }
                break;
        }
    }

    async #getDepPropAttr(rhs: {[key: string]: any}, returnObj: Set<string>){
        if(rhs === undefined) return;
        for(const key in rhs){
            const item = rhs[key];
            switch(typeof item){
                case 'string':
                    returnObj.add(item);
                    break;
                case 'object':
                    await this.#getDepRHS(item, returnObj);
                    break;
            }
        }
    }
}