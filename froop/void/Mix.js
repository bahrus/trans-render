import { Svc } from './Svc.js';
export class Mix extends Svc {
    args;
    ext;
    constructor(args) {
        super();
        this.args = args;
        let ext = (args.superclass || HTMLElement);
        const proto = ext.prototype;
        const mixins = args.mixins;
        if (mixins !== undefined) {
            for (const mix of mixins) {
                if (typeof mix === 'function') {
                    ext = mix(ext);
                }
                else {
                    Object.assign(proto, mix);
                }
            }
        }
        this.ext = ext;
        this.resolved = true;
    }
}
