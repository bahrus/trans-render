import { doNextStepSelect, copyCtx, doNextStepSibling, processEl, restoreCtx, getProp, isTemplate, processSymbols } from '../transform.js';
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
            processSymbols(ctx);
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
function bulkTransfer(src, target) {
    Array.from(src.childNodes).forEach(node => {
        target.appendChild(node);
    });
}
const twm = Symbol(); // template weak map
function doTemplate(ctx, te) {
    const target = ctx.target;
    const useShadow = te.dataset.shadowRoot !== undefined;
    let fragmentTarget = target;
    const clone = te.content.cloneNode(true);
    if (useShadow) {
        if (target.shadowRoot === null) {
            target.attachShadow({ mode: te.dataset.shadowRoot, delegatesFocus: true });
        }
        else {
            target.shadowRoot.innerHTML = '';
        }
        fragmentTarget = target.shadowRoot;
        fragmentTarget.appendChild(clone);
    }
    else {
        const slots = Array.from(clone.querySelectorAll('slot'));
        if (slots.length > 0) {
            slots.forEach(slot => {
                let slotTarget = slot;
                if (slotTarget.hasAttribute('as-template')) {
                    const templ = document.createElement('template');
                    slotTarget.insertAdjacentElement('afterend', templ);
                    slotTarget = templ;
                    slot.remove();
                }
                const name = slot.name;
                if (name) {
                    const sourceSlot = target.querySelector(`[slot="${name}"]`);
                    if (sourceSlot !== null)
                        bulkTransfer(sourceSlot, slotTarget);
                }
                else {
                    bulkTransfer(target, slotTarget);
                }
            });
            target.innerHTML = '';
            target.appendChild(clone);
        }
        else {
            const templateContents = Array.from(target.querySelectorAll('template-content'));
            const aTarget = target;
            if (aTarget[twm] === undefined) {
                aTarget[twm] = new WeakMap();
            }
            const wm = aTarget[twm];
            const existingContent = wm.get(te);
            templateContents.forEach(templateContent => {
                if (existingContent === undefined || templateContent !== existingContent) {
                    templateContent.style.display = 'none';
                    templateContent.removeAttribute('part');
                }
                else if (existingContent !== undefined && templateContent === existingContent) {
                    existingContent.style.display = 'block';
                    templateContent.setAttribute('part', 'content');
                }
            });
            if (existingContent === undefined) {
                const templateContent = document.createElement('template-content');
                templateContent.style.display = 'block';
                templateContent.setAttribute('part', 'content');
                const clone = te.content.cloneNode(true);
                templateContent.appendChild(clone);
                wm.set(te, templateContent);
                target.appendChild(templateContent);
            }
        }
        //target.innerHTML = '';
    }
}
function doArrayMatch(key, tvao, ctx) {
    const firstEl = tvao[0];
    switch (typeof firstEl) {
        case 'undefined':
            //do nothing!
            return;
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
            ctx[firstEl].fn(ctx, tvao);
            break;
        case 'string':
            const target = ctx.target;
            const position = tvao[1];
            let el;
            if (position !== undefined) {
                if (position === 'replace') {
                    //replace makes no sense if tag names are the same.
                    //this logic allows declarative tag replace config to be simpler to maintain.
                    if (target.localName !== firstEl) {
                        el = document.createElement(firstEl);
                        //https://paulbakaus.com/2019/07/28/quickly-copy-dom-attributes-from-one-element-to-another/
                        target.getAttributeNames().forEach(name => {
                            el.setAttribute(name, target.getAttribute(name));
                        });
                        target.childNodes.forEach(node => {
                            el.append(node);
                        });
                        target.dataset.deleteMe = 'true';
                        target.insertAdjacentElement('afterend', el);
                    }
                }
                else {
                    el = document.createElement(firstEl);
                    target.insertAdjacentElement(position, el);
                }
            }
            else {
                const el = document.createElement(firstEl);
                target.appendChild(el);
            }
            const peat = tvao[2];
            if (peat !== undefined && el !== undefined) {
                ctx.target = el;
                doPropSetting(key, peat, ctx);
                ctx.target = target;
            }
    }
}
function doCondition(key, cu, ctx) {
    //TODO:  Deal with toggling conditions -- use some (data-)attribute / state 
    const [conditionVal, affirmTempl, mi, negativeTempl] = cu;
    const templateToClone = conditionVal ? affirmTempl : negativeTempl;
    if (templateToClone !== undefined) {
        ctx.target.appendChild(templateToClone.content.cloneNode(true));
    }
    if (mi !== undefined) {
        const cache = ctx.host || ctx;
        if (mi.yesSym !== undefined) {
            if (conditionVal) {
                cache[mi.yesSym] = ctx.target;
            }
            else {
                delete cache[mi.yesSym];
            }
        }
        if (mi.noSym !== undefined) {
            if (conditionVal) {
                delete cache[mi.noSym];
            }
            else {
                cache[mi.noSym] = ctx.target;
            }
        }
        if (mi.eitherSym !== undefined) {
            cache[mi.eitherSym] = ctx.target;
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
            //sigh
            const safeProps = Object.assign({}, props);
            delete safeProps.dataset;
            delete safeProps.style;
            Object.assign(target, safeProps);
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
                if (eventHandler === undefined)
                    throw "No event handler found with name " + key;
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
