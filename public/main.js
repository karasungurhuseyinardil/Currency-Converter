"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// main.ts
// Get references to the input and select elements, with proper type assertions
const amountInput = document.getElementById('amount');
const firstSelect = document.getElementById('firstCurrencyOption');
const secondSelect = document.getElementById('secondCurrencyOption');
const resultInput = document.getElementById('result');
// Define currencies to prioritize at the top of the dropdowns
const preferred = ['EUR', 'USD', 'TRY'];
/**
 * Fetch the list of available currency symbols from the server API.
 * @returns An array of currency codes, or an empty array on error.
 */
function fetchSymbols() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const res = yield fetch('/api/symbols');
            const { symbols } = yield res.json();
            return symbols;
        }
        catch (_a) {
            // Return an empty array if the API call fails
            return [];
        }
    });
}
/**
 * Populate a <select> element with given currency codes.
 * @param selectEl The dropdown element to fill.
 * @param list      Array of currency code strings.
 * @param def       The code to mark as the default selected option.
 */
function populate(selectEl, list, def) {
    selectEl.innerHTML = list
        .map(code => `<option${code === def ? ' selected' : ''}>${code}</option>`)
        .join('');
}
/**
 * Initialize the application by fetching symbols and filling both dropdowns.
 */
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        const syms = yield fetchSymbols();
        const others = syms.filter(c => !preferred.includes(c));
        // Prepend preferred currencies, then the rest, and set defaults
        populate(firstSelect, [...preferred, ...others], 'USD');
        populate(secondSelect, [...preferred, ...others], 'TRY');
    });
}
/**
 * Perform the currency conversion by calling the server endpoint
 * and display the result in the read-only input field.
 */
function convert() {
    return __awaiter(this, void 0, void 0, function* () {
        const amt = amountInput.value.trim();
        // Validate the amount: must be a positive number
        if (!amt || isNaN(+amt) || +amt <= 0) {
            resultInput.value = '';
            return;
        }
        try {
            // Build query parameters from selected currencies and amount
            const from = firstSelect.value;
            const to = secondSelect.value;
            const res = yield fetch(`/api/convert?from=${from}&to=${to}&amount=${amt}`);
            const data = yield res.json();
            if (data.error) {
                throw new Error('Conversion failed');
            }
            // Display the converted amount, formatted by the server
            resultInput.value = data.result;
        }
        catch (_a) {
            // Show generic error message on failure
            resultInput.value = 'Error';
        }
    });
}
// Wait for the DOM to be fully loaded before starting
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    yield init();
    // Recalculate conversion when amount or currency choices change
    amountInput.addEventListener('input', convert);
    firstSelect.addEventListener('change', convert);
    secondSelect.addEventListener('change', convert);
}));
