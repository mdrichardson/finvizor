"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStock = void 0;
const cheerio_1 = require("cheerio");
const luxon_1 = require("luxon");
const utils_1 = require("./utils");
const getStock = async (ticker = '') => {
    try {
        if (ticker === '') {
            throw new Error('No ticker provided!');
        }
        ticker = ticker.replace(/\./g, '-');
        const page = await (0, utils_1.getStockPage)(ticker);
        if (page === '') {
            throw new Error('Finviz: ticker is not found or service is unavailable.');
        }
        // Select page data
        const $ = (0, cheerio_1.load)(page, null, false), headersTabLinks = $('.content > div.ticker-wrapper > div.fv-container div.quote-links > div:nth-child(1)').find('a.tab-link'), mainTable = $('.content div.screener_snapshot-table-wrapper > table > tbody').find('tr'), insidersTable = $('.content .ticker-wrapper > div.fv-container > table > tbody > tr > td > div > table:nth-child(2) > tbody > tr:nth-child(13) > td > table > tbody').find('tr'), newsTable = $('#news-table > tbody');
        // Parse non tabular data
        let stock = {
            ticker: $('h1.quote-header_ticker-wrapper_ticker').text().replace(/-/g, '.'),
            name: $('div.quote-header > div.quote-header_left > div > h2 > a').text().trim(),
            site: $('div.quote-header > div.quote-header_left > div > h2 > a').attr('href'),
            exchange: $(headersTabLinks)
                .eq(3)
                .text()
                .replace(/[^a-zA-Z]+/g, ''),
            sector: $(headersTabLinks).eq(0).text(),
            industry: $(headersTabLinks).eq(1).text(),
            country: $(headersTabLinks).eq(2).text(),
        };
        // Iterate through main financial table
        mainTable.map((i, line) => {
            const elements = $(line).find('td');
            elements.each((i, td) => {
                //          0    1    2    3
                // line => key:value:key:value etc.
                if (i % 2) {
                    // Set values
                    const key = $(elements[i - 1]).text(), value = $(td).first().text();
                    stock[key] = value;
                }
                else {
                    // Set keys
                    const key = $(td).text();
                    stock[key] = '';
                }
            });
            // 🩼 crutch injection 🩼
            if (stock['Short Float / Ratio']) {
                const sfrVal = stock['Short Float / Ratio'].split(' / ');
                stock['Short Float'] = sfrVal[0];
                stock['Short Ratio'] = sfrVal[1];
                delete stock['Short Float / Ratio'];
            }
        });
        stock = (0, utils_1.fixKeys)(stock);
        stock = (0, utils_1.fixValues)(stock);
        // Create insiderDeals array
        stock.insidersDeals = [];
        // Note: 1 to skip header
        for (let i = 1; i < insidersTable.length; i++) {
            const line = insidersTable[i];
            const elements = $(line).find('td');
            const insObj = {
                insiderTrading: (0, utils_1.capitalizeFirstLetters)($(elements[0]).text().toLowerCase()),
                insiderTradingLink: 'https://finviz.com/' + $(elements[0]).find('a').attr('href'),
                relationship: $(elements[1]).text(),
                date: $(elements[2]).text(),
                transaction: $(elements[3]).text(),
                cost: $(elements[4]).text(),
                shares: $(elements[5]).text(),
                value: $(elements[6]).text(),
                sharesTotal: $(elements[7]).text(),
                secForm4: $(elements[8]).text(),
                secForm4Link: $(elements[8]).find('a').attr('href'),
            };
            stock.insidersDeals.push(insObj);
        }
        const newsItems = newsTable.find('tr');
        stock.news = [];
        let lastDate = '';
        for (const element of newsItems) {
            const elements = $(element).find('td');
            const url = $(elements).find('a').attr('href');
            if (url) {
                const timestampSplit = $(elements[0]).text().trim().split(' ');
                let timeText;
                if (timestampSplit.length != 1) {
                    const today = new Date();
                    const todayTimeText = luxon_1.DateTime.fromJSDate(today).toFormat('LLL-dd-yy');
                    lastDate = timestampSplit.includes('Today') || timestampSplit.includes(todayTimeText)
                        ? luxon_1.DateTime.fromJSDate(today).toFormat('LLL-dd-yy')
                        : luxon_1.DateTime.fromFormat(timestampSplit[0], 'LLL-dd-yy').toFormat('LLL-dd-yy');
                    timeText = timestampSplit[1] ?? timestampSplit[0];
                }
                else {
                    timeText = timestampSplit[0];
                }
                const isAm = timeText.includes('AM');
                timeText = timeText.replace('AM', '').replace('PM', '');
                const dateTimeString = `${lastDate} ${timeText} ${isAm ? 'AM' : 'PM'}`;
                const dt = luxon_1.DateTime.fromFormat(dateTimeString, 'LLL-dd-yy hh:mm a', { zone: 'America/New_York' });
                const utc = dt.toUTC();
                const newsObj = {
                    title: $(elements).find('.tab-link-news').text(),
                    url,
                    source: $('#news-table > tbody > tr:nth-child(2) > td:nth-child(2) > div > div.news-link-right.flex.gap-1.items-center > span').text(),
                    timestamp: utc.toMillis(),
                };
                stock.news.push(newsObj);
            }
        }
        return stock;
    }
    catch (error) {
        throw new Error(error);
    }
};
exports.getStock = getStock;
