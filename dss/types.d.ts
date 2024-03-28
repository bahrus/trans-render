import { Scope } from "../lib/types";

export type Sigils = '$' | '#' | '@' | '/' | '-' | '|' | '%' | '~' | '?';

export interface Specifier {
    primarySigil: Sigils,
    secondarySigil: Sigils,
}