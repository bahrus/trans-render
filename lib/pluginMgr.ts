import {TransformPluginSettings, TransformPlugins} from './types';
import {camelToLisp} from './camelToLisp.js';
import {def} from './def.js';

export function register({selector, processor}: TransformPluginSettings){
    const cls = class extends HTMLElement{
        static is = camelToLisp(selector!);
        static ready = true;
        static processor = processor;
        static selector = selector;
    }
    def(cls);
}

export async function awaitTransforms(plugins: TransformPlugins): Promise<TransformPlugins> {
    const returnObj: TransformPlugins = {};
    for(const key in plugins){
        
        const plugin = plugins[key];
        const {selector, processor, blockWhileWaiting} = plugin
        if(typeof(processor) === 'function' || selector === undefined){
            plugin.ready = true;
            returnObj[key] = plugin;
            continue;
        }
        const ceName = camelToLisp(selector);
        if(blockWhileWaiting){
            const ce = await customElements.whenDefined(ceName) as any as TransformPluginSettings;
            returnObj[key] = ce;
            continue;
        }else{
            returnObj[key] = plugin;
        }
    }
    return returnObj;
}

export function toTransformMatch(plugins: TransformPlugins): {[key: string]: string}{
    const returnObj: {[key: string]: string} = {};
    for(const key in plugins){
        const {ready, selector} = plugins[key];
        if(!ready || selector === undefined) continue;
        returnObj[selector] = key;
    }
    return returnObj;
}

