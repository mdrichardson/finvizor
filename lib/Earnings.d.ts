/** BMO = Before Market Open, AMC = After Market Close */
export declare type MarketTime = 'AMC' | 'BMO' | '';
export interface Earnings {
    date: number;
    marketTime: MarketTime;
}
