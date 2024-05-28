import { AttrChangeInfo, MountInit, RootCnfg,  ObservedSourceOfTruthAttribute} from '../../mount-observer/types';
import {IObject$tring} from '../types';
export type stringArray = string | Array<string>;

export type stringArrayOrTree = Array<string> | [string, Array<string>];
// export interface AttrParts {
//     root: string,
//     base: string,
//     branch: string,
//     leaf: string,
// } 

type CSSQuery = string;

type delimiter = '-' | ':' | '--';

export interface EnhancementMountCnfg<TBranches = any, TProps = any>{
    enhancedElementInstanceOf?: Array<{new(): Element}>,
    enhancedElementMatches?: string,
    enhPropKey?: string,
    hasRootIn?: Array<RootCnfg>,
    preBaseDelimiter?: delimiter,
    base?: string,
    preBranchDelimiter?: delimiter,
    branches?: Array<string>,
    //TODO
    watchedBranches?: Array<string>,
    //TODO
    preLeafDelimiter?: delimiter,
    //TODO
    leaves?: Partial<{[key in keyof TBranches & string]: stringArray}>,
    //TODO
    hostMatches?: CSSQuery,
    //TODO
    hostInstanceOf?: Array<{new(): HTMLElement}>,
    block?: boolean,
    //TODO
    unblock?: boolean,
    importEnh?: () => Promise<{new(): IEnhancement}>

    map?: {[key: AttrCoordinates]: AttrMapPoint<TProps>},
    /**
     * Observed Source of Truth Attributes
     */
    osotas? : Array<ObservedSourceOfTruthAttribute>,
}

export type AttrMapPoint<TProps = any> = keyof TProps & string | AttrMapConfig<TProps>


export interface AttrMapConfig<TProps = any> {
    instanceOf?: 'Object' | 'String' | 'Object$tring',
    Object$Stringer: () => Promise<{new(newValue: string): IObject$tring}>
    mapsTo: '.' | keyof TProps,
    valIfFalsy?: any,
    strValMapsTo?: keyof TProps,
    objValMapsTo?: '.' | keyof TProps,
    arrValMapsTo?: keyof TProps,
}

export type Branchitutde = number;
export type Leafitude = number;
export type AttrCoordinates = `${Branchitutde}.${Leafitude}`



export type MountBeHive<TBranches = any> = Partial<EnhancementMountCnfg<TBranches>> & ObservedAttrsOfEnhancee

// export interface ObservedAttrsOfEnhancee {
//     attrIn?: Array<string>
// }

export interface EnhancementInfo {
    initialPropValues?: any,
    initialAttrInfo?: Array<AttrChangeInfo>,
    mountCnfg?: EnhancementMountCnfg,
}

export interface BEAllProps<TElement = Element> {
    resolved: boolean;
    rejected: boolean;
    enhancedElement: TElement;
}

export interface IEnhancement<TElement = Element> extends BEAllProps<TElement>, HTMLElement{
    attach(el: TElement, enhancement: EnhancementInfo): Promise<void>;
    detach(el: TElement): Promise<void>;
    resolved: boolean;
    rejected: boolean;
    readonly enhancedElement: TElement;
    whenResolved(): Promise<boolean>;
    de(src: EventTarget, name: string) : Event,
    attrChgCB(attrChangeInfos: Array<AttrChangeInfo>) : void,
    //parsedFrom: string;
    //autoImport?: boolean | string;
}