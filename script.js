let bills = JSON.parse(localStorage.getItem("bills")) || [];
let items = [];
let editIndex = null;

const itemList = document.getElementById("itemList");
const totalSpan = document.getElementById("total");
const billTable = document.getElementById("billTable");

// ADD ITEM
function addItem() {
  let product = productInput().value;
  let qty = qtyInput().value;
  let price = priceInput().value;

  if (!product || !qty || !price) return alert("Fill product fields");

  items.push({ product, qty, price });
  renderItems();
  clearItemInputs();
}

// RENDER ITEMS
function renderItems() {
  itemList.innerHTML = "";
  let total = 0;

  items.forEach((i, index) => {
    total += i.qty * i.price;
    itemList.innerHTML += `
      <li>
        ${i.product} ( ${i.qty} × ₹${i.price} )
        <button onclick="removeItem(${index})">❌</button>
      </li>
    `;
  });

  totalSpan.innerText = total;
}

// REMOVE ITEM
function removeItem(i) {
  items.splice(i, 1);
  renderItems();
}

// SAVE BILL
function saveBill() {
  let name = nameInput().value;
  let mobile = mobileInput().value;

  if (!name || !mobile || items.length === 0)
    return alert("Complete bill first");

  let bill = {
    name,
    mobile,
    items,
    total: totalSpan.innerText,
    date: new Date().toLocaleString()
  };

  if (editIndex !== null) {
    bills[editIndex] = bill;
    editIndex = null;
  } else {
    bills.push(bill);
  }

  localStorage.setItem("bills", JSON.stringify(bills));
  resetBill();
  renderBills(bills);
}

// SHOW BILLS
function renderBills(list) {
  billTable.innerHTML = "";

  list.forEach((b, i) => {
    let message =
`🧾 Bill Receipt
Customer: ${b.name}
Mobile: ${b.mobile}

${b.items.map(it =>
`${it.product} - ${it.qty} × ₹${it.price}`
).join("\n")}

Total: ₹${b.total}
Date: ${b.date}`;

    let wa = `https://wa.me/91${b.mobile}?text=${encodeURIComponent(message)}`;

    billTable.innerHTML += `
      <tr>
        <td>${b.name}</td>
        <td>${b.mobile}</td>
        <td>₹${b.total}</td>
        <td>${b.date}</td>
        <td><button onclick="editBill(${i})">✏️</button></td>
        <td><a href="${wa}" target="_blank">📤</a></td>
      </tr>
    `;
  });
}

// EDIT BILL
function editBill(i) {
  let b = bills[i];
  editIndex = i;

  nameInput().value = b.name;
  mobileInput().value = b.mobile;
  items = [...b.items];

  renderItems();
}

// SEARCH
function searchBills() {
  let text = searchInput().value.toLowerCase();
  renderBills(
    bills.filter(b =>
      b.name.toLowerCase().includes(text) ||
      b.mobile.includes(text)
    )
  );
}

// RESET
function resetBill() {
  nameInput().value = mobileInput().value = "";
  items = [];
  renderItems();
}

// INPUT HELPERS
const nameInput = () => document.getElementById("name");
const mobileInput = () => document.getElementById("mobile");
const productInput = () => document.getElementById("product");
const qtyInput = () => document.getElementById("qty");
const priceInput = () => document.getElementById("price");
const searchInput = () => document.getElementById("search");

renderBills(bills);
