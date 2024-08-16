import {StringWithAutocompleteOptions, ZeroOrMore} from '../../../ts-refs/trans-render/types';

export type ValueProp = StringWithAutocompleteOptions<
    | 'value' 
    | 'checked' 
    | 'href'
    | 'ariaValueNow'
    | 'ariaChecked'
>

export type DisplayProp = StringWithAutocompleteOptions<
    | 'textContent'
    | 'ariaValueText'
>;

export type ValueType = StringWithAutocompleteOptions<
    | 'Boolean'
    | 'String'
    | 'Number'
    | 'NumericRange'
>;

export interface SetOptions{
    valueProp?: ValueProp;
    valueType?: ValueType
    displayProps: ZeroOrMore<DisplayProp>;
}

export interface Setter<TProp = any> {
    setValue(nv: TProp);
}