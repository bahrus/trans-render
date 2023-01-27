export class GetDep {
    dtr;
    constructor(dtr) {
        this.dtr = dtr;
    }
    #dependencies;
    async getAll() {
        if (this.#dependencies === undefined) {
            const returnObj = new Set();
            const { ctx } = this.dtr;
            const { match } = ctx;
            for (const key in match) {
                const rhs = match[key];
                await this.#getDepRHS(rhs, returnObj);
            }
            this.#dependencies = returnObj;
        }
        return this.#dependencies;
    }
    async #getDepRHS(rhs, returnObj) {
        switch (typeof rhs) {
            case 'string':
                if (rhs[0] === '.') {
                    returnObj.add(this.dtr.getFirstToken(rhs));
                }
                else if (rhs[0] === '<' && rhs.at(-1) === '>') {
                    console.debug('[TODO]: provide way to indicate dependencies');
                }
                else {
                    returnObj.add(rhs);
                }
                break;
            case 'object':
                if (!Array.isArray(rhs) && rhs.$action === undefined)
                    rhs = [rhs];
                if (Array.isArray(rhs)) {
                    switch (typeof rhs[0]) {
                        case 'string':
                            let isProp = false;
                            for (const item of rhs) {
                                if (isProp)
                                    returnObj.add(item);
                                isProp = !isProp;
                            }
                            break;
                        case 'boolean':
                            if (rhs[0]) {
                                const { Conditional } = await import('./Conditional.js');
                                const c = new Conditional(this.dtr);
                                const props = c.deps(rhs);
                                props.forEach(d => returnObj.add(d));
                            }
                            else {
                                throw 'tr.GP.NI'; //not implemented
                            }
                        default:
                            await this.#getDepPropAttr(rhs[0], returnObj); //Prop
                            await this.#getDepPropAttr(rhs[2], returnObj); //Attr
                    }
                }
                else {
                    const props = rhs.$props;
                    if (props !== undefined) {
                        //action object.
                        //convention is to specify props needed in a $props string array
                        props.forEach(s => returnObj.add(this.dtr.getFirstToken(s)));
                    }
                }
                break;
        }
    }
    async #getDepPropAttr(rhs, returnObj) {
        if (rhs === undefined)
            return;
        for (const key in rhs) {
            const item = rhs[key];
            switch (typeof item) {
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
