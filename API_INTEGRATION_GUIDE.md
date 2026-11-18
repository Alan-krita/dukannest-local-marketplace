# Local Seller Marketplace — Frontend API Integration Guide

**Base API URL**: `http://127.0.0.1:8000/api/v1`  
**Swagger UI**: `http://127.0.0.1:8000/docs`  
**Authentication Type**: Bearer Token (`Authorization: Bearer <access_token>`)  
**Data Format**: JSON (`Content-Type: application/json`)

---

## 1. Authentication APIs

### 1.1 Register User
- **Endpoint**: `/api/v1/auth/register`
- **Method**: `POST`
- **Access**: Public (No token needed)
- **Request Body**:
  ```json
  {
    "full_name": "Alice Customer",
    "email": "alice@example.com",
    "password": "Password123!",
    "phone": "9876543210",
    "role": "CUSTOMER"
  }
  ```
  *(Note: `role` must be `"CUSTOMER"` or `"SELLER"`. Defaults to `"CUSTOMER"` if omitted. `phone` is optional).*
- **Expected Response (201 Created)**:
  ```json
  {
    "id": "11111111-2222-3333-4444-555555555555",
    "full_name": "Alice Customer",
    "email": "alice@example.com",
    "phone": "9876543210",
    "role": "CUSTOMER",
    "is_active": true,
    "created_at": "2026-11-18T00:00:00Z",
    "updated_at": "2026-11-18T00:00:00Z"
  }
  ```
- **Possible Errors**:
  - `409 Conflict`: `{"detail": "A user with this email address already exists"}`
  - `409 Conflict`: `{"detail": "A user with this phone number already exists"}`
  - `422 Validation Error`: Invalid email format or password less than 6 characters.

---

### 1.2 Login User
- **Endpoint**: `/api/v1/auth/login`
- **Method**: `POST`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "alice@example.com",
    "password": "Password123!"
  }
  ```
- **Expected Response (200 OK)**:
  ```json
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": "11111111-2222-3333-4444-555555555555",
      "full_name": "Alice Customer",
      "email": "alice@example.com",
      "role": "CUSTOMER",
      "is_active": true
    }
  }
  ```
- **Possible Errors**:
  - `401 Unauthorized`: `{"detail": "Invalid email or password"}`
  - `403 Forbidden`: `{"detail": "User account is deactivated"}`

---

### 1.3 Get Current User Profile
- **Endpoint**: `/api/v1/auth/me`
- **Method**: `GET`
- **Access**: Authenticated (`CUSTOMER` or `SELLER`)
- **Headers**: `Authorization: Bearer <access_token>`
- **Expected Response (200 OK)**:
  ```json
  {
    "id": "11111111-2222-3333-4444-555555555555",
    "full_name": "Alice Customer",
    "email": "alice@example.com",
    "phone": "9876543210",
    "role": "CUSTOMER",
    "is_active": true,
    "created_at": "2026-11-18T00:00:00Z",
    "updated_at": "2026-11-18T00:00:00Z"
  }
  ```
- **Possible Errors**:
  - `401 Unauthorized`: Invalid or expired JWT token.

---

## 2. Shops APIs

### 2.1 Create Shop (Seller Only)
- **Endpoint**: `/api/v1/shops`
- **Method**: `POST`
- **Access**: `SELLER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "shop_name": "Green Valley Organics",
    "description": "Locally grown organic vegetables and artisanal goods",
    "category": "Groceries",
    "locality": "Sector 14",
    "city": "Jaipur",
    "state": "Rajasthan",
    "pincode": "302001",
    "address": "Shop 42, Central Market",
    "logo_url": "https://example.com/logo.jpg",
    "status": "ACTIVE"
  }
  ```
  *(Note: `status` can be `"DRAFT"` or `"ACTIVE"`, defaults to `"DRAFT"`).*
- **Expected Response (201 Created)**:
  ```json
  {
    "id": "22222222-3333-4444-5555-666666666666",
    "owner_user_id": "11111111-2222-3333-4444-555555555555",
    "shop_name": "Green Valley Organics",
    "status": "ACTIVE",
    "city": "Jaipur",
    "created_at": "2026-11-18T00:00:00Z"
  }
  ```
- **Possible Errors**:
  - `403 Forbidden`: User is not a `SELLER`.
  - `409 Conflict`: `{"detail": "Seller already owns a shop. Only one shop per seller is allowed."}`

---

### 2.2 Get My Shop (Seller Only)
- **Endpoint**: `/api/v1/shops/mine`
- **Method**: `GET`
- **Access**: `SELLER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Expected Response (200 OK)**: Full shop details.
- **Possible Errors**:
  - `404 Not Found`: Seller has not created a shop yet.

---

### 2.3 Update My Shop (Seller Only)
- **Endpoint**: `/api/v1/shops/mine`
- **Method**: `PATCH`
- **Access**: `SELLER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body** (Send any fields you want to update):
  ```json
  {
    "description": "Updated shop description",
    "status": "ACTIVE"
  }
  ```
- **Expected Response (200 OK)**: Updated shop object.

---

### 2.4 Get Public Shop Details
- **Endpoint**: `/api/v1/shops/{shop_id}`
- **Method**: `GET`
- **Access**: Public
- **Expected Response (200 OK)**: Shop details.

---

## 3. Categories APIs

### 3.1 List Categories
- **Endpoint**: `/api/v1/categories`
- **Method**: `GET`
- **Access**: Public
- **Expected Response (200 OK)**:
  ```json
  [
    { "id": "33333333-4444-5555-6666-777777777777", "name": "Handmade", "slug": "handmade", "is_active": true },
    { "id": "44444444-5555-6666-7777-888888888888", "name": "Clothing", "slug": "clothing", "is_active": true }
  ]
  ```

---

## 4. Products APIs

### 4.1 Browse & Search Products (Public)
- **Endpoint**: `/api/v1/products`
- **Method**: `GET`
- **Access**: Public
- **Query Parameters**:
  - `search` (optional): search text in title or description (e.g. `?search=bread`)
  - `category_id` (optional): category UUID
  - `city` (optional): filter by shop's city (e.g. `?city=Jaipur`)
  - `shop_id` (optional): filter products of a specific shop
  - `page` (optional): default `1`
  - `limit` (optional): default `20` (max 100)
- **Expected Response (200 OK)**:
  ```json
  {
    "items": [
      {
        "id": "55555555-6666-7777-8888-999999999999",
        "shop_id": "22222222-3333-4444-5555-666666666666",
        "category_id": "33333333-4444-5555-6666-777777777777",
        "name": "Artisanal Sourdough",
        "description": "Naturally fermented bread",
        "price": "45.00",
        "stock_quantity": 20,
        "sku": "BREAD-01",
        "image_url": "https://example.com/bread.jpg",
        "is_active": true
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
  ```

---

### 4.2 Get Product Details
- **Endpoint**: `/api/v1/products/{product_id}`
- **Method**: `GET`
- **Access**: Public
- **Expected Response (200 OK)**: Single product object.

---

### 4.3 Add Product (Seller Only)
- **Endpoint**: `/api/v1/products`
- **Method**: `POST`
- **Access**: `SELLER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "category_id": "33333333-4444-5555-6666-777777777777",
    "name": "Artisanal Sourdough",
    "description": "Naturally fermented bread loaf",
    "price": 45.00,
    "stock_quantity": 20,
    "sku": "BREAD-01",
    "image_url": "https://example.com/bread.jpg"
  }
  ```
  *(Note: `price` must be `> 0`. `stock_quantity` must be `>= 0`).*
- **Expected Response (201 Created)**: Created product object.
- **Possible Errors**:
  - `400 Bad Request`: Seller has no shop yet, or invalid category ID.

---

### 4.4 Update Product (Owning Seller Only)
- **Endpoint**: `/api/v1/products/{product_id}`
- **Method**: `PATCH`
- **Access**: `SELLER` (Must own the shop)
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**: (Any fields to update: `name`, `price`, `stock_quantity`, etc.)
- **Possible Errors**:
  - `403 Forbidden`: Seller attempts to update products belonging to another shop.

---

### 4.5 Archive / Delete Product (Owning Seller Only)
- **Endpoint**: `/api/v1/products/{product_id}`
- **Method**: `DELETE`
- **Access**: `SELLER` (Must own the shop)
- **Headers**: `Authorization: Bearer <access_token>`
- **Behavior**: Performs soft-delete by setting `is_active = false`. Product is hidden from public view while preserving past order history.

---

## 5. Cart APIs (Customer Only)

### 5.1 Get My Cart
- **Endpoint**: `/api/v1/cart`
- **Method**: `GET`
- **Access**: `CUSTOMER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Expected Response (200 OK)**:
  ```json
  {
    "id": "66666666-7777-8888-9999-000000000000",
    "customer_user_id": "11111111-2222-3333-4444-555555555555",
    "items": [
      {
        "id": "77777777-8888-9999-0000-111111111111",
        "cart_id": "66666666-7777-8888-9999-000000000000",
        "product_id": "55555555-6666-7777-8888-999999999999",
        "quantity": 2,
        "product": {
          "id": "55555555-6666-7777-8888-999999999999",
          "name": "Artisanal Sourdough",
          "price": "45.00"
        }
      }
    ],
    "total_items": 2,
    "subtotal": "90.00"
  }
  ```

---

### 5.2 Add Item to Cart
- **Endpoint**: `/api/v1/cart/items`
- **Method**: `POST`
- **Access**: `CUSTOMER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "product_id": "55555555-6666-7777-8888-999999999999",
    "quantity": 1
  }
  ```
- **Expected Response (201 Created)**: Updated cart object with recalculated subtotal.
- **Possible Errors**:
  - `400 Bad Request`: Requested quantity exceeds available stock.
  - `404 Not Found`: Inactive product or product not found.

---

### 5.3 Update Cart Item Quantity
- **Endpoint**: `/api/v1/cart/items/{item_id}`
- **Method**: `PATCH`
- **Access**: `CUSTOMER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "quantity": 3
  }
  ```
- **Expected Response (200 OK)**: Updated cart object.

---

### 5.4 Remove Cart Item
- **Endpoint**: `/api/v1/cart/items/{item_id}`
- **Method**: `DELETE`
- **Access**: `CUSTOMER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Expected Response (200 OK)**: Updated cart object without the deleted item.

---

## 6. Orders & Checkout APIs

### 6.1 Checkout Cart (Place Order)
- **Endpoint**: `/api/v1/orders`
- **Method**: `POST`
- **Access**: `CUSTOMER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "delivery_name": "Alice Customer",
    "delivery_phone": "9876543210",
    "delivery_address": "Flat 301, Sunshine Heights, MG Road",
    "delivery_city": "Jaipur",
    "delivery_state": "Rajasthan",
    "delivery_pincode": "302001",
    "payment_method": "COD"
  }
  ```
  *(Note: `payment_method` must be `"COD"` or `"SIMULATED"`).*
- **Expected Response (201 Created)**:
  ```json
  {
    "id": "88888888-9999-0000-1111-222222222222",
    "order_number": "ORD-1731888888000-A1B2C3",
    "status": "PLACED",
    "subtotal": "90.00",
    "delivery_fee": "0.00",
    "total_amount": "90.00",
    "payment_method": "COD",
    "payment_status": "PENDING",
    "items": [
      {
        "product_id": "55555555-6666-7777-8888-999999999999",
        "product_name_snapshot": "Artisanal Sourdough",
        "unit_price": "45.00",
        "quantity": 2,
        "line_total": "90.00"
      }
    ]
  }
  ```
- **Checkout Rules**:
  - Single-seller checkout for MVP: Cart items must belong to one seller's shop.
  - Automatically locks stock and decrements inventory safely.
  - Clears customer's cart upon success.
  - Rolls back atomically if stock runs out or an error occurs.
- **Possible Errors**:
  - `400 Bad Request`: `"Your cart is empty"`
  - `400 Bad Request`: `"Single-seller checkout: Your cart contains items from multiple shops"`
  - `400 Bad Request`: `"Insufficient stock for ..."`

---

### 6.2 Customer Order History
- **Endpoint**: `/api/v1/orders/mine`
- **Method**: `GET`
- **Access**: `CUSTOMER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Expected Response (200 OK)**: Array of customer's past orders with status and line items.

---

### 6.3 Seller Incoming Orders
- **Endpoint**: `/api/v1/seller/orders`
- **Method**: `GET`
- **Access**: `SELLER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Expected Response (200 OK)**: Array of orders containing items from this seller's shop.

---

### 6.4 Update Order Status (Seller Only)
- **Endpoint**: `/api/v1/seller/orders/{order_id}/status`
- **Method**: `PATCH`
- **Access**: `SELLER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Request Body**:
  ```json
  {
    "status": "ACCEPTED"
  }
  ```
- **Allowed Lifecycle State Transitions**:
  - `PLACED` &rarr; `ACCEPTED` or `CANCELLED`
  - `ACCEPTED` &rarr; `PACKED` or `CANCELLED`
  - `PACKED` &rarr; `SHIPPED`
  - `SHIPPED` &rarr; `DELIVERED`
  *(Note: If status is set to `"CANCELLED"`, product stock is automatically restored to the seller's inventory).*
- **Possible Errors**:
  - `400 Bad Request`: Invalid status transition.
  - `403 Forbidden`: Order does not contain products from this seller's shop.

---

## 7. Seller Dashboard API

### 7.1 Get Seller Dashboard Analytics
- **Endpoint**: `/api/v1/seller/dashboard`
- **Method**: `GET`
- **Access**: `SELLER`
- **Headers**: `Authorization: Bearer <access_token>`
- **Expected Response (200 OK)**:
  ```json
  {
    "shop": {
      "id": "22222222-3333-4444-5555-666666666666",
      "shop_name": "Green Valley Organics",
      "status": "ACTIVE"
    },
    "total_products": 12,
    "active_products": 10,
    "total_orders": 8,
    "pending_orders": 3,
    "delivered_orders": 5,
    "total_sales": "4500.00"
  }
  ```

---

## 8. Health Check API

### 8.1 Health Status
- **Endpoint**: `/health`
- **Method**: `GET`
- **Access**: Public
- **Expected Response (200 OK)**:
  ```json
  {
    "status": "healthy",
    "database": "connected"
  }
  ```

---

## 9. JavaScript `fetch()` Examples for Frontend

Copy and paste these snippets into your frontend JavaScript:

### Configuration Helper (`api.js`)
```javascript
const API_BASE = "http://127.0.0.1:8000/api/v1";

// Helper for authorized API calls
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.detail || "API request failed");
  }
  return data;
}
```

---

### Example 1: Register User
```javascript
async function registerUser(fullName, email, password, role = "CUSTOMER") {
  try {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        full_name: fullName,
        email: email,
        password: password,
        role: role,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail);

    console.log("Registered successfully:", data);
    return data;
  } catch (error) {
    alert("Registration error: " + error.message);
  }
}
```

---

### Example 2: Login and Save Token
```javascript
async function loginUser(email, password) {
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail);

    // Save token and user details to localStorage
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));

    console.log("Logged in as:", data.user.role);
    if (data.user.role === "SELLER") {
      window.location.href = "/seller-dashboard.html";
    } else {
      window.location.href = "/index.html";
    }
  } catch (error) {
    alert("Login failed: " + error.message);
  }
}
```

---

### Example 3: Browse Products with Search & Filters
```javascript
async function loadProducts(searchTerm = "", categoryId = "", city = "", page = 1) {
  try {
    const params = new URLSearchParams({
      page: page,
      limit: 20,
      ...(searchTerm && { search: searchTerm }),
      ...(categoryId && { category_id: categoryId }),
      ...(city && { city: city }),
    });

    const response = await fetch(`${API_BASE}/products?${params.toString()}`);
    const data = await response.json();

    console.log(`Found ${data.total} products:`, data.items);
    return data.items;
  } catch (error) {
    console.error("Failed to load products:", error);
  }
}
```

---

### Example 4: Add Product to Shopping Cart
```javascript
async function addToCart(productId, quantity = 1) {
  try {
    const updatedCart = await fetchWithAuth("/cart/items", {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity,
      }),
    });

    alert(`Product added! Cart now has ${updatedCart.total_items} items.`);
    return updatedCart;
  } catch (error) {
    alert("Could not add to cart: " + error.message);
  }
}
```

---

### Example 5: Checkout (Place Order)
```javascript
async function placeOrder(shippingInfo) {
  try {
    const order = await fetchWithAuth("/orders", {
      method: "POST",
      body: JSON.stringify({
        delivery_name: shippingInfo.name,
        delivery_phone: shippingInfo.phone,
        delivery_address: shippingInfo.address,
        delivery_city: shippingInfo.city,
        delivery_state: shippingInfo.state,
        delivery_pincode: shippingInfo.pincode,
        payment_method: "COD", // or "SIMULATED"
      }),
    });

    alert(`Order #${order.order_number} placed successfully! Total: ₹${order.total_amount}`);
    window.location.href = "/order-success.html";
    return order;
  } catch (error) {
    alert("Checkout error: " + error.message);
  }
}
```

---

### Example 6: Seller Updates Order Status
```javascript
async function updateOrderStatus(orderId, nextStatus) {
  try {
    // nextStatus must follow: PLACED -> ACCEPTED -> PACKED -> SHIPPED -> DELIVERED
    const updatedOrder = await fetchWithAuth(`/seller/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status: nextStatus }),
    });

    console.log(`Order ${orderId} updated to ${updatedOrder.status}`);
    return updatedOrder;
  } catch (error) {
    alert("Failed to update status: " + error.message);
  }
}
```
