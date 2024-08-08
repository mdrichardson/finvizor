import { Stock } from './Stock';
export interface TempObject {
    [key: string]: any;
}
/**
 * Get html page for chosen quote
 * @param ticker
 * @returns {Promise<string>}
 */
export declare const getStockPage: (ticker: string) => Promise<string>;
/**
 * Capitalize each first letters (for insider names)
 * @param str
 * @returns {string}
 */
export declare const capitalizeFirstLetters: (str: string) => string;
/**
 * Fix keys names
 * @param {TempObject} obj
 * @returns {Stock}
 */
export declare const fixKeys: (obj: TempObject) => Stock;
/**
 * Fix values
 * @param {TempObject} obj
 * @returns {Stock}
 */
export declare const fixValues: (obj: TempObject) => Stock;
