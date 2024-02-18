import {MountObserver} from 'mount-observer/MountObserver.js';
import {ModificationUnitOfWork, ITransformer} from '../types';
export class Mod<TProps, TMethods, TElement = {}>{
    #abortController = new AbortController();
    constructor(
        mountObserver: MountObserver | undefined,
        transformer: ITransformer<TProps, TMethods, TElement>,
        matchingElement: Element,
        m: ModificationUnitOfWork<TProps, TMethods, TElement>
    ){
        const {on} = m;
        const once = on === 'load';
        matchingElement.addEventListener(on, async e => {
            const {inc, byAmt, s, toggle} = m;
            const {model, options} = transformer;
            const {propagator} = options;
            const isPropagating = !(model instanceof EventTarget) && propagator !== undefined;
            if(inc !== undefined){
                let valToIncBy = 0;
                switch(typeof byAmt){
                    case 'string':
                        if(byAmt[0] === '.'){
                            const {getVal} = await import('../lib/getVal.js');
                            const sVal = await getVal({host: matchingElement}, byAmt);
                            valToIncBy = Number(sVal);
                        }else{
                            valToIncBy = Number((<any>matchingElement)[byAmt]);
                        }
                        break;
                    case 'number':
                        throw 'NI';
                    default:
                        throw 'NI';
                }
                (model[inc] as number) += valToIncBy;
                if(isPropagating){
                    propagator.dispatchEvent(new Event(inc));
                }
            }
            if(s !== undefined){
                const {toValFrom, to} = m;
                let valToSet;
                if(toValFrom !== undefined){
                    switch(typeof toValFrom){
                        case 'string':
                            if(toValFrom[0] === '.'){
                                const {getVal} = await import('../lib/getVal.js');
                                valToSet = await getVal({host: matchingElement}, toValFrom);
                            }else{
                                valToSet = (<any>matchingElement)[toValFrom];
                            }
                            break;
                        case 'function':
                            valToSet = toValFrom(matchingElement, transformer, m);
                            break;
                        default:
                            throw 'NI';
                    }

                }else{
                    throw 'NI';
                }
                (model[s]) = valToSet;
                if(isPropagating){
                    propagator.dispatchEvent(new Event(s));
                }
            }
            if(toggle !== undefined){
                (<any>model)[toggle] = !model[toggle];
                if(isPropagating){
                    propagator.dispatchEvent(new Event(toggle));
                }
            }
        }, {
            signal: this.#abortController.signal,
            once
        });
        if(on === 'load' && !transformer.initializedMods.has(m)){
            //only do one time per selector
            matchingElement.dispatchEvent(new Event('load'));
            transformer.initializedMods.add(m);
        }
        mountObserver?.addEventListener('disconnect', e => {
            this.#abortController.abort();
        });
    }
}