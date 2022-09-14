import {TransformPacket, RenderContext} from '../types';
import {TemplMgmtBaseMixin} from './TemplMgmt.js';
import {DTR} from '../DTR.js';
export async function MainTransforms(
        self:  any, 
        {hydratingTransform, transform, transformPlugins, DTRCtor}: TransformPacket,
        fragment: DocumentFragment
    ){
        if(hydratingTransform !== undefined){
            const ctx: RenderContext = {
                host: self,
                match: hydratingTransform,
                plugins: transformPlugins,
            }
            const ctor = DTRCtor === undefined ? DTR : DTRCtor;
            const dtr = new ctor(ctx);
            await dtr.transform(fragment);
        }
        if(transform !== undefined){
            const transforms = Array.isArray(transform) ? transform : [transform];
            for(const t of transforms){
                const ctx: RenderContext = {
                    host: self,
                    match: t,
                    plugins: transformPlugins,
                }
                const ctor = DTRCtor === undefined ? DTR : DTRCtor;
                const dtr = new ctor(ctx);
                if(!self.hasAttribute('defer-rendering')){
                    await dtr.transform(fragment);
                }
                await dtr.subscribe();
            }
        }
    }
