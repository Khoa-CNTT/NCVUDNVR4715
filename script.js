let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Thêm sản phẩm vào giỏ hàng
function addToCart(name, price) {
  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const existingItem = cart.find(item => item.name === name);

  if (existingItem) {
    // Nếu sản phẩm đã có trong giỏ hàng, tăng số lượng lên 1
    existingItem.quantity += 1;
  } else {
    // Nếu sản phẩm chưa có, thêm sản phẩm mới vào giỏ hàng
    cart.push({ name, price, quantity: 1 });
  }

  // Lưu giỏ hàng vào localStorage và cập nhật giỏ hàng
  localStorage.setItem('cart', JSON.stringify(cart));

  // Hiển thị thông báo modal và tự động tắt sau 1 giây
  showModal();
  setTimeout(closeModal, 1000);  // Tắt modal sau 1 giây

  updateCart(); // Cập nhật lại giỏ hàng hiển thị
}

// Cập nhật giỏ hàng khi tải trang
function updateCart() {
  const list = document.getElementById("cart-list");
  const productTotalEl = document.getElementById("product-total");
  const shippingPriceElement = document.getElementById('shipping-price');
  const finalTotalElement = document.getElementById('final-total');
  list.innerHTML = ''; // Làm sạch giỏ hàng cũ

  let productTotal = 0;
  cart.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add('cart-item');
    li.innerHTML = `${item.name} - ${item.price.toLocaleString()}đ 
      x ${item.quantity}
      <button class="decrease-button" onclick="decreaseQuantity(${index})">-</button>
      <button class="increase-button" onclick="increaseQuantity(${index})">+</button>
      <button class="remove-button" onclick="removeItem(${index})">Xóa</button>`;
    list.appendChild(li);
    productTotal += item.price * item.quantity; // Tính tổng với số lượng sản phẩm
  });

  // Lấy phương thức vận chuyển đã chọn
  const shippingMethod = document.getElementById('shipping-method').value;
  let shippingCost = 30000; // Mặc định là vận chuyển tiêu chuẩn

  if (shippingMethod === 'express') {
    shippingCost = 50000; // Nếu chọn giao nhanh, phí là 50,000đ
  }

  // Cập nhật phí vận chuyển
  shippingPriceElement.textContent = `Phí vận chuyển: ${shippingCost.toLocaleString()}đ`;

  // Tính tổng hóa đơn bao gồm sản phẩm và phí vận chuyển
  const finalTotal = productTotal + shippingCost;

  // Cập nhật phần tổng tiền sản phẩm, phí vận chuyển và tổng hóa đơn
  productTotalEl.textContent = `Tổng tiền sản phẩm: ${productTotal.toLocaleString()}đ`;
  finalTotalElement.textContent = `Tổng hóa đơn: ${finalTotal.toLocaleString()}đ`;

  // Lưu giỏ hàng vào localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Cập nhật giỏ hàng khi chọn phương thức vận chuyển
document.getElementById('shipping-method').addEventListener('change', function() {
  updateCart(); // Cập nhật lại giỏ hàng khi phương thức vận chuyển thay đổi
});

// Chức năng xóa sản phẩm khỏi giỏ hàng
function removeItem(index) {
  cart.splice(index, 1); // Xóa sản phẩm tại vị trí index
  updateCart(); // Cập nhật lại giỏ hàng
}

// Chức năng giảm số lượng sản phẩm trong giỏ hàng
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    // Giảm số lượng nếu sản phẩm còn lại nhiều hơn 1
    cart[index].quantity -= 1;
  } else {
    // Nếu số lượng là 1, xóa sản phẩm khỏi giỏ hàng
    cart.splice(index, 1);
  }

  updateCart(); // Cập nhật lại giỏ hàng
}

// Chức năng tăng số lượng sản phẩm trong giỏ hàng
function increaseQuantity(index) {
  // Tăng số lượng của sản phẩm
  cart[index].quantity += 1;

  updateCart(); // Cập nhật lại giỏ hàng
}

// Hàm xử lý khi gửi đơn hàng
document.getElementById("order-form").addEventListener("submit", async function(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    name: form.name.value,
    phone: form.phone.value,
    order: cart.map(i => `${i.name} x${i.quantity}`).join(', '), // Danh sách các sản phẩm với số lượng
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)  // Tổng tiền
  };

  await fetch("https://sheet.best/api/sheets/YOUR_GOOGLE_SHEET_ID", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  alert("Đơn hàng đã được gửi!");
  localStorage.removeItem('cart'); // Xóa giỏ hàng trong localStorage
  form.reset(); // Reset form
  updateCart(); // Cập nhật lại giỏ hàng
});

// Hiển thị modal khi thêm sản phẩm vào giỏ hàng
function showModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "block";
}

// Đóng modal khi nhấn nút đóng
function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

// Đóng modal khi nhấn ngoài modal
window.onclick = function(event) {
  const modal = document.getElementById("modal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// Cập nhật giỏ hàng khi tải trang
updateCart();
