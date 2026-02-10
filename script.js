/* -----------------------
   STATE
------------------------ */
let bills = JSON.parse(localStorage.getItem("bills")) || [];
let currentItems = [];
let editIndex = null;

/* -----------------------
   ELEMENT HELPERS
------------------------ */
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

/* -----------------------
   ADD ITEM
------------------------ */
function addItem() {
  const product = productInput().value.trim();
  const qty = Number(qtyInput().value);
  const price = Number(priceInput().value);

  if (!product || qty <= 0 || price < 0) {
    alert("Enter valid product, quantity and price");
    return;
  }

  currentItems.push({ product, qty, price });
  renderItems();
  clearProductInputs();
}

/* -----------------------
   REMOVE ITEM
------------------------ */
function removeItem(index) {
  currentItems.splice(index, 1);
  renderItems();
}

/* -----------------------
   RENDER ITEMS
------------------------ */
function renderItems() {
  itemList().innerHTML = "";

  let total = 0;

  currentItems.forEach((item, index) => {
    total += item.qty * item.price;

    itemList().innerHTML += `
      <li>
        <strong>${item.product}</strong>
        <small>${item.qty} × ₹${item.price}</small>
        <button onclick="removeItem(${index})">✖</button>
      </li>
    `;
  });

  totalEl().innerText = total;
}

/* -----------------------
   SAVE BILL
------------------------ */
function saveBill() {
  const name = nameInput().value.trim();
  const mobile = mobileInput().value.trim();

  if (!name || !mobile || currentItems.length === 0) {
    alert("Complete customer details and add at least one item");
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
    bills.unshift(bill); // newest first
  }

  localStorage.setItem("bills", JSON.stringify(bills));
  resetBill();
  renderBills(bills);
}

/* -----------------------
   EDIT BILL
------------------------ */
function editBill(index) {
  const bill = bills[index];

  nameInput().value = bill.name;
  mobileInput().value = bill.mobile;
  currentItems = [...bill.items];
  editIndex = index;

  renderItems();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* -----------------------
   RENDER BILLS (CARDS)
------------------------ */
function renderBills(list) {
  billList().innerHTML = "";

  list.forEach((bill, index) => {
    const message = buildWhatsAppMessage(bill);
    const waLink =
      `https://wa.me/91${bill.mobile}?text=${encodeURIComponent(message)}`;

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

/* -----------------------
   WHATSAPP MESSAGE
------------------------ */
function buildWhatsAppMessage(bill) {
  const itemsText = bill.items
    .map(i => `${i.product} (${i.qty} × ₹${i.price})`)
    .join("\n");

  return `🧾 *Bill Receipt*

Customer: ${bill.name}
Mobile: ${bill.mobile}

${itemsText}

------------------
Total: ₹${bill.total}
Date: ${bill.date}

Thank you for your purchase 🙏`;
}

/* -----------------------
   SEARCH
------------------------ */
function searchBills() {
  const text = searchInput().value.toLowerCase();

  const filtered = bills.filter(b =>
    b.name.toLowerCase().includes(text) ||
    b.mobile.includes(text)
  );

  renderBills(filtered);
}

/* -----------------------
   RESET
------------------------ */
function resetBill() {
  nameInput().value = "";
  mobileInput().value = "";
  currentItems = [];
  renderItems();
}

/* -----------------------
   CLEAR PRODUCT INPUTS
------------------------ */
function clearProductInputs() {
  productInput().value = "";
  qtyInput().value = "";
  priceInput().value = "";
}

/* -----------------------
   INIT
------------------------ */
renderBills(bills);
