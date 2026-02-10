const $ = id => document.getElementById(id);

let bills = JSON.parse(localStorage.getItem("bills")) || [];
let items = [];
let editingIndex = null;

$("shopName").value = localStorage.getItem("shopName") || "";

/* ---------- ITEM LOGIC ---------- */

function calculateItemTotal(i) {
  let base = i.qty * i.price;
  let discount = i.discountType === "percent"
    ? base * i.discountValue / 100
    : i.discountValue;
  return Math.max(base - discount, 0);
}

function addItem() {
  const name = $("productName").value.trim();
  const qty = Number($("qty").value);
  const price = Number($("price").value);
  const dVal = Number($("itemDiscount").value) || 0;
  const dType = $("itemDiscountType").value;

  if (!name || qty <= 0 || price < 0) {
    alert("Invalid product details");
    return;
  }

  items.push({ name, qty, price, discountValue: dVal, discountType: dType });
  clearItemInputs();
  renderItems();
  $("saveBtn").disabled = false;
}

function renderItems() {
  $("itemList").innerHTML = "";
  let total = 0;

  if (items.length === 0) {
    $("itemList").innerHTML = "<li>No items added</li>";
    $("totalAmount").innerText = 0;
    updatePaymentPreview();
    return;
  }

  items.forEach((i, idx) => {
    const t = calculateItemTotal(i);
    total += t;

    $("itemList").innerHTML += `
      <li>
        <strong>${i.name}</strong><br>
        ${i.qty} × ₹${i.price},
        Disc: ${i.discountType === "percent" ? i.discountValue + "%" : "₹" + i.discountValue}
        → ₹${t}
        <button onclick="removeItem(${idx})">✖</button>
      </li>
    `;
  });

  $("totalAmount").innerText = Math.round(total);
  updatePaymentPreview();
}

function removeItem(i) {
  items.splice(i, 1);
  renderItems();
  if (items.length === 0) $("saveBtn").disabled = true;
}

function clearItemInputs() {
  $("productName").value = "";
  $("qty").value = "";
  $("price").value = "";
  $("itemDiscount").value = "";
  $("itemDiscountType").value = "amount";
}

/* ---------- PAYMENT PREVIEW ---------- */

function updatePaymentPreview() {
  const total = Number($("totalAmount").innerText);
  let paid = Number($("amountPaid").value) || 0;
  if (paid > total) paid = total;

  const balance = total - paid;
  $("balancePreview").innerText = balance;

  let status = "Unpaid";
  if (paid === total && total > 0) status = "Paid";
  else if (paid > 0) status = "Due";

  $("statusPreview").innerText = status;
}

/* ---------- SAVE BILL ---------- */

function saveBill() {
  const name = $("customerName").value.trim();
  const mobile = $("customerMobile").value.trim();
  if (!name || !mobile || items.length === 0) {
    alert("Complete the bill first");
    return;
  }

  const total = Number($("totalAmount").innerText);
  const paid = Number($("amountPaid").value) || 0;
  const balance = total - paid;

  const bill = {
    shop: $("shopName").value,
    customerName: name,
    mobile,
    items,
    total,
    payments: paid > 0 ? [{ amount: paid, date: new Date().toLocaleString() }] : [],
    balance,
    status: balance === 0 ? "Paid" : paid > 0 ? "Due" : "Unpaid",
    createdAt: new Date().toLocaleString()
  };

  localStorage.setItem("shopName", $("shopName").value);

  if (editingIndex !== null) {
    bills[editingIndex] = bill;
    editingIndex = null;
  } else {
    bills.unshift(bill);
  }

  localStorage.setItem("bills", JSON.stringify(bills));
  resetBill();
  renderBills();
}

/* ---------- WHATSAPP BILL ---------- */

function buildWhatsAppBill(b) {
  let lines = [];
  lines.push("*🧾 BILL RECEIPT*");
  lines.push("");
  lines.push(`🏪 *${b.shop}*`);
  lines.push("────────────────");
  lines.push(`👤 Customer : ${b.customerName}`);
  lines.push(`📞 Mobile   : ${b.mobile}`);
  lines.push("");
  lines.push("*Items*");
  lines.push("────────────────");

  b.items.forEach(i => {
    lines.push(`• ${i.name}`);
    lines.push(`  ${i.qty} × ₹${i.price}`);
    lines.push(`  Item Total : ₹${calculateItemTotal(i)}`);
    lines.push("");
  });

  lines.push("────────────────");
  lines.push(`*TOTAL   : ₹${b.total}*`);

  let paidSum = b.payments.reduce((s,p)=>s+p.amount,0);
  lines.push(`Paid    : ₹${paidSum}`);
  lines.push(`Balance : ₹${b.balance}`);
  lines.push(`Status  : *${b.status}*`);
  lines.push("");
  lines.push(`🕒 ${b.createdAt}`);
  lines.push("");
  lines.push("_Thank you for your business 🙏_");

  return lines.join("\n");
}

/* ---------- RENDER BILLS ---------- */

function renderBills(list = bills) {
  $("billList").innerHTML = "";

  list.forEach((b, i) => {
    const wa = buildWhatsAppBill(b);
    const link = `https://wa.me/91${b.mobile}?text=${encodeURIComponent(wa)}`;

    $("billList").innerHTML += `
      <div class="bill-card">
        <div class="bill-header">
          <span>${b.customerName}</span>
          <span>${b.status}</span>
        </div>
        <div class="bill-meta">
          ₹${b.total} · Balance ₹${b.balance}
        </div>
        <div class="bill-actions">
          <button class="edit-btn" onclick="editBill(${i})">✏️</button>
          <a class="share-btn" href="${link}" target="_blank">📤</a>
          <button class="delete-btn" onclick="deleteBill(${i})">🗑</button>
        </div>
      </div>
    `;
  });
}

/* ---------- EDIT / DELETE ---------- */

function editBill(i) {
  const b = bills[i];
  $("shopName").value = b.shop;
  $("customerName").value = b.customerName;
  $("customerMobile").value = b.mobile;
  items = [...b.items];
  editingIndex = i;
  renderItems();
  $("saveBtn").disabled = false;
}

function deleteBill(i) {
  if (!confirm("Delete this bill?")) return;
  bills.splice(i, 1);
  localStorage.setItem("bills", JSON.stringify(bills));
  renderBills();
}

/* ---------- SEARCH ---------- */

function searchBills() {
  const q = $("search").value.toLowerCase();
  renderBills(
    bills.filter(b =>
      b.customerName.toLowerCase().includes(q) ||
      b.mobile.includes(q)
    )
  );
}

/* ---------- RESET ---------- */

function resetBill() {
  $("customerName").value = "";
  $("customerMobile").value = "";
  $("amountPaid").value = "";
  items = [];
  renderItems();
  $("saveBtn").disabled = true;
}

renderBills();
