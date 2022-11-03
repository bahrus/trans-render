import {PropInfo, Action, DefineArgs,} from '../lib/types';

export interface IEventConfig<MCProps = any, MCActions = MCProps, TAction = Action>{
    on: string,
    of: EventTarget,
    doInit?: boolean,
}

export type ActionOnEventConfigs<MCProps = any, MCActions = MCProps, TAction = Action> = Partial<{[key in keyof MCActions]: IEventConfig<MCProps, MCActions, TAction>}>

export interface IPropBag extends EventTarget{
    get(key: string): any;
    set(key: string, val: any): void;
    /**
     * Delta Keys
     */
    dk: Set<string>;
}

export interface IResolvable extends EventTarget{
    resolved: boolean;
    resolve(): Promise<void>;
}

export interface IAddMixins extends IResolvable{
    ext: {new(): HTMLElement}
}

export interface ICreatePropInfos extends IResolvable{
    propInfos: {[key: string]: PropInfo},
    allPropNames: string[],
    getAttrNames(ext: any): Promise<string[]>,
    getPropsFromAction(action: string | Action): Set<string>,
    nonDryProps: Set<string>,
}

export interface ICreateCustomElement extends IResolvable{
    custElClass: {new(): HTMLElement};
}

export interface IAddProps extends IResolvable{

}

export interface IConnectActions extends IResolvable{

}

export interface IAttrChgCB{
    instance: HTMLElement,
    name: string,
    oldVal: string,
    newVal: string,
}

export interface IConnectedCB{
    instance: HTMLElement,
}

export interface IPropChg{
    key: string,
    oldVal: any,
    newVal: any,
    
}

export interface IDisconnectedCB {
    instance: HTMLElement
}

export interface INewPropBag {
    instance: HTMLElement,
    propBag: IPropBag,
}

export interface DefineArgsWithServices<TProps = any, TActions = TProps> extends DefineArgs<TProps, TActions>{
    main?: ICreateCustomElement,
    serviceClasses?: {
        addMixins?: {new(args: DefineArgsWithServices): IAddMixins},
        createPropInfos?: {new(args: DefineArgsWithServices): ICreatePropInfos},
        addProps?: {new(args: DefineArgsWithServices): IAddProps},
        connectActions?: {new(args: DefineArgsWithServices): IConnectActions},
    };
    services?: {
        addMixins?: IAddMixins,
        createPropInfos: ICreatePropInfos,
        addProps: IAddProps,
        createCustomEl: ICreateCustomElement,
        connectActions?: IConnectActions,
    }
}