const prevCondition = new WeakMap();
export class Conditional {
    dtr;
    constructor(dtr) {
        this.dtr = dtr;
    }
    async do({ host, rhs, ctx }) {
        const exp = rhs[1];
        const { getVal } = await import('./getVal.js');
        let condition = true;
        if (exp.if !== undefined) {
            exp.ifVal = !!(await getVal(ctx, exp.if));
        }
        if (exp.ifVal === false) {
            condition = false;
            // await this.doFalse(ctx!);
            // return;
        }
        else {
            if (exp.lhs !== undefined) {
                exp.lhsVal = await getVal(ctx, exp.lhs);
            }
            if (exp.rhs !== undefined) {
                exp.rhsVal = await getVal(ctx, exp.rhs);
            }
            if (exp.lhsVal !== undefined || exp.rhsVal !== undefined) {
                switch (exp.op) {
                    case '===':
                    case undefined:
                        if (exp.lhsVal !== exp.rhsVal) {
                            condition = false;
                        }
                }
            }
        }
        //TODO don't do either if expression matches previous value
        const target = ctx.target;
        let map = prevCondition.get(target);
        if (map === undefined) {
            map = new Map();
            prevCondition.set(target, map);
        }
        let prevVal = map.get(exp);
        if (prevVal == condition)
            return;
        map.set(exp, condition);
        if (condition) {
            await this.doTrue(ctx);
        }
        else {
            await this.doFalse(ctx);
        }
    }
    async doTrue({ host, rhs, ctx }) {
        const doTrueExpression = rhs[2];
        if (doTrueExpression !== undefined) {
            const verb = 'do_' + typeof (doTrueExpression);
            ctx.rhs = doTrueExpression;
            await this.dtr[verb](ctx);
        }
    }
    async doFalse({ rhs, ctx }) {
        const doFalseExpression = rhs[3];
        if (doFalseExpression !== undefined) {
            const verb = 'do_' + typeof (doFalseExpression);
            ctx.rhs = doFalseExpression;
            await this.dtr[verb](ctx);
        }
    }
}
