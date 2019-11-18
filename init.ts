import { NextStep, TransformRules, RenderContext, RenderOptions, TransformFn} from "./init.d.js";
export const deleteMe = Symbol('deleteMe');
export function init(
  template: HTMLElement | DocumentFragment,
  ctx: RenderContext,
  target?: HTMLElement | DocumentFragment,
  options?: RenderOptions
): RenderContext {
  const isTemplate = (template as HTMLElement).localName === "template";
  const clonedTemplate =
      isTemplate
      ? document.importNode((template as HTMLTemplateElement).content, true) : template;
  //ctx.template = clonedTemplate;
  if (ctx.Transform) {
    const firstChild = clonedTemplate.firstElementChild;
    if (firstChild !== null) {
      ctx.leaf = firstChild as HTMLElement;
      process(ctx, 0, 0, options);
    }
  }
  let verb = "appendChild";
  if (options) {
    if (options.prepend) verb = "prepend";
    const callback = options.initializedCallback;
    if (callback !== undefined) callback(ctx, clonedTemplate, options);
  }
  if(isTemplate && target){
    (<any>target)[verb](clonedTemplate);
  }else{
    ctx.leaf = clonedTemplate;
  }
  return ctx;
}

export function process(
  context: RenderContext,
  idx: number,
  level: number,
  options?: RenderOptions
) {
  const target = context.leaf! as HTMLElement;
  if (target.matches === undefined) return;
  const transform = context.Transform;

  let nextTransform: TransformRules = {};
  let nextSelector = "";
  let firstSelector = true;
  let matchNextSib: boolean = true;
  let inherit = false;
  let nextMatch = [];
  let prevSelector = null;
  for (const rawSelector in transform) {
    const selector = (prevSelector !== null && rawSelector.startsWith('"')) ? prevSelector : rawSelector;
    if (target.matches(selector)) {
      const transformTemplateVal = transform[selector];
      let resp2 : string | HTMLTemplateElement | void | TransformRules | NextStep | TransformFn | boolean = transformTemplateVal;
      if(typeof resp2 === 'function'){
        resp2 = resp2({target: target, ctx: context, idx: idx, level: level});
      }
      switch (typeof resp2) {
        case "string":
          target.textContent = resp2;
          break;
        case "object":
          if((<HTMLElement>resp2).localName === 'template'){
            const templ = resp2 as HTMLTemplateElement;
            target.appendChild(templ.content.cloneNode(true));
            continue;
          }
          let isTR = true;
          const keys = Object.keys(resp2);
          if (keys.length > 0) {
            const firstCharOfFirstProp = keys[0][0];
            isTR = "SNTM".indexOf(firstCharOfFirstProp) === -1;
          }
          if (isTR) {
            const respAsTransformRules = resp2 as TransformRules;
            nextSelector = "*";
            Object.assign(nextTransform, respAsTransformRules);
          } else {
            const respAsNextStep = resp2 as NextStep;
            inherit = inherit || !!respAsNextStep.MergeTransforms;
            if (respAsNextStep.Select !== undefined) {
              nextSelector =
                (firstSelector ? "" : ",") + respAsNextStep.Select;
              firstSelector = false;
            }

            const newTransform = respAsNextStep.Transform;
            if (newTransform === undefined) {
              Object.assign(nextTransform, context.Transform);
            } else {
              Object.assign(nextTransform, newTransform);
            }
            if (respAsNextStep.SkipSibs) matchNextSib = false;
            if (!matchNextSib && respAsNextStep.NextMatch) {
              nextMatch.push(respAsNextStep.NextMatch);
            }
          }

          break;
        case "boolean":
          if(resp2 === false) (<any>target)[deleteMe] = true;
          break;
      }

    }
  }
  if (matchNextSib) {
    let transform = context.Transform;
    const nextSib = target.nextElementSibling;
    if (nextSib !== null) {
      context.leaf = nextSib as HTMLElement;
      process(context, idx + 1, level, options);
    }
    context.Transform = transform;
    if (nextMatch.length > 0) {
      const match = nextMatch.join(",");
      let nextSib = target.nextElementSibling;
      while (nextSib !== null) {
        if (nextSib.matches(match)) {
          context.leaf = nextSib as HTMLElement;
          process(context, idx + 1, level, options);
          break;
        }
        nextSib = nextSib.nextElementSibling;
      }
    }
  }

  if (nextSelector.length > 0) {
    let transform = context.Transform;

    const nextChild = target.querySelector(nextSelector);
    if (inherit) {
      Object.assign(nextTransform, context.Transform);
    }
    if (nextChild !== null) {
      context.leaf = nextChild as HTMLElement;
      context.Transform = nextTransform;
      process(context, 0, level + 1, options);
      context.Transform = transform;
    }
  }
  if((<any>target)[deleteMe]) target.remove();
}
