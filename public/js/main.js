/**
 * dailybill - Receipt Generator
 * Manages expense tracking and receipt generation
 */

// Global DOM controls
const txtExpenseAmount = document.querySelector("#txtExpenseAmount");
const txtExpense = document.querySelector("#txtExpense");

// Default values for receipt
const defaultValues = {
    lblOrderFor: "JOHN DOE",
    lblOrderNo: generateOrderNo(),
    lblOrderDate: formatToFullDate(new Date()),
    lblDestination: "Pet Express",
    lblDepartureDate: "2023-10-01",
    lblReturnDate: "2023-10-15",
};

// Sample expenses data
var expenses = [
    { name: "DOG FOOD", amount: 33 },
    { name: "CAT LITTER", amount: 15 },
    { name: "PET TOYS", amount: 12 },
    { name: "GROOMING SUPPLIES", amount: 25 },
    { name: "PET TREATS", amount: 8 },
];

// #region Event Handlers

/**
 * Initialize the application
 */
const onLoad = () => {
    loadReceiptDefaultValues(defaultValues);
    loadReceiptExpenses(expenses);
    expenses = [];
};

/**
 * Handle form input changes and update receipt
 * Called from HTML oninput events
 */
const onFormInput = (event) => {
    let value = (event.currentTarget.value || "").trim();
    const target = event.currentTarget.dataset.target;
    const target2 = event.currentTarget.dataset.target2;
    const dataTarget = document.querySelector(target);
    const dataTarget2 = document.querySelector(target2);

    if (value === "")
        value = target.startsWith("#")
            ? defaultValues[target.replace("#", "")]
            : "";

    if (dataTarget) dataTarget.textContent = value;
    if (dataTarget2) dataTarget2.textContent = value;
};

/**
 * Add new expense to the list
 * Called from HTML onclick event
 */
const onBtnAddExpenseClick = () => {
    const expense = txtExpense.value.trim().toUpperCase();
    let expenseAmount = parseFloat(txtExpenseAmount.value.trim());

    if (expense === "") {
        alert("Please enter an expense.");
        return;
    }

    // Allow $0 inputs 
    if (isNaN(expenseAmount) || expenseAmount < 0) {
        expenseAmount = 0;
    }

    createExpense(expense, expenseAmount);

    // Clear input fields
    txtExpense.value = "";
    txtExpenseAmount.value = "";
};

/**
 * Delete expense from the list
 * Called from dynamically generated HTML
 */
const onBtnDeleteExpense = (id) => {
    expenses.splice(id, 1);
    loadExpenses(expenses);
    loadReceiptExpenses(expenses);
};

/**
 * Download receipt as PNG image
 * Called from HTML onclick event
 */
const onBtnDownloadReceiptClick = () => {
    console.log("Downloading receipt...");

    const receiptSection = document.querySelector(".receipt");
    if (!receiptSection) {
        alert("Receipt not found");
        return;
    }

    // Check if html-to-image library is loaded
    if (typeof htmlToImage === 'undefined') {
        alert("Download library not loaded. Please refresh the page and try again.");
        return;
    }

    htmlToImage.toPng(receiptSection)
        .then(function(dataUrl) {
            const link = document.createElement('a');
            link.download = generateUniqueFilename();
            link.href = dataUrl;
            link.click();
        })
        .catch(function(error) {
            console.error('Error capturing image:', error);
            alert("Failed to download receipt. Please try again.");
        });
};

// #endregion Event Handlers

// #region Core Functions

/**
 * Load default values into receipt labels
 */
function loadReceiptDefaultValues(values) {
    for (const [id, value] of Object.entries(values)) {
        const el = document.querySelector(`#${id}`);
        if (el) el.textContent = value;
    }
}

/**
 * Create and add new expense to the list
 */
function createExpense(name, amount) {
    expenses.push({ name, amount });
    loadExpenses(expenses);
    loadReceiptExpenses(expenses);
}

/**
 * Render expenses in the form section
 */
function loadExpenses(expenses) {
    const container = document.querySelector("#lExpenses");
    if (!container) return;

    const html = expenses.map((expense, index) => {
        return `<div class="flex items-center gap-2 mt-2">
          <input class="flex-grow border rounded px-3 py-2" type="text" disabled value="${expense.name}">
          <input class="w-20 border rounded px-3 py-2 text-center" type="text" disabled value="${formatToUSD(expense.amount)}">
          <button id="btnDeleteExpense_${index}" class="p-2 bg-primary text-white rounded hover:bg-primary-dark transition inline-flex items-center" onclick="onBtnDeleteExpense(${index})">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
            </svg>
          </button>
        </div>`;
    }).join("");

    container.innerHTML = html;
}

/**
 * Render expenses in the receipt section
 */
function loadReceiptExpenses(expenses) {
    const container = document.querySelector("#lReceiptExpenses");
    const lblItemCount = document.querySelector("#lblItemCount");
    const lblReceiptTotal = document.querySelector("#lblReceiptTotal");

    if (!container || !lblItemCount || !lblReceiptTotal) return;

    const html = expenses.map(expense => {
        return `
            <div class="flex justify-between">
                <div>${expense.name}</div>
                <div>${formatToUSD(expense.amount)}</div>
            </div>
        `;
    }).join('');

    // Update totals
    lblItemCount.textContent = expenses.length;
    const totalAmount = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    lblReceiptTotal.textContent = formatToUSD(totalAmount);

    // Render expenses
    container.innerHTML = html;
}

// #endregion Core Functions

// #region Utility Functions

/**
 * Format number as USD currency
 */
function formatToUSD(value) {
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    });
}

/**
 * Format date to full readable format
 */
function formatToFullDate(date) {
    return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

/**
 * Generate unique filename for download
 */
function generateUniqueFilename(prefix = "dailybill", extension = "png") {
    const now = new Date();
    const date = now.toLocaleDateString('en-CA').replace(/-/g, '');
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');
    const random = Math.random().toString(36).substring(2, 7);
    return `${prefix}-${date}_${time}_${random}.${extension}`;
}

/**
 * Generate random order number
 */
function generateOrderNo() {
    const orderNo = Math.floor(Math.random() * 10000);
    return `#${orderNo.toString().padStart(4, "0")}`;
}

// #endregion Utility Functions

// Initialize application
onLoad();
