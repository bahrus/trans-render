import { DefineArgs, LogicOp, PropInfo, HasPropChangeQueue, Action, PropInfoTypes, PropChangeInfo, PropChangeMoment, ListOfLogicalExpressions, TRElementProps, PropChangeMethod, TRElementActions, WCConfig, IActionProcessor } from './types.js';
export { Action, PropInfo, TRElementActions, TRElementProps, WCConfig, IActionProcessor as IHasPostHoc} from './types.js';
import { def } from './def.js';
import {IAddMixins, DefineArgsWithServices} from '../froop/types';
import {am} from '../froop/const.js';
import { ResolvableService } from '../froop/ResolvableService.js';


export class CE extends ResolvableService{
    constructor(public args: DefineArgsWithServices){
        super();
        this.do();
    }

    async do(){
        const {args} = this;
        if(args.services === undefined){
            args.services = {};
            const {services} = args;
            if(args.mixins || args.superclass){
                const {AddMixins} = await import('../froop/AddMixins.js');
                services.addMixins = AddMixins;
            }
            const {CreatePropInfos} = await import('../froop/CreatePropInfos');
            services.createPropInfos  = CreatePropInfos;
              
        }
        const addMixins = (<any>args.services)[am] as IAddMixins | undefined;

        const ext = addMixins?.ext || HTMLElement;

        class newClass extends ext{

        }
    }

    async #evalConfig({args}: this){
        if(args === undefined) return;
        const {config} = args;
        if(typeof config != 'function') return;
        args.config = (await config()).default;
    }



    






}