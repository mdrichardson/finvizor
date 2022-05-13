import * as finvizor from '../src';

test('Should get stock response from finviz', async () => {
    let stock = await finvizor.stock('AAPL');
    // Assert that response is not null at least
    expect(stock).not.toEqual({});
    // Assert that String data from the response is correct
    expect(stock.ticker).toBe('AAPL');
    // Assert that insider transaction exists
    expect(stock.insidersDeals.length).toBeGreaterThan(0);
});

test('Should get stock with extension (BRK.A) from finviz', async () => {
    let stock = await finvizor.stock('BRK.A');
    // Assert that response is not null at least
    expect(stock).not.toEqual({});

    // Assert that String data from the response is correct
    expect(stock.ticker).toBe('BRK.A');
});

test('Should get error response from finviz', async () => {
    expect(finvizor.stock('Kek lol')).rejects.toThrowError();
});