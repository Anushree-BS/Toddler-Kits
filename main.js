// ================== CART DATA ==================
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

// ================== ADD TO CART ==================
function addToCart(name, price, image) {
    const item = { name, price, image };
    cart.push(item);
    saveCart();
    alert(name + " added to cart!");
}

// ================== DISPLAY CART ==================
function displayCart() {
    const cartBox = document.getElementById("cartContainer");
    const itemCount = document.getElementById("itemCount");
    const totalAmount = document.getElementById("totalAmount");

    if (!cartBox) return;

    cartBox.innerHTML = "";

    if (cart.length === 0) {
        cartBox.innerHTML = "<p>Your cart is empty.</p>";
        itemCount.textContent = "0";
        totalAmount.textContent = "0";
        return;
    }

    let total = 0;

    cart.forEach((item, index) => {
        total += Number(item.price);

        const div = document.createElement("div");
        div.classList.add("cart-item");

        div.innerHTML = `
            <img src="${item.image}" alt="">
            <h3>${item.name}</h3>
            <p>₹${item.price}</p>
            <button class="remove-btn" data-id="${index}">Remove</button>
        `;

        cartBox.appendChild(div);
    });

    // update totals
    itemCount.textContent = cart.length;
    totalAmount.textContent = total;

    // remove item buttons
    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            const index = this.getAttribute("data-id");
            cart.splice(index, 1);
            saveCart();
            displayCart();
        });
    });
}

// ================== CLEAR CART ==================
function clearCart() {
    cart = [];
    saveCart();
    displayCart();
}

// ================== CHECKOUT ==================
function checkout() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }
    window.location.href = "payment.html";
}

// ================== EVENT LISTENERS ==================
document.addEventListener("DOMContentLoaded", () => {

    if (document.getElementById("cartContainer")) {
        displayCart();
    }

    const clearBtn = document.getElementById("clearCartBtn");
    if (clearBtn) clearBtn.addEventListener("click", clearCart);

    const checkoutBtn = document.getElementById("checkoutBtn");
    if (checkoutBtn) checkoutBtn.addEventListener("click", checkout);
});
