import { modifyPRHS } from './P.js';
import { applyPEA } from './applyPEA.js';
import { NestedTransform } from './NestedTransform.js';
import { TemplateMerge } from './TemplateMerge.js';
export class PEA {
    do(ctx) {
        if (ctx.host === undefined)
            throw 'Unknown host.';
        const modifiedProps = modifyPRHS(ctx, 0);
        const modifiedEvents = modifyPRHS(ctx, 1);
        const modifiedAttribs = modifyPRHS(ctx, 2);
        applyPEA(ctx.host, ctx.target, [modifiedProps, modifiedEvents, modifiedAttribs]);
        const templateOrTransformOrTemplateTransformTuple = ctx.rhs[3];
        if (templateOrTransformOrTemplateTransformTuple === undefined)
            return;
        let template;
        let transform;
        if (Array.isArray(templateOrTransformOrTemplateTransformTuple)) {
            template = templateOrTransformOrTemplateTransformTuple[0];
            transform = templateOrTransformOrTemplateTransformTuple[1];
        }
        else if (templateOrTransformOrTemplateTransformTuple instanceof HTMLTemplateElement) {
            template = templateOrTransformOrTemplateTransformTuple;
        }
        else {
            transform = templateOrTransformOrTemplateTransformTuple;
        }
        if (template !== undefined) {
            ctx.rhs = template;
            const templMerge = new TemplateMerge();
            templMerge.do(ctx);
        }
        if (transform !== undefined) {
            ctx.rhs = transform;
            const nestedTransform = new NestedTransform();
            nestedTransform.do(ctx);
        }
    }
}
