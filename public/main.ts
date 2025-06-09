// main.ts

// Get references to the input and select elements, with proper type assertions
const amountInput    = document.getElementById('amount') as HTMLInputElement;
const firstSelect    = document.getElementById('firstCurrencyOption') as HTMLSelectElement;
const secondSelect   = document.getElementById('secondCurrencyOption') as HTMLSelectElement;
const resultInput    = document.getElementById('result') as HTMLInputElement;

// Define currencies to prioritize at the top of the dropdowns
const preferred = ['EUR', 'USD', 'TRY'];

/**
 * Fetch the list of available currency symbols from the server API.
 * @returns An array of currency codes, or an empty array on error.
 */
async function fetchSymbols(): Promise<string[]> {
  try {
    const res = await fetch('/api/symbols');
    const { symbols } = await res.json();
    return symbols;
  } catch {
    // Return an empty array if the API call fails
    return [];
  }
}

/**
 * Populate a <select> element with given currency codes.
 * @param selectEl The dropdown element to fill.
 * @param list      Array of currency code strings.
 * @param def       The code to mark as the default selected option.
 */
function populate(
  selectEl: HTMLSelectElement,
  list: string[],
  def: string
) {
  selectEl.innerHTML = list
    .map(code => `<option${code === def ? ' selected' : ''}>${code}</option>`)
    .join('');
}

/**
 * Initialize the application by fetching symbols and filling both dropdowns.
 */
async function init() {
  const syms   = await fetchSymbols();
  const others = syms.filter(c => !preferred.includes(c));
  // Prepend preferred currencies, then the rest, and set defaults
  populate(firstSelect,  [...preferred, ...others], 'USD');
  populate(secondSelect, [...preferred, ...others], 'TRY');
}

/**
 * Perform the currency conversion by calling the server endpoint
 * and display the result in the read-only input field.
 */
async function convert() {
  const amt = amountInput.value.trim();

  // Validate the amount: must be a positive number
  if (!amt || isNaN(+amt) || +amt <= 0) {
    resultInput.value = '';
    return;
  }

  try {
    // Build query parameters from selected currencies and amount
    const from = firstSelect.value;
    const to   = secondSelect.value;
    const res  = await fetch(`/api/convert?from=${from}&to=${to}&amount=${amt}`);
    const data = await res.json();

    if (data.error) {
      throw new Error('Conversion failed');
    }
    // Display the converted amount, formatted by the server
    resultInput.value = data.result;
  } catch {
    // Show generic error message on failure
    resultInput.value = 'Error';
  }
}

// Wait for the DOM to be fully loaded before starting
document.addEventListener('DOMContentLoaded', async () => {
  await init();
  // Recalculate conversion when amount or currency choices change
  amountInput.addEventListener('input',   convert);
  firstSelect.addEventListener('change',  convert);
  secondSelect.addEventListener('change', convert);
});
