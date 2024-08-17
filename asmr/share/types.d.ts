import {StringWithAutocompleteOptions, ZeroOrMore} from '../../ts-refs/trans-render/types';

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

export type TrueText = StringWithAutocompleteOptions<
    | 'Yes'
    | 'On'
>;

export type FalseText = StringWithAutocompleteOptions<
    | 'No'
    | 'Off'
>;

export type TrueValue = StringWithAutocompleteOptions<
    | 'https://schema.org/True'
    
>;

export type FalseValue = StringWithAutocompleteOptions<
    | 'https://schema.org/False'
>;

export interface SetOptions<TProp = any>{
    valueProp?: ValueProp;
    valueType?: ValueType
    displayProps: ZeroOrMore<DisplayProp>;
    valToDisplay?: (v: TProp) => string;
    trueText?: TrueText;
    falseText?: FalseText;
    trueValue?: TrueValue;
    falseValue?: FalseValue;
}

export interface Setter<TProp = any> {
    setValue(nv: TProp);
}