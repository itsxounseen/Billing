/* =====================
   STATE
===================== */
let bills = JSON.parse(localStorage.getItem("bills")) || [];
let currentItems = [];
let editIndex = null;

/* =====================
   HELPERS
===================== */
const $ = (id) => document.getElementById(id);

/* =====================
   INIT
===================== */
renderBills(bills);
disableSave();

/* =====================
   ADD ITEM
===================== */
function addItem() {
  const product = $("product").value.trim();
  const qty = Number($("qty").value);
  const price = Number($("price").value);

  if (!product || qty <= 0 || price < 0) {
    alert("Enter valid product details");
    return;
  }

  currentItems.push({ product, qty, price });

  $("product").value = "";
  $("qty").value = "";
  $("price").value = "";

  renderItems();
  enableSave();

  $("itemList").scrollIntoView({ behavior: "smooth" });
}

/* =====================
   REMOVE ITEM
===================== */
function removeItem(index) {
  currentItems.splice(index, 1);
  renderItems();

  if (currentItems.length === 0) {
    disableSave();
  }
}

/* =====================
   RENDER ITEMS
===================== */
function renderItems() {
  const list = $("itemList");
  list.innerHTML = "";
  let total = 0;

  if (currentItems.length === 0) {
    list.innerHTML = "<li style='color:#777'>No items added yet</li>";
  }

  currentItems.forEach((item, index) => {
    total += item.qty * item.price;

    list.innerHTML += `
      <li>
        <strong>${item.product}</strong><br>
        <small>${item.qty} × ₹${item.price}</small>
        <button onclick="removeItem(${index})">✖</button>
      </li>
    `;
  });

  $("total").innerText = total;
}

/* =====================
   SAVE BILL
===================== */
function saveBill() {
  const name = $("name").value.trim();
  const mobile = $("mobile").value.trim();

  if (!name || !mobile || currentItems.length === 0) {
    alert("Complete customer details and add items");
    return;
  }

  const bill = {
    name,
    mobile,
    items: [...currentItems],
    total: Number($("total").innerText),
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

  alert("Bill saved successfully");
}

/* =====================
   EDIT BILL
===================== */
function editBill(index) {
  const bill = bills[index];

  $("name").value = bill.name;
  $("mobile").value = bill.mobile;
  currentItems = [...bill.items];
  editIndex = index;

  renderItems();
  enableSave();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* =====================
   RENDER BILLS
===================== */
function renderBills(list) {
  const container = $("billList");
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = "<p style='color:#777'>No bills yet</p>";
    return;
  }

  list.forEach((bill, index) => {
    const msg = buildWhatsAppMessage(bill);
    const wa =
      `https://wa.me/91${bill.mobile}?text=${encodeURIComponent(msg)}`;

    container.innerHTML += `
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
          <a class="share-btn" href="${wa}" target="_blank">📤 Share</a>
        </div>
      </div>
    `;
  });
}

/* =====================
   WHATSAPP MESSAGE
===================== */
function buildWhatsAppMessage(bill) {
  const items = bill.items
    .map(i => `${i.product} (${i.qty} × ₹${i.price})`)
    .join("\n");

  return `🧾 *Bill Receipt*

Customer: ${bill.name}
Mobile: ${bill.mobile}

${items}

----------------
Total: ₹${bill.total}
Date: ${bill.date}

Thank you 🙏`;
}

/* =====================
   SEARCH
===================== */
function searchBills() {
  const text = $("search").value.toLowerCase();

  renderBills(
    bills.filter(b =>
      b.name.toLowerCase().includes(text) ||
      b.mobile.includes(text)
    )
  );
}

/* =====================
   RESET
===================== */
function resetBill() {
  $("name").value = "";
  $("mobile").value = "";
  currentItems = [];
  editIndex = null;

  renderItems();
  disableSave();
}

/* =====================
   SAVE BUTTON CONTROL
===================== */
function disableSave() {
  $("saveBtn").disabled = true;
}

function enableSave() {
  $("saveBtn").disabled = false;
}
