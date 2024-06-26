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
            if (re2 !== null) {
                const propName = parsedExpr.lhs;
                propagator.addEventListener(propName, e => {
                    this.#simpleCompare(instance, internals, parsedExpr, propName, customStateKey);
                });
                this.#simpleCompare(instance, internals, parsedExpr, propName, customStateKey);
            }
            console.log({ parsedExpr, test, expr });
        }
    }
    #simpleCompare(instance, internals, parsedExpr, propName, customStateKey) {
        const val = instance[propName];
        const { op, rhs } = parsedExpr;
        //let method : 'add' | 'delete' = 'delete';
        switch (op) {
            case '==': {
                if (val === null || val === undefined) {
                    internals.states.delete(customStateKey);
                    return;
                }
                const method = val.toString() === rhs ? 'add' : 'delete';
                internals.states[method](customStateKey);
                return;
            }
            default:
                throw 'NI';
        }
    }
}
