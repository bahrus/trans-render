import {
  NextStep,
  TransformRules,
  RenderContext,
  RenderOptions,
  TransformFn
} from "./init.d.js";


export function init(
  template: HTMLElement,
  ctx: RenderContext,
  target: HTMLElement | DocumentFragment,
  options?: RenderOptions
): RenderContext {
  
  const clonedTemplate = template.localName === 'template' ? (template as HTMLTemplateElement).content.cloneNode(true) as DocumentFragment : template;
  ctx.template = clonedTemplate;
  if (ctx.Transform) {
    const firstChild = clonedTemplate.firstElementChild;
    if (firstChild !== null) {
      ctx.leaf = firstChild;
      process(ctx, 0, 0, options);
    }
  }
  let verb = 'appendChild';
  if(options){
    if(options.prepend) verb = 'prepend';
    const callback = options.initializedCallback;
    if(callback !== undefined) callback(ctx, target, options);
  }
  (<any>target)[verb](ctx.template);
  return ctx;
}

function isTR(obj: object){
  const firstCharOfFirstProp = Object.keys(obj)[0];
  return 'SNTM'.indexOf(firstCharOfFirstProp) === -1;
}
export function process(
  context: RenderContext,
  idx: number,
  level: number,
  options?: RenderOptions
) {
  const target = context.leaf!;
  if (target.matches === undefined) return;
  const transform = context.Transform;

  let nextTransform: TransformRules = {};
  let nextSelector = '';
  let firstSelector = true;
  let matchNextSib: boolean = true;
  let inherit = false;
  let nextMatch = [];
  for (const selector in transform) {
    if (target.matches(selector)) {
      const transformTemplateVal = transform[selector];
      switch (typeof transformTemplateVal) {
        case "object":
          nextSelector = '*';
          Object.assign(nextTransform, transformTemplateVal);
          break;
        case "function":
          const transformTemplate = transformTemplateVal as TransformFn;
          const resp = transformTemplate({
            target: target,
            ctx: context,
            idx: idx,
            level: level
          });

          if (resp !== undefined) {
            switch (typeof resp) {
              case "string":
                target.textContent = resp;
                break;
              case "object":
                if (isTR(resp)) {
                  const respAsTransformRules = resp as TransformRules;
                  nextSelector = '*';
                  Object.assign(nextTransform, respAsTransformRules);
                } else {
                  const respAsNextStep = resp as NextStep;
                  inherit = inherit || !!resp.MergeTransforms;
                  nextSelector = (firstSelector ? '' : ',') + respAsNextStep.Select;
                  firstSelector = false;
                  const newTransform = respAsNextStep.Transform;
                  if (newTransform === undefined) {
                    Object.assign(nextTransform, context.Transform);
                  } else {
                    Object.assign(nextTransform, newTransform);
                  }
                  if (respAsNextStep.SkipSibs) matchNextSib = false;
                  if (!matchNextSib && resp.NextMatch) {
                    nextMatch.push(resp.NextMatch);
                  }
                }

                break;
            }
          }
          break;
      }
    }
  }
  if (matchNextSib) {
    let transform = context.Transform;
    const nextSib = target.nextElementSibling;
    if (nextSib !== null) {
      context.leaf = nextSib;
      process(context, idx + 1, level, options);
    }
    context.Transform = transform;
  } else if (nextMatch.length > 0) {
    const match = nextMatch.join(",");
    let nextSib = target.nextElementSibling;
    while (nextSib !== null) {
      if (nextSib.matches(match)) {
        context.leaf = nextSib;
        process(context, idx + 1, level, options);
        break;
      }
      nextSib = nextSib.nextElementSibling;
    }
  }

  if (nextSelector.length > 0) {
    let transform = context.Transform;

    const nextChild = target.querySelector(nextSelector);
    if(inherit){
      Object.assign(nextTransform, context.Transform);
    }
    if (nextChild !== null) {
      context.leaf = nextChild;
      context.Transform = nextTransform;
      process(context, 0, level + 1, options);
      context.Transform = transform;
    }
    
  }
}
