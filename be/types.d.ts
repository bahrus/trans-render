import { AttrChangeInfo, MountInit, RootCnfg,  ObservedSourceOfTruthAttribute} from '../../mount-observer/types';
import { RegExpExt } from '../lib/prs/types';
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

/**
 * Abbrev. for EnhancementMountConfig
 */
export type EMC<TBranches = any, TProps = any> = EnhancementMountConfig<TBranches, TProps>

export interface AttrCacheConfig {
    enable: 'always' | 'instantiating',
    clone?: boolean
}

export interface EnhancementMountConfig<TBranches = any, TProps = any>{
    id?: string;
    enhancedElementInstanceOf?: Array<{new(): Element}>,
    enhancedElementMatches?: string,
    enhPropKey: string,
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
     * Observed Source of Truth Attributes [TODO, need better name]
     */
    osotas? : Array<ObservedSourceOfTruthAttribute>,

    cacheConfig?: AttrCacheConfig,
}

export type AttrMapPoint<TProps = any> = keyof TProps & string | AttrMapConfig<TProps>


export interface AttrMapConfig<TProps = any, TMethods = TProps> {
    instanceOf?: 'Object' | 'String' | 'Object$tring' | 'Object$entences' | 'DSSArray' | 'Boolean',
    mapsTo?: '.' | keyof TProps,
    valIfFalsy?: any,
    strValMapsTo?: keyof TProps,
    objValMapsTo?: '.' | keyof TProps,
    arrValMapsTo?: keyof TProps,
    strArrMapsTo?: keyof TProps,
    regExpExts?: Partial<{[key in keyof TProps]: RegExpExt<any>[]}>;
    parsedRegExps?: boolean;
    /** used for preventing xss injections */
    blockingRules?: Partial<{[key in keyof TProps]: string | RegExp}>;
}

export type Branchitude = number;
export type Leafitude = number;
export type AttrCoordinates = `${Branchitude}.${Leafitude}`;



export type MountBeHive<TBranches = any> = Partial<EMC<TBranches>>;

export interface EnhancementInfo {
    initialPropValues?: any,
    initialAttrInfo?: Array<AttrChangeInfo>,
    mountCnfg?: EMC,
}

export interface BEAllProps<TElement = Element> {
    resolved: boolean;
    rejected: boolean;
    enhancedElement: TElement;
}

export interface IEnhancement<TElement = Element> extends BEAllProps<TElement>{
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