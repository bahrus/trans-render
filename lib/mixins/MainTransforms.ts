import {TransformPacket, RenderContext} from '../types';
import {TemplMgmtBaseMixin} from './TemplMgmt.js';
import {DTR} from '../DTR.js';
export async function MainTransforms(
        self:  any, 
        {hydratingTransform, transform, DTRCtor, make}: TransformPacket,
        fragment: DocumentFragment
    ){
        if(hydratingTransform !== undefined || make !== undefined){
            const ctx: RenderContext = {
                host: self,
                match: hydratingTransform,
                make
            };
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
                }
                const ctor = DTRCtor === undefined ? DTR : DTRCtor;
                const dtr = new ctor(ctx);
                if(!self.hasAttribute('defer-rendering')){
                    await dtr.transform(fragment);
                }
                await dtr.subscribe(!!self._isPropagating);
                const {Join} = await import('./Join.js');
                const transJoin = new Join(dtr, fragment);
            }
        }
    }
