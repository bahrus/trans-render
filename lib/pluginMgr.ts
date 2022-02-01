import {TransformPluginSettings, TransformPlugins} from './types';
import {camelToLisp} from './camelToLisp.js';

export function register(plugin: TransformPluginSettings){

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
        }
    }
}

export function toTransformMatch(plugins: TransformPlugins): Promise<{[key: string]: string}>{

}

