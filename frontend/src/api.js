// ============================================
// API Service - Borj El Eilm
// Tous les appels vers le backend Node.js/Express
// ============================================

const BASE_URL = '/api';
export { BASE_URL };

// Helper: get token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper: headers avec auth
const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

// Helper: handle response
const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
};

// ============================================
// AUTH
// ============================================
export const apiLogin = async (email, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
};

export const apiRegister = async (formData) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  return handleResponse(res);
};

export const apiGetMe = async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

// ============================================
// PRODUCTS
// ============================================
export const apiGetProducts = async () => {
  const res = await fetch(`${BASE_URL}/products`);
  return handleResponse(res);
};

export const apiCreateProduct = async (data) => {
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const apiUpdateProduct = async (id, data) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const apiDeleteProduct = async (id) => {
  const res = await fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const apiGetLowStock = async () => {
  const res = await fetch(`${BASE_URL}/products/low-stock`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

// ============================================
// ORDERS
// ============================================
export const apiGetOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const apiGetMyOrders = async () => {
  const res = await fetch(`${BASE_URL}/orders/my-orders`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const apiCreateOrder = async (data) => {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const apiUpdateOrderStatus = async (id, status) => {
  const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ status })
  });
  return handleResponse(res);
};

// ============================================
// USERS (Super Admin)
// ============================================
export const apiGetUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const apiUpdateUser = async (id, data) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const apiDeleteUser = async (id) => {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const apiGetStats = async () => {
  const res = await fetch(`${BASE_URL}/users/stats`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

// ============================================
// CATEGORIES
// ============================================
export const apiGetCategories = async () => {
  const res = await fetch('/api/categories', { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};
export const apiCreateCategory = async (body) => {
  const res = await fetch('/api/categories', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};
export const apiUpdateCategory = async (id, body) => {
  const res = await fetch(`/api/categories/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};
export const apiDeleteCategory = async (id) => {
  const res = await fetch(`/api/categories/${id}`, { method: 'DELETE', headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

// ============================================
// SUPPLIERS
// ============================================
export const apiGetSuppliers = async () => {
  const res = await fetch('/api/suppliers', { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};
export const apiCreateSupplier = async (body) => {
  const res = await fetch('/api/suppliers', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};
export const apiUpdateSupplier = async (id, body) => {
  const res = await fetch(`/api/suppliers/${id}`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};
export const apiDeleteSupplier = async (id) => {
  const res = await fetch(`/api/suppliers/${id}`, { method: 'DELETE', headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

// ============================================
// CREATE ADMIN
// ============================================
export const apiCreateAdmin = async (body) => {
  const res = await fetch('/api/users/create-admin', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const apiGetSupplierDetails = async (id) => {
  const res = await fetch(`/api/suppliers/${id}/details`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};
// ============================================
// PURCHASE ORDERS (Bons de Commande Fournisseur)
// ============================================
export const apiGetPurchaseOrders = async () => {
  const res = await fetch('/api/purchase-orders', { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const apiCreatePurchaseOrder = async (body) => {
  const res = await fetch('/api/purchase-orders', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const apiUpdatePurchaseOrderStatus = async (id, status) => {
  const res = await fetch(`/api/purchase-orders/${id}/status`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status }) });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const apiDeletePurchaseOrder = async (id) => {
  const res = await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE', headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

// ============================================
// STOCK
// ============================================
export const apiGetStockMovements = async () => {
  const res = await fetch('/api/stock/movements', { headers: authHeaders() });
  return handleResponse(res);
};
export const apiGetStockSummary = async () => {
  const res = await fetch('/api/stock/summary', { headers: authHeaders() });
  return handleResponse(res);
};
export const apiAddStock = async (body) => {
  const res = await fetch('/api/stock/add', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  return handleResponse(res);
};
export const apiRemoveStock = async (body) => {
  const res = await fetch('/api/stock/remove', { method: 'POST', headers: authHeaders(), body: JSON.stringify(body) });
  return handleResponse(res);
};

// ============================================
// GROSSISTES
// ============================================
export const apiRegisterGrossiste = async (formData) => {
  const res = await fetch(`${BASE_URL}/grossistes/register`, {
    method: 'POST',
    body: formData
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const apiGetGrossistes = async () => {
  const res = await fetch(`${BASE_URL}/grossistes`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const apiApproveGrossiste = async (id) => {
  const res = await fetch(`${BASE_URL}/grossistes/${id}/approve`, {
    method: 'PUT',
    headers: authHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

export const apiRejectGrossiste = async (id, reason) => {
  const res = await fetch(`${BASE_URL}/grossistes/${id}/reject`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ reason })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

// ============================================
// PURCHASE ORDER DETAIL
// ============================================
export const apiGetPurchaseOrderById = async (id) => {
  const res = await fetch(`${BASE_URL}/purchase-orders/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

// ============================================
// ORDER DETAIL
// ============================================
export const apiGetOrderById = async (id) => {
  const res = await fetch(`${BASE_URL}/orders/${id}`, { headers: authHeaders() });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};

// ============================================
// BULK IMPORT
// ============================================
export const apiBulkImport = async (products) => {
  const res = await fetch(`${BASE_URL}/products/bulk`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ products })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data;
};