import {ITransformer, UnitOfWork} from '../types.js';
import {Mount} from '../Mount.js';
export interface LocalizerProps {

}
export interface LocalizerMethods{
    localize(model: any, transformer: ITransformer<any, any>, uow: UnitOfWork<any, any>, matchingElement: Element): string | Partial<HTMLDataElement> | Partial<HTMLTimeElement> | undefined;
}

export interface Localizer extends HTMLElement, LocalizerProps, LocalizerMethods {}

export type LocalizerType = {new(): Localizer & Mount }