import { MountContext, PipelineStage } from 'mount-observer/types';
import { MountOrchestrator, Transformer, arr } from '../Transform.js';
import { onMountStatusChange, EngagementCtx, UnitOfWork, Engagement } from '../types.js';

export async function Engage<TProps, TMethods = TProps>(
    transformer: Transformer<TProps, TMethods>,
    matchingElement: Element,
    type: onMountStatusChange,
    uow: UnitOfWork<TProps, TMethods>, mountContext: MountContext, stage: PipelineStage | undefined) {
    const { e } = uow;
    const methodArg: EngagementCtx<TMethods> = {
        mountContext,
        stage,
        type
    };
    const model = transformer.model as any;
    const transpiledEngagements: Array<Engagement<TMethods>> =
        typeof e === 'string' ? [{
            do: e
        }] : arr(e!);
    for (const enhance of transpiledEngagements) {
        const { do: d, with: w, undo, forget, be } = enhance;
        let met: (keyof TMethods & string) | undefined;
        switch (type) {
            case 'onMount': {
                met = d;
                break;
            }
            case 'onDisconnect': {
                met = forget;
                break;
            }
            case 'onDismount': {
                met = undo;
            }
        }
        if (met !== undefined) {
            model[met](model, matchingElement, {
                ...methodArg,
                be,
                with: w
            });
        }


    }


}