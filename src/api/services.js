import api from './axios'

// ==========================================
// MASA (TABLES) SERVİSLERİ
// ==========================================
export const tablesApi = {
  // Tüm masaları getir
  getAll: async () => {
    const { data } = await api.get('/tables')
    return data
  },
  
  // Tek masa getir
  getById: async (id) => {
    const { data } = await api.get(`/tables/${id}`)
    return data
  },
  
  // Masa durumunu güncelle
  updateStatus: async ({ id, status }) => {
    const { data } = await api.patch(`/tables/${id}`, { status })
    return data
  },
  
  // Yeni masa ekle
  create: async (table) => {
    const { data } = await api.post('/tables', table)
    return data
  },
  
  // Masa sil
  delete: async (id) => {
    await api.delete(`/tables/${id}`)
    return id
  },
}

// ==========================================
// KATEGORİ SERVİSLERİ
// ==========================================
export const categoriesApi = {
  getAll: async () => {
    const { data } = await api.get('/categories')
    return data
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/categories/${id}`)
    return data
  },
}

// ==========================================
// MENÜ SERVİSLERİ
// ==========================================
export const menuApi = {
  // Tüm menü öğelerini getir
  getAll: async () => {
    const { data } = await api.get('/menuItems')
    return data
  },
  
  // Kategoriye göre menü öğelerini getir
  getByCategory: async (categoryId) => {
    const { data } = await api.get(`/menuItems?categoryId=${categoryId}`)
    return data
  },
  
  // Tek menü öğesi getir
  getById: async (id) => {
    const { data } = await api.get(`/menuItems/${id}`)
    return data
  },
  
  // Menü öğesi stok durumunu güncelle
  updateAvailability: async ({ id, isAvailable }) => {
    const { data } = await api.patch(`/menuItems/${id}`, { isAvailable })
    return data
  },
  
  // Menü öğesi fiyatını güncelle
  updatePrice: async ({ id, price }) => {
    const { data } = await api.patch(`/menuItems/${id}`, { price })
    return data
  },
}

// ==========================================
// SİPARİŞ SERVİSLERİ
// ==========================================
export const ordersApi = {
  // Tüm siparişleri getir
  getAll: async () => {
    const { data } = await api.get('/orders')
    return data
  },
  
  // Masa siparişlerini getir
  getByTable: async (tableId) => {
    const { data } = await api.get(`/orders?tableId=${tableId}`)
    return data
  },
  
  // Duruma göre siparişleri getir
  getByStatus: async (status) => {
    const { data } = await api.get(`/orders?status=${status}`)
    return data
  },
  
  // Tek sipariş getir
  getById: async (id) => {
    const { data } = await api.get(`/orders/${id}`)
    return data
  },
  
  // Yeni sipariş oluştur
  create: async (order) => {
    const { data } = await api.post('/orders', {
      ...order,
      createdAt: new Date().toISOString(),
    })
    return data
  },
  
  // Sipariş durumunu güncelle
  updateStatus: async ({ id, status }) => {
    const { data } = await api.patch(`/orders/${id}`, { status })
    return data
  },
  
  // Siparişe ürün ekle
  addItem: async ({ orderId, item }) => {
    const order = await ordersApi.getById(orderId)
    const updatedItems = [...order.items, item]
    const { data } = await api.patch(`/orders/${orderId}`, { items: updatedItems })
    return data
  },
  
  // Siparişten ürün çıkar
  removeItem: async ({ orderId, menuItemId }) => {
    const order = await ordersApi.getById(orderId)
    const updatedItems = order.items.filter(item => item.menuItemId !== menuItemId)
    const { data } = await api.patch(`/orders/${orderId}`, { items: updatedItems })
    return data
  },
  
  // Sipariş sil
  delete: async (id) => {
    await api.delete(`/orders/${id}`)
    return id
  },
}

// ==========================================
// GARSON SERVİSLERİ
// ==========================================
export const waitersApi = {
  getAll: async () => {
    const { data } = await api.get('/waiters')
    return data
  },
  
  getById: async (id) => {
    const { data } = await api.get(`/waiters/${id}`)
    return data
  },
}

// ==========================================
// İSTATİSTİK SERVİSLERİ
// ==========================================
export const statsApi = {
  get: async () => {
    const { data } = await api.get('/stats')
    return data
  },
  
  update: async (stats) => {
    const { data } = await api.patch('/stats', stats)
    return data
  },
}

