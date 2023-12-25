import {MountObserver} from 'mount-observer/MountObserver.js';
import {ModificationUnitOfWork, ITransformer} from '../types';
export class Mod<TProps, TMethods>{
    #abortController = new AbortController();
    constructor(
        mountObserver: MountObserver,
        transformer: ITransformer<TProps, TMethods>,
        matchingElement: Element,
        m: ModificationUnitOfWork<TProps, TMethods>
    ){
        const {on} = m;
        matchingElement.addEventListener(on, async e => {
            const {inc, byAmt} = m;
            const {model, propagator} = transformer;
            if(inc !== undefined){
                let valToIncBy = 0;
                switch(typeof byAmt){
                    case 'string':
                        if(byAmt[0] === '.'){
                            const {getVal} = await import('../lib/getVal.js');
                            valToIncBy = Number(getVal({host: model}, byAmt));
                        }else{
                            valToIncBy = Number(model[byAmt]);
                        }
                        break;
                    case 'number':
                        throw 'NI';
                    default:
                        throw 'NI';
                }
                (model[inc] as number) += valToIncBy;
                if(!(model instanceof EventTarget) && propagator !== undefined){
                    propagator.dispatchEvent(new Event('inc'));
                }
            }
            
        }, {
            signal: this.#abortController.signal
        });
        mountObserver.addEventListener('disconnect', e => {
            this.#abortController.abort();
        });
    }
}