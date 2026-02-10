/* =========================
   STATE
========================= */
let bills = JSON.parse(localStorage.getItem("bills")) || [];
let currentItems = [];
let editIndex = null;

/* =========================
   HELPERS
========================= */
const $ = (id) => document.getElementById(id);

const nameInput = () => $("name");
const mobileInput = () => $("mobile");
const productInput = () => $("product");
const qtyInput = () => $("qty");
const priceInput = () => $("price");
const searchInput = () => $("search");
const itemList = () => $("itemList");
const totalEl = () => $("total");
const billList = () => $("billList");
const saveBtn = () => document.querySelector("button[onclick='saveBill()']");

/* =========================
   INIT
========================= */
disableSave();
renderBills(bills);

/* =========================
   ADD ITEM
========================= */
function addItem() {
  const product = productInput().value.trim();
  const qty = Number(qtyInput().value);
  const price = Number(priceInput().value);

  if (!product || qty <= 0 || price < 0) {
    alert("Please enter valid product details");
    return;
  }

  currentItems.push({ product, qty, price });

  clearProductInputs();
  renderItems();
  enableSave();

  // UX: move user forward
  itemList().scrollIntoView({ behavior: "smooth" });
}

/* =========================
   REMOVE ITEM
========================= */
function removeItem(index) {
  currentItems.splice(index, 1);
  renderItems();

  if (currentItems.length === 0) {
    disableSave();
  }
}

/* =========================
   RENDER ITEMS
========================= */
function renderItems() {
  itemList().innerHTML = "";
  let total = 0;

  if (currentItems.length === 0) {
    itemList().innerHTML =
      `<li style="color:#777;">No items added yet</li>`;
  }

  currentItems.forEach((item, index) => {
    total += item.qty * item.price;

    itemList().innerHTML += `
      <li>
        <strong>${item.product}</strong><br>
        <small>${item.qty} × ₹${item.price}</small>
        <button onclick="removeItem(${index})">✖</button>
      </li>
    `;
  });

  totalEl().innerText = total;
}

/* =========================
   SAVE BILL
========================= */
function saveBill() {
  const name = nameInput().value.trim();
  const mobile = mobileInput().value.trim();

  if (!name || !mobile || currentItems.length === 0) {
    alert("Please complete the bill first");
    return;
  }

  const bill = {
    name,
    mobile,
    items: [...currentItems],
    total: Number(totalEl().innerText),
    date: new Date().toLocaleString()
  };

  if (editIndex !== null) {
    bills[editIndex] = bill;
    editIndex = null;
  } else {
    bills.unshift(bill);
  }

  localStorage.setItem("bills", JSON.stringify(bills));

  resetBill();
  renderBills(bills);

  // UX feedback
  alert("Bill saved successfully");
}

/* =========================
   EDIT BILL
========================= */
function editBill(index) {
  const bill = bills[index];

  nameInput().value = bill.name;
  mobileInput().value = bill.mobile;
  currentItems = [...bill.items];
  editIndex = index;

  renderItems();
  enableSave();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =========================
   RENDER BILLS
========================= */
function renderBills(list) {
  billList().innerHTML = "";

  if (list.length === 0) {
    billList().innerHTML =
      `<p style="color:#777;">No bills yet</p>`;
    return;
  }

  list.forEach((bill, index) => {
    const waMessage = buildWhatsAppMessage(bill);
    const waLink =
      `https://wa.me/91${bill.mobile}?text=${encodeURIComponent(waMessage)}`;

    billList().innerHTML += `
      <div class="bill-card">
        <div class="bill-header">
          <span>${bill.name}</span>
          <span>₹${bill.total}</span>
        </div>

        <div class="bill-meta">
          📞 ${bill.mobile}<br>
          🕒 ${bill.date}
        </div>

        <div class="bill-actions">
          <button class="edit-btn" onclick="editBill(${index})">✏️ Edit</button>
          <a class="share-btn" href="${waLink}" target="_blank">📤 Share</a>
        </div>
      </div>
    `;
  });
}

/* =========================
   WHATSAPP MESSAGE
========================= */
function buildWhatsAppMessage(bill) {
  const itemsText = bill.items
    .map(i => `${i.product} (${i.qty} × ₹${i.price})`)
    .join("\n");

  return `🧾 *Bill Receipt*

Customer: ${bill.name}
Mobile: ${bill.mobile}

${itemsText}

--------------------
Total: ₹${bill.total}
Date: ${bill.date}

Thank you for your purchase 🙏`;
}

/* =========================
   SEARCH
========================= */
function searchBills() {
  const text = searchInput().value.toLowerCase();

  const filtered = bills.filter(b =>
    b.name.toLowerCase().includes(text) ||
    b.mobile.includes(text)
  );

  renderBills(filtered);
}

/* =========================
   RESET
========================= */
function resetBill() {
  nameInput().value = "";
  mobileInput().value = "";
  currentItems = [];
  editIndex = null;

  renderItems();
  disableSave();
}

/* =========================
   INPUT HELPERS
========================= */
function clearProductInputs() {
  productInput().value = "";
  qtyInput().value = "";
  priceInput().value = "";
}

function disableSave() {
  if (saveBtn()) saveBtn().disabled = true;
}

function enableSave() {
  if (saveBtn()) saveBtn().disabled = false;
   }
