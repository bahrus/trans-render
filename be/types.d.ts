import { AttrChangeInfo, MountInit, RootCnfg } from '../../mount-observer/types';
export type stringArray = string | Array<string>;

export type stringArrayOrTree = Array<string> | [string, Array<string>];
export interface AttrParts {
    root: string,
    base: string,
    branch: string,
    leaf: string,
} 

type CSSQuery = string;

type delimiter = '-' | ':' | '--';

export interface ObservedAttributes<TBranches = any>{
    enhancedElementInstanceOf?: Array<{new(): Element}>,
    enhancedElementMatches?: string,
    enhPropKey: string,
    hasRootIn: Array<RootCnfg>,
    preBaseDelimiter: delimiter,
    base: string,
    preBranchDelimiter: delimiter,
    branches?: Array<string>,
    watchedBranches?: Array<string>,
    preLeafDelimiter: delimiter,
    leaves?: Partial<{[key in keyof TBranches & string]: stringArray}>,
    hostMatches?: CSSQuery,
    hostInstanceOf?: Array<{new(): HTMLElement}>,
    block?: boolean,
    unblock?: boolean,
    do: {
        mount: {
            import: () => Promise<{new(): IEnhancement}>, //Roundabout ready
    
            //mapTo?: (parts: AttrParts) => string,
            //parse: (parts: AttrParts, val: string | null) => any,

        },

        

    } 
}

export type MountBeHive<TBranches = any> = Partial<ObservedAttributes<TBranches>>


export interface EnhancementInfo {
    // enhancement: Enhancement,
    // enh: Enh,
    // fqn: FQN,
    // localName: string,
    initialPropValues?: any,
    initialAttrInfo?: Array<AttrChangeInfo>,
    mountInit?: MountInit,
    //ifWantsToBe: string,

}
export interface IEnhancement<TElement = Element> extends BEAllProps, HTMLElement{
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