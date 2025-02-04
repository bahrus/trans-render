import {PropLookup, RoundaboutReady} from '../ts-refs/trans-render/froop/types';

type Constructor<T = {}> = new (...args: any[]) => T;
export const publicPrivateStore = Symbol();
//define a mixin class called RRMixin that implements RoundaboutReady
export function RRMixin<T extends Constructor, TProps=any>(Base: T) {
  abstract class RR extends Base implements RoundaboutReady {
    propagator = new EventTarget();

    RAController: AbortController;

    constructor(...rest: any[]){
        super();
        this.RAController = new AbortController();
    }

    abstract covertAssignment(obj: TProps): Promise<void>;

    sleep?: number | undefined;
    awake() : Promise<void> {
        return new Promise((resolve, reject) => {
            if(!this.sleep) {
                resolve();
                return;
            }
            const ac = this.RAController;
            //I'm thinking this one isn't worth wrapping in an EventHandler, as the "closure"
            //isn't accessing anything other than the resolve and abort controller, doesn't seem worth it.
            this.propagator.addEventListener('sleep', e => {
                if(!this.sleep){
                    ac.abort();
                    resolve();
                }
            }, {signal: ac.signal});
        })
    }
    nudge() {
        const {sleep} = this;
        this.sleep = sleep ? sleep - 1 : 0;
    }
    rock(){
        const {sleep} = this;
        this.sleep = sleep=== undefined ? 1 : sleep + 1;
    }
  }
  return RR;
}
