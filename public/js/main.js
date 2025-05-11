// Global DOM controls
const txtActivityAmount = document.querySelector("#txtActivityAmount");
const txtActivity = document.querySelector("#txtActivity");

// Defaults
const defaultValues = {
    lblOrderFor: "JOHN DOE",
    lblOrderNo: generateOrderNo(),
    lblOrderDate: formatToFullDate(new Date()),
    lblDestination: "Tokyo, Japan",
    lblDepartureDate: "2023-10-01",
    lblReturnDate: "2023-10-15",
};

var activities = [
    { name: "VISITED ITSUJIMA SHRINE", amount: 33 },
    { name: "WALKED THROUGH NINENZAKA IN KYOTO", amount: 0 },
    { name: "HIKE THE KUMANO KODO TRAIL", amount: 0.4 },
    { name: "TOURED HIMEJI CASTLE", amount: 10 },
    { name: "RELAXED IN AN ONSEN HOT SPRING", amount: 20 },
];

// #region Events

const onLoad = () => {
    // Set default values for labels
    loadReceiptDefaultValues(defaultValues);

    // Generate sample activities for display
    loadReceiptActivities(activities);
    activities = [];
};

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

const onBtnAddActivityClick = (event) => {
    let activity = txtActivity.value.trim().toUpperCase();
    let activityAmount = parseFloat(txtActivityAmount.value.trim());

    if (activity === "" || activityAmount <= 0) {
        alert("Please enter a valid activity and amount.");
        return;
    }

    createActivity(activity, activityAmount);

    // Clear input fields after createing an activity
    txtActivity.value = "";
    txtActivityAmount.value = "";
};

const onBtnDeleteActivity = (id) => {
    activities.splice(id, 1);
    loadActivities(activities)
    loadReceiptActivities(activities);
};

const onBtnDownloadReceiptClick = ()  => {
    console.log("Downloading receipt...");

    const receiptSection = document.querySelector(".receipt");
    if (!receiptSection) return;

    htmlToImage.toPng(receiptSection)
        .then(function(dataUrl) {
            const link = document.createElement('a');
            link.download = generateUniqueFilename();
            link.href = dataUrl;
            link.click();
        })
        .catch(function(error) {
            console.error('Error capturing image:', error);
        });
}

// #endregion Events\

// #region Methods

function loadReceiptDefaultValues(values) {
    for (const [id, value] of Object.entries(values)) {
        const el = document.querySelector(`#${id}`);
        if (el) el.textContent = value;
    }
}

function createActivity(name, amount) {
    // Refresh dom everytime an activity is added
    // This is not the best way to do it, but it works for now
    // NOTE: That's why we have what people call FRAMEWORKS XD

    activities.push({
        name,
        amount
    })

    loadActivities(activities);
    loadReceiptActivities(activities);
}

function loadActivities(activities) {
    const container = document.querySelector("#lActivities");

    const html = activities.map((activity, index) => {
        return `<div class="flex items-center gap-2 mt-2">
          <input class="flex-grow border rounded px-3 py-2" type="text" disabled value="${activity.name}">
          <input class="w-20 border rounded px-3 py-2 text-center" type="text" disabled value="${formatToUSD(activity.amount)}">
          <button id="btnDeleteActivity_${index}" class="p-2 bg-primary text-white rounded hover:bg-primary-dark transition inline-flex items-center" onclick="onBtnDeleteActivity(${index})">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
              <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"/>
            </svg>
          </button>
        </div>`
    }).join("");

    container.innerHTML = html;
}

function loadReceiptActivities(activities) {
    const container = document.querySelector("#lReceiptActivities");

    const html = activities.map(activity => {
        return `
            <div class="flex justify-between">
                <div>${activity.name}</div>
                <div>${formatToUSD(activity.amount)}</div>
            </div>
        `;
    }).join('');

    // Render total count of activities
    const lblItemCount = document.querySelector("#lblItemCount");
    lblItemCount.textContent = activities.length;

    // Render total receipt amount
    let totalAmount = activities.reduce((sum, item) => sum + parseFloat(item.amount), 0);
    const lblReceiptTotal = document.querySelector("#lblReceiptTotal");
    lblReceiptTotal.textContent = formatToUSD(totalAmount);

    // Render receipt activities
    container.innerHTML = html;
}

function formatToUSD(value) {
    return value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
    });
}

function formatToFullDate(date) {
   return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
    })
}

function generateUniqueFilename(prefix = "wanderbill", extension = "png") {
    const now = new Date();

    const date = now.toLocaleDateString('en-CA').replace(/-/g, '');      // e.g. 20250510
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '');     // e.g. 144532
    const random = Math.random().toString(36).substring(2, 7);           // e.g. a1b2c

    return `${prefix}-${date}_${time}_${random}.${extension}`;
}

// Generates random order no || just for fun xD
function generateOrderNo() {
    const orderNo = Math.floor(Math.random() * 10000);
    return `#${orderNo.toString().padStart(4, "0")}`;
}

// #endregion Methods

// Load script
onLoad();
