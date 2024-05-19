import { AttrChangeInfo, MountInit, RootCnfg } from '../../mount-observer/types';
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
    enhPropKey: string,
    hasRootIn: Array<RootCnfg>,
    preBaseDelimiter: delimiter,
    base: string,
    preBranchDelimiter: delimiter,
    branches?: Array<string>,
    //TODO
    watchedBranches?: Array<string>,
    //TODO
    preLeafDelimiter: delimiter,
    //TODO
    leaves?: Partial<{[key in keyof TBranches & string]: stringArray}>,
    //TODO
    hostMatches?: CSSQuery,
    //TODO
    hostInstanceOf?: Array<{new(): HTMLElement}>,
    block?: boolean,
    //TODO
    unblock?: boolean,
    do: {
        mount: {
            import: () => Promise<{new(): IEnhancement}>, //Roundabout ready?
        },
    },
    map?: {[key: AttrCoordinates]: AttrMapPoint<TProps>}
}

export type AttrMapPoint<TProps = any> = keyof TProps & string | AttrMapConfig<TProps>

export interface AttrMapConfig<TProps = any> {
    instanceOf: 'Object',
    mapsTo: '.' | keyof TProps,
}

export type Branchitutde = number;
export type Leafitude = number;
export type AttrCoordinates = `${Branchitutde}.${Leafitude}`



export type MountBeHive<TBranches = any> = Partial<EnhancementMountCnfg<TBranches>>


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