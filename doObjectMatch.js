import { doNextStepSelect, copyCtx, doNextStepSibling, processEl, restoreCtx, getProp, isTemplate } from './transform.js';
//export const repeatethFnContainer: IRepeatethContainer = {};
function doTransform(ctx, tvoo) {
    const ctxCopy = copyCtx(ctx);
    ctx.Transform = tvoo; //TODO -- don't do this line if this is a property setting
    const keys = Object.keys(tvoo);
    if (keys.length !== 0) {
        const firstCharOfFirstProp = keys[0][0];
        let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
        ctx.previousTransform = ctxCopy.Transform;
        if (isNextStep) {
            doNextStepSelect(ctx);
            doNextStepSibling(ctx);
        }
        else {
            ctx.target = ctx.target.firstElementChild;
            ctx.level++;
            ctx.idx = 0;
            processEl(ctx);
        }
        delete ctx.previousTransform;
    }
    restoreCtx(ctx, ctxCopy);
}
export function doObjectMatch(key, tvoo, ctx) {
    if (Array.isArray(tvoo)) {
        doArrayMatch(key, tvoo, ctx);
    }
    else {
        if (isTemplate(tvoo)) {
            doTemplate(ctx, tvoo);
            return;
        }
        doTransform(ctx, tvoo);
    }
}
const lastTempl = Symbol();
function doTemplate(ctx, te) {
    const target = ctx.target;
    if (target[lastTempl] !== undefined && target[lastTempl] === te[lastTempl])
        return;
    const useShadow = te.dataset.shadowRoot !== undefined;
    const clone = te.content.cloneNode(true);
    let fragmentTarget = target;
    if (useShadow) {
        if (target.shadowRoot === null) {
            target.attachShadow({ mode: te.dataset.shadowRoot, delegatesFocus: true });
        }
        else {
            target.shadowRoot.innerHTML = '';
        }
        fragmentTarget = target.shadowRoot;
    }
    else if (te.dataset.isSingle) {
        target.innerHTML = '';
    }
    fragmentTarget.appendChild(clone);
}
function doArrayMatch(key, tvao, ctx) {
    const firstEl = tvao[0];
    switch (typeof firstEl) {
        case 'undefined':
        case 'object':
            if (Array.isArray(firstEl)) {
                doRepeat(key, tvao, ctx);
            }
            else {
                doPropSetting(key, tvao, ctx);
            }
            break;
        case 'boolean':
            doCondition(key, tvao, ctx);
            break;
        case 'symbol':
            ctx.plugins[firstEl].fn(ctx, tvao);
            break;
    }
}
function doCondition(key, cu, ctx) {
    const [conditionVal, affirmTempl, mi, negativeTempl, sym] = cu;
    const templateToClone = conditionVal ? affirmTempl : negativeTempl;
    if (templateToClone !== undefined) {
        ctx.target.appendChild(templateToClone.content.cloneNode(true));
    }
    if (mi !== undefined) {
        if (mi.attr !== undefined) {
            const val = conditionVal ? mi.yesVal || 'true' : mi.noVal || 'false';
            if (val !== undefined)
                ctx.target.setAttribute(mi.attr, val);
        }
        const cache = ctx.host || ctx;
        if (mi.yesSym !== undefined && conditionVal) {
            cache[mi.yesSym] = ctx.target;
            if (mi.noSym !== undefined) {
                delete cache[mi.noSym];
            }
        }
        else if (mi.noSym !== undefined && !conditionVal) {
            cache[mi.noSym] = ctx.target;
            if (mi.yesSym !== undefined) {
                delete cache[mi.yesSym];
            }
        }
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
    else {
        return;
    }
    if (len > 1) {
        /////////  Event Handling
        if (peat[1] !== undefined) {
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
    }
    else {
        return;
    }
    if (len > 2) {
        /////////  Attribute Setting
        if (peat[2] !== undefined) {
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
    else {
        return;
    }
    if (len > 3) {
        if (peat[3] !== undefined) {
            doTransform(ctx, peat[3]);
        }
    }
    else {
        return;
    }
    if (len > 4 && peat[4] !== undefined) {
        ////////////// Symbol
        (ctx.host || ctx.cache)[peat[4]] = target;
    }
}
function doRepeat(key, atriums, ctx) {
    const mode = ctx.mode;
    const newMode = ctx.mode;
    const vm = ctx.viewModel;
    ctx.viewModel = atriums[0];
    const transform = ctx.repeatProcessor(atriums[1], ctx, atriums[0], ctx.target, atriums[3], atriums[4]);
    ctx.viewModel = vm;
}
