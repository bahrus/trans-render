import {
    RenderContext, 
    RenderOptions, 
    NextStep, 
    TransformValueOptions, 
    TransformMatch,
    TransformValueObjectOptions,
    TransformValueArrayOptions,
    ATRIUM_Union,
    PEATUnionSettings,
    InitTransform,
    UpdateTransform,
    Plugin,
  
} from './types2.js';

type repeatethFnSig = (template: HTMLTemplateElement, ctx: RenderContext, items: any[], target: HTMLElement, initTransform: InitTransform, updateTransform: UpdateTransform) => void;

interface IRepeatethContainer{
  repeateth?: undefined | repeatethFnSig;
}

export const repeatethFnContainer: IRepeatethContainer = {};

import { doNextStepSelect, copyCtx, doNextStepSibling, processEl, restoreCtx, getProp } from './transform.js';


export function doObjectMatch(key: string, tvoo: TransformValueObjectOptions, ctx: RenderContext){
    if(Array.isArray(tvoo)){
        doArrayMatch(key, tvoo as TransformValueArrayOptions, ctx);
    }else{
        if(isTemplate(tvoo as HTMLTemplateElement)){
            doTemplate(ctx, tvoo as HTMLTemplateElement);
            return;
        }

        const ctxCopy = copyCtx(ctx);
        ctx.Transform = tvoo; //TODO -- don't do this line if this is a property setting
        const keys = Object.keys(tvoo);
        if(keys.length !== 0){
          const firstCharOfFirstProp = keys[0][0];
          let isNextStep = "SNTM".indexOf(firstCharOfFirstProp) > -1;
          ctx.previousTransform = ctxCopy.Transform;
          if(isNextStep){
              doNextStepSelect(ctx);
              doNextStepSibling(ctx);
          }else{
              ctx.target = ctx.target!.firstElementChild as HTMLElement;
              ctx.level!++;
              ctx.idx = 0;
              processEl(ctx);
          }
          delete ctx.previousTransform;
        }
        restoreCtx(ctx, ctxCopy);
    }
}

function isTemplate(test: any | undefined){
    return test !== undefined && test.localName === 'template' && test.content && (typeof test.content.cloneNode === 'function');
}

const lastTempl = Symbol();
function doTemplate(ctx: RenderContext, te: HTMLTemplateElement){
    const target = ctx.target!;
    if((<any>target)[lastTempl] !== undefined &&   (<any>target)[lastTempl] === (<any>te)[lastTempl]) return;
    const useShadow = te.dataset.shadowRoot !== undefined;
    const clone = te.content.cloneNode(true);
    let fragmentTarget : Node = target;
    if(useShadow){
      if(target.shadowRoot === null){
        target.attachShadow({mode: te.dataset.shadowRoot as 'open' | 'closed', delegatesFocus: true});
      }else{
        target.shadowRoot.innerHTML = '';
      }
      fragmentTarget = target.shadowRoot!;
    }else if(te.dataset.isSingle){
      target.innerHTML = '';
    }
    fragmentTarget.appendChild(clone);
}

function doArrayMatch(key: string, tvao: TransformValueArrayOptions, ctx: RenderContext){
    const firstEl = tvao[0];
    switch(typeof firstEl){
        case 'undefined':
        case 'object':
            if(Array.isArray(firstEl)){
                doRepeat(key, tvao as ATRIUM_Union, ctx); 
            }else{
                doPropSetting(key, tvao as PEATUnionSettings, ctx);
            }
            break;
        case 'symbol':
            //TODO
            break;
    }
}

function doPropSetting(key: string, peat: PEATUnionSettings, ctx: RenderContext){
    const len = peat.length;
    const target = ctx.target as HTMLElement;
    if (len > 0) {
      //////////  Prop Setting
      /////////   Because of dataset, style (other?) assign at one level down
      const props = peat[0];
      if(props !== undefined){
        Object.assign(target, props);
        if(props.style !== undefined) Object.assign(target.style, props.style);
        if(props.dataset !== undefined) Object.assign(target.dataset, props.dataset);
      }
    }
    if (len > 1 && peat[1] !== undefined) {
      /////////  Event Handling
      const eventSettings = peat[1];
      for (const key in eventSettings) {
        let eventHandler = eventSettings[key];
        if(Array.isArray(eventHandler)){
          const objSelectorPath = eventHandler[1].split('.');
          const converter = eventHandler[2];
          const originalEventHandler = ctx.host !== undefined ? eventHandler[0].bind(ctx.host) : eventHandler[0];
          eventHandler = (e: Event) =>{
            let val = getProp(e.target, objSelectorPath);
            if(converter !== undefined) val = converter(val);
            originalEventHandler(val, e);
          }
        }else if(ctx.host !== undefined){
          eventHandler = eventHandler.bind(ctx.host);
        }
        target.addEventListener(key, eventHandler as EventListenerOrEventListenerObject);
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
            } else {
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
            if(val === null) target.removeAttribute(key);
            break;
        }
      }
    }
}

function doRepeat(key: string, atriums: ATRIUM_Union, ctx: RenderContext){
    const mode = ctx.mode;
    const newMode = ctx.mode;
    const transform = repeatethFnContainer.repeateth!(atriums[1], ctx, atriums[0], ctx.target!, atriums[3], atriums[4]);
}