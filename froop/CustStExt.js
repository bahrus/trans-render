export class CustStExt {
    customStatesToReflect;
    splitSplit;
    #acs = [];
    constructor(instance, internals, customStatesToReflect, splitSplit) {
        this.customStatesToReflect = customStatesToReflect;
        this.splitSplit = splitSplit;
        this.#do(instance, internals);
    }
    async #do(instance, internals) {
        const { propagator } = instance;
        for (const statement of this.splitSplit) {
            const [customStateKey, expr] = statement;
            const re = new RegExp(String.raw `^(?<lhs>.*)(?<op>==|>|>=|<|<=)(?<rhs>.*)`);
            const test = re.exec(expr);
            const { groups } = test;
            const parsedExpr = {
                lhs: groups.lhs.trim(),
                op: groups.op,
                rhs: groups.rhs.trim(),
            };
            const re2 = new RegExp(String.raw `^(?<prop>[\w]+)`);
            const { lhs } = parsedExpr;
            const test3 = re2.exec(lhs);
            if ((test3?.groups).prop === lhs) {
                const propName = lhs;
                const ac = new AbortController();
                this.#acs.push(ac);
                propagator.addEventListener(propName, e => {
                    this.#simpleCompare(instance, internals, parsedExpr, propName, customStateKey);
                }, { signal: ac.signal });
                this.#simpleCompare(instance, internals, parsedExpr, propName, customStateKey);
                continue;
            }
            const percentSplit = lhs.split('%').map(s => s.trim());
            if (percentSplit.length === 2) {
                const [propName, moduloS] = percentSplit;
                const modulo = Number(moduloS);
                const ac = new AbortController();
                this.#acs.push(ac);
                propagator.addEventListener(propName, e => {
                    this.#moduloCompare(instance, internals, parsedExpr, modulo, propName, customStateKey);
                }, { signal: ac.signal });
            }
            propagator.addEventListener('disconnectedCallback', e => {
                this.#disconnect();
            }, { once: true });
        }
    }
    #simpleCompare(instance, internals, parsedExpr, propName, customStateKey) {
        const val = instance[propName];
        if (val === null || val === undefined) {
            internals.states.delete(customStateKey);
            return;
        }
        const { op, rhs } = parsedExpr;
        let method;
        switch (op) {
            case '==': {
                method = val.toString() === rhs ? 'add' : 'delete';
                break;
            }
            case '>=':
            case '<=':
            case '<':
            case '>': {
                const t = this.#getType(instance, propName);
                const rhsM = t === 'Number' ? Number(rhs) : rhs;
                const lhsM = t === 'Number' ? val : val.toString();
                switch (op) {
                    case '>':
                        method = lhsM > rhsM ? 'add' : 'delete';
                        break;
                    case '<':
                        method = lhsM < rhsM ? 'add' : 'delete';
                        break;
                    case '>=':
                        method = lhsM >= rhsM ? 'add' : 'delete';
                        break;
                    case '<=':
                        method = lhsM <= rhsM ? 'add' : 'delete';
                        break;
                }
                console.log({ t });
                break;
            }
            default:
                throw 'NI';
        }
        internals.states[method](customStateKey);
    }
    #moduloCompare(instance, internals, parsedExpr, modulo, propName, customStateKey) {
        const val = instance[propName];
        if (val === null || val === undefined) {
            internals.states.delete(customStateKey);
            return;
        }
        const method = Number(val) % modulo === Number(parsedExpr.rhs) ? 'add' : 'delete';
        internals.states[method](customStateKey);
    }
    #getType(instance, propName) {
        return instance.constructor.props[propName].type;
    }
    #disconnect() {
        for (const ac of this.#acs) {
            ac.abort();
        }
    }
}
