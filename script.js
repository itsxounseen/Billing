const $ = id => document.getElementById(id);

let bills = JSON.parse(localStorage.getItem("bills")) || [];
let items = [];
let editIndex = null;

$("shopName").value = localStorage.getItem("shopName") || "";

function calculateItemTotal(i) {
  let sub = i.qty * i.price;
  let disc = i.dType === "percent" ? (sub * i.dVal / 100) : i.dVal;
  return Math.max(sub - disc, 0);
}

function addItem() {
  const product = $("product").value.trim();
  const qty = Number($("qty").value);
  const price = Number($("price").value);
  const dVal = Number($("itemDiscount").value) || 0;
  const dType = $("itemDiscountType").value;

  if (!product || qty <= 0 || price < 0) return alert("Invalid item");

  items.push({ product, qty, price, dVal, dType });
  clearItemInputs();
  renderItems();
  $("saveBtn").disabled = false;
}

function renderItems() {
  $("itemList").innerHTML = "";
  let total = 0;

  if (items.length === 0) {
    $("itemList").innerHTML = "<li>No items added</li>";
    $("total").innerText = 0;
    return;
  }

  items.forEach((i, idx) => {
    const itemTotal = calculateItemTotal(i);
    total += itemTotal;

    $("itemList").innerHTML += `
      <li>
        <strong>${i.product}</strong><br>
        ${i.qty} × ₹${i.price},
        Disc: ${i.dType === "percent" ? i.dVal + "%" : "₹" + i.dVal}
        <b> → ₹${itemTotal}</b>
        <button onclick="removeItem(${idx})">✖</button>
      </li>
    `;
  });

  $("total").innerText = Math.round(total);
}

function removeItem(i) {
  items.splice(i, 1);
  renderItems();
  if (items.length === 0) $("saveBtn").disabled = true;
}

function saveBill() {
  const name = $("name").value.trim();
  const mobile = $("mobile").value.trim();

  if (!name || !mobile || items.length === 0)
    return alert("Complete the bill");

  localStorage.setItem("shopName", $("shopName").value);

  const bill = {
    shop: $("shopName").value,
    name,
    mobile,
    items,
    total: $("total").innerText,
    paymentStatus: $("paymentStatus").value,
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
  renderBills();
}

function buildPremiumWhatsAppBill(b) {
  let lines = [];
  lines.push("*🧾 BILL RECEIPT*");
  lines.push("");
  lines.push(`🏪 *${b.shop}*`);
  lines.push("────────────────");
  lines.push(`👤 Customer : ${b.name}`);
  lines.push(`📞 Mobile   : ${b.mobile}`);
  lines.push("");
  lines.push("*Items*");
  lines.push("────────────────");

  b.items.forEach(i => {
    lines.push(`• ${i.product}`);
    lines.push(`  ${i.qty} × ₹${i.price}`);
    lines.push(`  Item Total : ₹${calculateItemTotal(i)}`);
    lines.push("");
  });

  lines.push("────────────────");
  lines.push(`*TOTAL : ₹${b.total}*`);
  lines.push(`Status : *${b.paymentStatus}*`);
  lines.push("");
  lines.push(`🕒 ${b.date}`);
  lines.push("");
  lines.push("_Thank you for your business 🙏_");

  return lines.join("\n");
}

function renderBills(list = bills) {
  $("billList").innerHTML = "";

  list.forEach((b, i) => {
    const waText = buildPremiumWhatsAppBill(b);
    const waLink = `https://wa.me/91${b.mobile}?text=${encodeURIComponent(waText)}`;

    $("billList").innerHTML += `
      <div class="bill-card">
        <div class="bill-header">
          <span>${b.name}</span>
          <span class="status ${b.paymentStatus}">
            ${b.paymentStatus}
          </span>
        </div>
        <div class="bill-meta">₹${b.total} · ${b.date}</div>
        <div class="bill-actions">
          <button class="edit-btn" onclick="editBill(${i})">✏️</button>
          <a class="share-btn" target="_blank" href="${waLink}">📤</a>
          <button class="delete-btn" onclick="deleteBill(${i})">🗑</button>
        </div>
      </div>
    `;
  });
}

function editBill(i) {
  const b = bills[i];
  $("shopName").value = b.shop;
  $("name").value = b.name;
  $("mobile").value = b.mobile;
  $("paymentStatus").value = b.paymentStatus;
  items = [...b.items];
  editIndex = i;
  renderItems();
  $("saveBtn").disabled = false;
}

function deleteBill(i) {
  if (!confirm("Delete this bill?")) return;
  bills.splice(i, 1);
  localStorage.setItem("bills", JSON.stringify(bills));
  renderBills();
}

function searchBills() {
  const q = $("search").value.toLowerCase();
  renderBills(
    bills.filter(b =>
      b.name.toLowerCase().includes(q) ||
      b.mobile.includes(q)
    )
  );
}

function clearItemInputs() {
  $("product").value = "";
  $("qty").value = "";
  $("price").value = "";
  $("itemDiscount").value = "";
  $("itemDiscountType").value = "amount";
}

function resetBill() {
  $("name").value = "";
  $("mobile").value = "";
  $("paymentStatus").value = "Paid";
  items = [];
  renderItems();
  $("saveBtn").disabled = true;
}

renderBills();
