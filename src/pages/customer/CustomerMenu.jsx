import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Clock, 
  Flame,
  X,
  ChevronRight,
  Bell,
  Search,
  ArrowLeft
} from 'lucide-react'
import { useMenuWithCategories } from '../../hooks/useMenu'
import { useCreateOrder } from '../../hooks/useOrders'
import { Skeleton } from '../../components/ui/Skeleton'
import styles from './CustomerMenu.module.css'

export default function CustomerMenu() {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [cart, setCart] = useState([])
  const [showCart, setShowCart] = useState(false)
  const [customerTable, setCustomerTable] = useState(null)
  
  const { categories, menuItems, isLoading } = useMenuWithCategories()
  const createOrder = useCreateOrder()

  useEffect(() => {
    const tableData = localStorage.getItem('customerTable')
    if (!tableData) {
      navigate('/customer')
      return
    }
    setCustomerTable(JSON.parse(tableData))
  }, [navigate])

  // Filtrelenmiş menü
  const filteredMenu = useMemo(() => {
    if (!menuItems) return []
    return menuItems.filter(item => {
      if (!item.isAvailable) return false
      const categoryMatch = !selectedCategory || item.categoryId === selectedCategory
      const searchMatch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      return categoryMatch && searchMatch
    })
  }, [menuItems, selectedCategory, searchQuery])

  // Sepet işlemleri
  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) {
        return prev.map(i => 
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1, notes: '' }]
    })
  }

  const removeFromCart = (itemId) => {
    setCart(prev => prev.filter(i => i.id !== itemId))
  }

  const updateQuantity = (itemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        const newQty = item.quantity + delta
        if (newQty <= 0) return null
        return { ...item, quantity: newQty }
      }
      return item
    }).filter(Boolean))
  }

  const updateNotes = (itemId, notes) => {
    setCart(prev => prev.map(item => 
      item.id === itemId ? { ...item, notes } : item
    ))
  }

  // Toplam hesaplama
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  // Sipariş gönder
  const handleOrder = () => {
    if (cart.length === 0 || !customerTable) return

    const orderData = {
      tableId: customerTable.tableId,
      items: cart.map(item => ({
        menuItemId: item.id,
        quantity: item.quantity,
        notes: item.notes
      })),
      status: 'pending',
      totalAmount: cartTotal,
      isCustomerOrder: true
    }

    createOrder.mutate(orderData, {
      onSuccess: () => {
        setCart([])
        setShowCart(false)
        navigate('/customer/orders')
      }
    })
  }

  const getCartItemQuantity = (itemId) => {
    return cart.find(i => i.id === itemId)?.quantity || 0
  }

  if (isLoading || !customerTable) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingGrid}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} height="200px" borderRadius="16px" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <button className={styles.backBtn} onClick={() => navigate('/customer')}>
            <ArrowLeft size={20} />
          </button>
          <div className={styles.tableInfo}>
            <span className={styles.tableNumber}>Masa {customerTable.tableNumber}</span>
            <span className={styles.tableSection}>{customerTable.section}</span>
          </div>
          <button className={styles.callWaiter}>
            <Bell size={18} />
          </button>
        </div>
        
        {/* Search */}
        <div className={styles.searchBar}>
          <Search size={18} />
          <input
            type="text"
            placeholder="Menüde ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Categories */}
      <div className={styles.categories}>
        <button
          className={`${styles.categoryBtn} ${!selectedCategory ? styles.active : ''}`}
          onClick={() => setSelectedCategory(null)}
        >
          🍽️ Tümü
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`${styles.categoryBtn} ${selectedCategory === cat.id ? styles.active : ''}`}
            onClick={() => setSelectedCategory(cat.id)}
          >
            {cat.icon} {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Grid */}
      <main className={styles.main}>
        <motion.div className={styles.menuGrid} layout>
          <AnimatePresence mode="popLayout">
            {filteredMenu.map((item, index) => {
              const quantity = getCartItemQuantity(item.id)
              
              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.03 }}
                  className={`${styles.menuCard} ${quantity > 0 ? styles.inCart : ''}`}
                >
                  <div className={styles.cardImage}>
                    <img src={item.image} alt={item.name} />
                    {quantity > 0 && (
                      <div className={styles.cartBadge}>{quantity}</div>
                    )}
                    <div className={styles.prepTime}>
                      <Clock size={12} />
                      <span>{item.preparationTime} dk</span>
                    </div>
                  </div>
                  
                  <div className={styles.cardContent}>
                    <h3>{item.name}</h3>
                    <p className={styles.description}>{item.description}</p>
                    
                    <div className={styles.cardFooter}>
                      <span className={styles.price}>₺{item.price}</span>
                      
                      {quantity > 0 ? (
                        <div className={styles.quantityControl}>
                          <button onClick={() => updateQuantity(item.id, -1)}>
                            <Minus size={16} />
                          </button>
                          <span>{quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)}>
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className={styles.addBtn}
                          onClick={() => addToCart(item)}
                        >
                          <Plus size={18} />
                          <span>Ekle</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>

        {filteredMenu.length === 0 && (
          <div className={styles.emptyState}>
            <p>Aramanızla eşleşen ürün bulunamadı</p>
          </div>
        )}
      </main>

      {/* Cart Button */}
      {cartCount > 0 && !showCart && (
        <motion.button
          className={styles.cartButton}
          onClick={() => setShowCart(true)}
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className={styles.cartLeft}>
            <ShoppingCart size={22} />
            <span className={styles.cartBadgeBtn}>{cartCount}</span>
          </div>
          <span>Sepeti Görüntüle</span>
          <span className={styles.cartTotal}>₺{cartTotal}</span>
        </motion.button>
      )}

      {/* Cart Drawer */}
      <AnimatePresence>
        {showCart && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCart(false)}
            />
            <motion.div
              className={styles.cartDrawer}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
            >
              <div className={styles.cartHeader}>
                <h2>Sepetiniz</h2>
                <button onClick={() => setShowCart(false)}>
                  <X size={24} />
                </button>
              </div>

              <div className={styles.cartItems}>
                {cart.map(item => (
                  <div key={item.id} className={styles.cartItem}>
                    <img src={item.image} alt={item.name} />
                    <div className={styles.cartItemInfo}>
                      <h4>{item.name}</h4>
                      <span className={styles.cartItemPrice}>₺{item.price}</span>
                      <input
                        type="text"
                        placeholder="Not ekle (opsiyonel)"
                        value={item.notes}
                        onChange={(e) => updateNotes(item.id, e.target.value)}
                        className={styles.notesInput}
                      />
                    </div>
                    <div className={styles.cartItemActions}>
                      <div className={styles.quantityControl}>
                        <button onClick={() => updateQuantity(item.id, -1)}>
                          <Minus size={14} />
                        </button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)}>
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className={styles.itemTotal}>
                        ₺{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.cartFooter}>
                <div className={styles.cartSummary}>
                  <div className={styles.summaryRow}>
                    <span>Ara Toplam</span>
                    <span>₺{cartTotal}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Servis</span>
                    <span>₺0</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Toplam</span>
                    <span>₺{cartTotal}</span>
                  </div>
                </div>

                <button 
                  className={styles.orderBtn}
                  onClick={handleOrder}
                  disabled={createOrder.isPending}
                >
                  {createOrder.isPending ? (
                    <span>Sipariş Gönderiliyor...</span>
                  ) : (
                    <>
                      <span>Siparişi Onayla</span>
                      <ChevronRight size={20} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

