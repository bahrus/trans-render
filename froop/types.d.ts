import {PropInfo, Action, DefineArgs,} from '../lib/types';

export interface IEventConfig<MCProps = any, MCActions = MCProps, TAction = Action>{
    on: string,
    of: EventTarget,
    doInit?: boolean,
}

export type ActionOnEventConfigs<MCProps = any, MCActions = MCProps, TAction = Action> = Partial<{[key in keyof MCActions]: IEventConfig<MCProps, MCActions, TAction>}>

export interface IPropBag{
    get(key: string): any;
    set(key: string, val: any): void;
}

export interface IResolvable{
    resolved: boolean;
    resolve(): Promise<void>;
}

export interface IAddMixins extends IResolvable{
    ext: {new(): HTMLElement}
}

export interface ICreatePropInfos extends IResolvable{
    propInfos?: {[key: string]: PropInfo}
}

export interface ICreateCustomElement extends IResolvable{

}

export interface IAddProps extends IResolvable{

}

export interface DefineArgsWithServices extends DefineArgs{
    services: {
        addMixins?: {new(args: DefineArgsWithServices): IAddMixins} | IAddMixins,
        createPropInfos?: {new(args: DefineArgsWithServices): ICreatePropInfos} | ICreatePropInfos,
        addProps?: {new(args: DefineArgsWithServices): IAddProps} | IAddProps,
    }
}