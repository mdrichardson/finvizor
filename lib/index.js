"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stock = void 0;
/**
 * Finviz.com stock data
 * ! Unofficial API
 */
const quote_1 = require("./quote");
exports.stock = quote_1.getStock;
exports.default = exports.stock;
