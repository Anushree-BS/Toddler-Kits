/* main.js
   Single JS for cart + payments + thankyou
   Uses localStorage key 'tk_cart'
*/

(function () {
  const STORAGE_KEY = 'tk_cart';

  // load cart
  let cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

  // utils
  function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    updateCartCount();
  }

  function updateCartCount() {
    const els = document.querySelectorAll('#cart-count');
    const totalCount = cart.reduce((s, it) => s + (it.quantity || 0), 0);
    els.forEach(el => el.textContent = totalCount);
  }

  // expose addToCart globally (used in HTML)
  window.addToCart = function (name, price, img) {
    if (!name) return;
    const existing = cart.find(it => it.name === name);
    if (existing) {
      existing.quantity = (existing.quantity || 1) + 1;
    } else {
      cart.push({ name: name, price: Number(price) || 0, img: img || '', quantity: 1 });
    }
    saveCart();

    // small toast
    try {
      const toast = document.createElement('div');
      toast.className = 'mini-toast';
      toast.textContent = `${name} added to cart`;
      document.body.appendChild(toast);
      setTimeout(() => toast.classList.add('visible'), 20);
      setTimeout(() => { toast.classList.remove('visible'); }, 1400);
      setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 1700);
    } catch (e) {
      alert(`${name} added to cart`);
    }
  };

  // clear cart
  window.clearCart = function () {
    if (!confirm('Clear all items from cart?')) return;
    cart = [];
    saveCart();
    // reload UI if on cart page
    if (document.getElementById('cart-items')) renderCartPage();
  };

  // remove one item (by index)
  window.removeFromCart = function (index) {
    if (typeof index !== 'number') return;
    cart.splice(index, 1);
    saveCart();
    if (document.getElementById('cart-items')) renderCartPage();
  };

  // render cart page
  function renderCartPage() {
    const listEl = document.getElementById('cart-items');
    const summaryEl = document.getElementById('cart-summary-items');
    const totalEl = document.getElementById('cart-total');

    if (!listEl || !totalEl) return;

    listEl.innerHTML = '';
    if (summaryEl) summaryEl.innerHTML = '';

    if (cart.length === 0) {
      listEl.innerHTML = `<div class="cart-item" style="padding:18px;color:#666">Your cart is empty. <a href="products.html">Browse items</a></div>`;
      totalEl.textContent = '0';
      return;
    }

    let total = 0;

    cart.forEach((item, idx) => {
      total += (item.price || 0) * (item.quantity || 1);

      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <div style="display:flex;align-items:center;gap:12px;">
          ${item.img ? `<img src="${item.img}" alt="${item.name}" style="width:72px;height:72px;border-radius:10px;object-fit:cover">` : ''}
          <div>
            <div style="font-weight:700">${item.name}</div>
            <div style="color:#666;margin-top:6px">₹${item.price} × ${item.quantity}</div>
          </div>
        </div>
        <div>
          <button class="btn btn-ghost" onclick="removeFromCart(${idx})">Remove</button>
        </div>
      `;
      listEl.appendChild(row);

      if (summaryEl) {
        const r = document.createElement('div');
        r.style.display = 'flex';
        r.style.justifyContent = 'space-between';
        r.style.marginBottom = '8px';
        r.innerHTML = `<div>${item.name} x ${item.quantity}</div><div>₹${item.price * item.quantity}</div>`;
        summaryEl.appendChild(r);
      }
    });

    totalEl.textContent = total;
  }

  // checkout from cart
  window.checkoutFromCart = function () {
    if (!cart.length) {
      alert('Your cart is empty!');
      return;
    }
    window.location.href = 'payments.html';
  };

  // render payment summary
  function renderPaymentSummary() {
    const sItems = document.getElementById('summary-items');
    const sTotal = document.getElementById('summary-total');
    if (!sItems || !sTotal) return;

    sItems.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
      sItems.innerHTML = '<p style="color:#666">Your cart is empty.</p>';
      sTotal.textContent = '0';
      return;
    }

    cart.forEach(it => {
      total += (it.price || 0) * (it.quantity || 1);
      const r = document.createElement('div');
      r.style.display = 'flex';
      r.style.justifyContent = 'space-between';
      r.style.marginBottom = '6px';
      r.innerHTML = `<div>${it.name} x ${it.quantity}</div><div>₹${it.price * it.quantity}</div>`;
      sItems.appendChild(r);
    });

    sTotal.textContent = total;
  }

  // process order from payments page
  window.processOrder = function (event) {
    event.preventDefault();

    // basic validation
    const fullname = (document.getElementById('fullname') || {}).value || '';
    const phone = (document.getElementById('phone') || {}).value || '';
    const email = (document.getElementById('email') || {}).value || '';
    const address = (document.getElementById('address') || {}).value || '';

    if (!fullname || !phone || !email || !address) {
      alert('Please fill all required fields.');
      return;
    }

    if (!cart.length) {
      alert('Cart is empty.');
      return;
    }

    // create order id
    const orderId = 'TK' + Math.floor(100000 + Math.random() * 900000);

    // in real app you'd send order to backend here

    // clear cart and save
    cart = [];
    saveCart();

    // redirect to thank you with orderId param
    window.location.href = `thankyou.html?orderId=${orderId}`;
  };

  // render thankyou page
  function renderThankYou() {
    const el = document.getElementById('order-id');
    if (!el) return;
    const params = new URLSearchParams(window.location.search);
    el.textContent = params.get('orderId') || 'N/A';
  }

  // show toast style
  const toastStyle = document.createElement('style');
  toastStyle.innerHTML = `
    .mini-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:24px;padding:10px 16px;background:#2b2b2b;color:white;border-radius:10px;opacity:0;transition:all .28s;z-index:9999;font-weight:700}
    .mini-toast.visible{opacity:1;transform:translateX(-50%) translateY(-8px)}
  `;
  document.head.appendChild(toastStyle);

  // on DOM ready
  document.addEventListener('DOMContentLoaded', function () {
    updateCartCount();
    // render pages conditionally
    if (document.getElementById('cart-items')) {
      renderCartPage();
    }
    if (document.getElementById('summary-items')) {
      // load latest cart from storage (in case user navigated)
      cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      renderPaymentSummary();
    }
    if (document.getElementById('order-id')) {
      renderThankYou();
    }
  });

})();
