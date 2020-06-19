import { doNextStepSelect, copyCtx, doNextStepSibling, processEl, restoreCtx, getProp } from './transform.js';
export async function doObjectMatch(key, tvoo, ctx) {
    if (Array.isArray(tvoo)) {
        await doArrayMatch(key, tvoo, ctx);
    }
    else {
        if (isTemplate(tvoo)) {
            doTemplate(ctx, tvoo);
            return;
        }
        const ctxCopy = copyCtx(ctx);
        ctx.Transform = tvoo; //TODO -- don't do this line if this is a property setting
        const keys = Object.keys(tvoo);
        const firstCharOfFirstProp = keys[0][0];
        let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
        if (isNextStep) {
            await doNextStepSelect(ctx);
            doNextStepSibling(ctx);
        }
        else {
            ctx.target = ctx.target.firstElementChild;
            ctx.level++;
            ctx.idx = 0;
            ctx.previousTransform = ctx.Transform;
            await processEl(ctx);
        }
        restoreCtx(ctx, ctxCopy);
    }
}
function isTemplate(test) {
    return test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}
function doTemplate(ctx, te) {
    const clone = te.content.cloneNode(true);
    if (te.dataset.shadowRoot !== undefined) {
        ctx.target.attachShadow({ mode: te.dataset.shadowRoot, delegatesFocus: true }).appendChild(clone);
    }
    else {
        ctx.target.appendChild(clone);
    }
}
async function doArrayMatch(key, tvao, ctx) {
    const firstEl = tvao[0];
    switch (typeof firstEl) {
        case 'undefined':
        case 'object':
            if (Array.isArray(firstEl)) {
                await doRepeat(key, tvao, ctx);
            }
            else {
                doPropSetting(key, tvao, ctx);
            }
            break;
    }
}
function doPropSetting(key, peat, ctx) {
    const len = peat.length;
    const target = ctx.target;
    if (len > 0) {
        //////////  Prop Setting
        /////////   Because of dataset, style (other?) assign at one level down
        const props = peat[0];
        if (props !== undefined) {
            Object.assign(target, props);
            if (props.style !== undefined)
                Object.assign(target.style, props.style);
            if (props.dataset !== undefined)
                Object.assign(target.dataset, props.dataset);
        }
    }
    if (len > 1 && peat[1] !== undefined) {
        /////////  Event Handling
        const eventSettings = peat[1];
        for (const key in eventSettings) {
            let eventHandler = eventSettings[key];
            if (Array.isArray(eventHandler)) {
                const objSelectorPath = eventHandler[1].split('.');
                const converter = eventHandler[2];
                const originalEventHandler = ctx.host !== undefined ? eventHandler[0].bind(ctx.host) : eventHandler[0];
                eventHandler = (e) => {
                    let val = getProp(e.target, objSelectorPath);
                    if (converter !== undefined)
                        val = converter(val);
                    originalEventHandler(val, e);
                };
            }
            else if (ctx.host !== undefined) {
                eventHandler = eventHandler.bind(ctx.host);
            }
            target.addEventListener(key, eventHandler);
        }
    }
    if (len > 2 && peat[2] !== undefined) {
        /////////  Attribute Setting
        for (const key in peat[2]) {
            const val = peat[2][key];
            switch (typeof val) {
                case 'boolean':
                    if (val) {
                        target.setAttribute(key, '');
                    }
                    else {
                        target.removeAttribute(key);
                    }
                    break;
                case 'string':
                    target.setAttribute(key, val);
                    break;
                case 'number':
                    target.setAttribute(key, val.toString());
                    break;
                case 'object':
                    if (val === null)
                        target.removeAttribute(key);
                    break;
            }
        }
    }
}
async function doRepeat(key, atriums, ctx) {
    const mode = ctx.mode;
    const { repeateth } = await import('./repeateth2.js');
    const newMode = ctx.mode;
    const transform = repeateth(atriums[1], ctx, atriums[0], ctx.target, atriums[3], atriums[4]);
}
