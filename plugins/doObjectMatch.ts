import {
    RenderContext, 
    RenderOptions, 
    NextStep, 
    TransformValueOptions, 
    TransformMatch,
    TransformValueObjectOptions,
    TransformValueArrayOptions,
    ATRIUM_Loop,
    PEATUnionSettings,
    InitTransform,
    UpdateTransform,
    Plugin,
    CATMINT_Conditional
} from '../types.js';

import {doNextStepSelect, copyCtx, doNextStepSibling, processEl, restoreCtx, getProp, isTemplate, processSymbols} from '../transform.js';

//export const repeatethFnContainer: IRepeatethContainer = {};

function doTransform(ctx: RenderContext, tvoo: TransformValueObjectOptions){
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
              processSymbols(ctx);
          }
          delete ctx.previousTransform;
        }
        restoreCtx(ctx, ctxCopy);
}

export function doObjectMatch(key: string, tvoo: TransformValueObjectOptions, ctx: RenderContext){
    if(Array.isArray(tvoo)){
        doArrayMatch(key, tvoo as TransformValueArrayOptions, ctx);
    }else{
        if(isTemplate(tvoo as HTMLTemplateElement)){
            doTemplate(ctx, tvoo as HTMLTemplateElement);
            return;
        }

        doTransform(ctx, tvoo);
    }
}

function bulkTransfer(src: Element, target: Element){
  Array.from(src.childNodes).forEach(node => {
    target.appendChild(node);
  })
}

const twm = Symbol(); // template weak map
function doTemplate(ctx: RenderContext, te: HTMLTemplateElement){
    const target = ctx.target!;
    const useShadow = te.dataset.shadowRoot !== undefined;
    
    let fragmentTarget : Node = target;
    const clone = te.content.cloneNode(true) as DocumentFragment;
    if(useShadow){
      if(target.shadowRoot === null){
        target.attachShadow({mode: te.dataset.shadowRoot as 'open' | 'closed', delegatesFocus: true});
      }else{
        target.shadowRoot.innerHTML = '';
      }
      fragmentTarget = target.shadowRoot!;
      fragmentTarget.appendChild(clone);
    }else{
      const slots = Array.from(clone.querySelectorAll('slot')) as HTMLSlotElement[];

      if(slots.length > 0){
        slots.forEach(slot => {
          let slotTarget = slot as Element;
          
          if(slotTarget.hasAttribute('as-template')){
            const templ = document.createElement('template');
            slotTarget.insertAdjacentElement('afterend', templ);
            slotTarget = templ;
            slot.remove();
          }
          const name = slot.name;
          if(name){
            const sourceSlot = target.querySelector(`[slot="${name}"]`);
            if(sourceSlot !== null) bulkTransfer(sourceSlot, slotTarget);
          }else{
            bulkTransfer(target, slotTarget);
          }
        });
        target.innerHTML = '';
        target.appendChild(clone);
      }else{
        const templateContents = Array.from(target.querySelectorAll('template-content')) as HTMLElement[];
        const aTarget = target as any;
        if(aTarget[twm] === undefined){
          aTarget[twm] = new WeakMap();
        }
        const wm = aTarget[twm] as WeakMap<any, any>;
        const existingContent = wm.get(te);
        templateContents.forEach(templateContent => {
          if(existingContent === undefined || templateContent !== existingContent){
            templateContent.style.display = 'none';
            templateContent.removeAttribute('part');
          }else if(existingContent !== undefined && templateContent === existingContent){
            existingContent.style.display = 'block';
            templateContent.setAttribute('part','content');
          }
        });
        if(existingContent === undefined){
          const templateContent = document.createElement('template-content');
          templateContent.style.display = 'block';
          templateContent.setAttribute('part', 'content');
          const clone = te.content.cloneNode(true) as DocumentFragment;
          templateContent.appendChild(clone);
          wm.set(te, templateContent);
          target.appendChild(templateContent);
        }
      }
      
      //target.innerHTML = '';
    } 
    
}

function doArrayMatch(key: string, tvao: TransformValueArrayOptions, ctx: RenderContext){
    const firstEl = tvao[0];
    switch(typeof firstEl){
        case 'undefined':
          //do nothing!
          return;
        case 'object':
            if(Array.isArray(firstEl)){
                doRepeat(key, tvao as ATRIUM_Loop, ctx); 
            }else{
                doPropSetting(key, tvao as PEATUnionSettings, ctx);
            }
            break;
        case 'boolean':
            doCondition(key, tvao as CATMINT_Conditional, ctx);
            break;
        case 'symbol':
            (<any>ctx)[firstEl as any as string].fn(ctx, tvao);
            break;
        case 'string':
          const target = ctx.target! as HTMLElement;
          const position = tvao[1];
          let el: HTMLElement | undefined;
          if(position !== undefined){
            if(position === 'replace'){
              //replace makes no sense if tag names are the same.
              //this logic allows declarative tag replace config to be simpler to maintain.
              if(target.localName !== firstEl){
                el = document.createElement(firstEl);
                //https://paulbakaus.com/2019/07/28/quickly-copy-dom-attributes-from-one-element-to-another/
                target.getAttributeNames().forEach(name =>{
                  el!.setAttribute(name, target.getAttribute(name)!);
                });
                target.childNodes.forEach(node =>{
                  el!.append(node);
                })
                target.dataset.deleteMe = 'true';
                target.insertAdjacentElement('afterend', el);
              }

            }else{
              el = document.createElement(firstEl);
              target.insertAdjacentElement(position, el);
            }
            
          }else{
            const el = document.createElement(firstEl);
            target.appendChild(el);
          }
          const peat = tvao[2];
          if(peat !== undefined && el !== undefined){
            ctx.target = el;
            doPropSetting(key, peat as PEATUnionSettings, ctx);
            ctx.target = target;
          }
    }
}

function doCondition(key: string, cu: CATMINT_Conditional, ctx: RenderContext){
  //TODO:  Deal with toggling conditions -- use some (data-)attribute / state 
  const [conditionVal, affirmTempl, mi, negativeTempl] = cu;
  const templateToClone = conditionVal ? affirmTempl : negativeTempl; 
  if(templateToClone !== undefined){
    ctx.target!.appendChild(templateToClone.content.cloneNode(true));
  }
  if(mi !== undefined){
    const cache = ctx.host || ctx;
    if(mi.yesSym !== undefined){
      if(conditionVal){
        (<any>cache)[mi.yesSym as any as string] = ctx.target;
      }else{
        delete (<any>cache)[mi.yesSym as any as string];
      }
    }
    if(mi.noSym !== undefined){
      if(conditionVal){
        delete (<any>cache)[mi.noSym as any as string];
      }else{
        (<any>cache)[mi.noSym as any as string] = ctx.target;
      }
    }
    if(mi.eitherSym !== undefined){
      (<any>cache)[mi.eitherSym as any as string] = ctx.target;
    } 
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
        //sigh
        const safeProps = Object.assign({}, props) as any;
        delete safeProps.dataset;
        delete safeProps.style;
        Object.assign(target, safeProps);
        if(props.style !== undefined) Object.assign(target.style, props.style);
        if(props.dataset !== undefined) Object.assign(target.dataset, props.dataset);
      }
    }else{
      return;
    }
    if (len > 1) {
      /////////  Event Handling
      if(peat[1] !== undefined){
        const eventSettings = peat[1];
        for (const key in eventSettings) {
          let eventHandler = eventSettings[key];
          if(eventHandler === undefined) throw "No event handler found with name " + key;
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

    }else{
      return;
    }
    if (len > 2) {
      /////////  Attribute Setting
      if(peat[2] !== undefined){
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
    }else{
      return;
    }
    if(len > 3){
      if(peat[3] !== undefined){
        doTransform(ctx, peat[3] as TransformValueObjectOptions);
      }

    }else{
      return;
    }
    if(len > 4  && peat[4] !== undefined){
      ////////////// Symbol
      (ctx.host || ctx.cache)[peat[4]] = target;
    }

}

function doRepeat(key: string, atriums: ATRIUM_Loop, ctx: RenderContext){
    const mode = ctx.mode;
    const newMode = ctx.mode;
    const vm = ctx.viewModel;
    ctx.viewModel = atriums[0];
    const transform = ctx.repeatProcessor!(atriums[1], ctx, atriums[0], ctx.target!, atriums[3], atriums[4]);
    ctx.viewModel = vm;
}