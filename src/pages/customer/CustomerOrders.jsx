import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  ChefHat, 
  Utensils,
  ArrowLeft,
  Plus,
  Bell,
  CreditCard,
  RefreshCw
} from 'lucide-react'
import { useTableOrders } from '../../hooks/useOrders'
import { useMenuItems } from '../../hooks/useMenu'
import styles from './CustomerOrders.module.css'

const statusConfig = {
  pending: { 
    label: 'Sipariş Alındı', 
    icon: Clock, 
    color: 'warning',
    description: 'Siparişiniz mutfağa iletildi'
  },
  preparing: { 
    label: 'Hazırlanıyor', 
    icon: ChefHat, 
    color: 'info',
    description: 'Şefimiz siparişinizi hazırlıyor'
  },
  ready: { 
    label: 'Hazır', 
    icon: Utensils, 
    color: 'success',
    description: 'Siparişiniz servise hazır'
  },
  served: { 
    label: 'Servis Edildi', 
    icon: CheckCircle, 
    color: 'success',
    description: 'Afiyet olsun!'
  },
}

export default function CustomerOrders() {
  const navigate = useNavigate()
  const [customerTable, setCustomerTable] = useState(null)
  
  const { data: menuItems } = useMenuItems()
  const { data: orders, refetch, isRefetching } = useTableOrders(customerTable?.tableId, {
    refetchInterval: 10000, // Her 10 saniyede bir otomatik yenile
  })

  useEffect(() => {
    const tableData = localStorage.getItem('customerTable')
    if (!tableData) {
      navigate('/customer')
      return
    }
    setCustomerTable(JSON.parse(tableData))
  }, [navigate])

  const getMenuItem = (menuItemId) => {
    return menuItems?.find(item => item.id === menuItemId)
  }

  const getTimeAgo = (dateString) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return 'Az önce'
    if (diffMins < 60) return `${diffMins} dakika önce`
    const hours = Math.floor(diffMins / 60)
    return `${hours} saat önce`
  }

  // Toplam hesap
  const totalBill = orders?.reduce((sum, order) => sum + order.totalAmount, 0) || 0
  const activeOrders = orders?.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)) || []
  const completedOrders = orders?.filter(o => o.status === 'served') || []

  if (!customerTable) {
    return null
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/customer/menu')}>
          <ArrowLeft size={20} />
        </button>
        <div className={styles.headerCenter}>
          <h1>Siparişlerim</h1>
          <span>Masa {customerTable.tableNumber}</span>
        </div>
        <button 
          className={`${styles.refreshBtn} ${isRefetching ? styles.spinning : ''}`}
          onClick={() => refetch()}
        >
          <RefreshCw size={18} />
        </button>
      </header>

      {/* Active Orders */}
      {activeOrders.length > 0 && (
        <section className={styles.section}>
          <h2>Aktif Siparişler</h2>
          <div className={styles.ordersList}>
            <AnimatePresence mode="popLayout">
              {activeOrders.map((order, index) => {
                const status = statusConfig[order.status]
                const StatusIcon = status.icon
                
                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.1 }}
                    className={styles.orderCard}
                  >
                    <div className={styles.orderStatus}>
                      <div className={`${styles.statusIcon} ${styles[status.color]}`}>
                        <StatusIcon size={24} />
                      </div>
                      <div className={styles.statusInfo}>
                        <span className={styles.statusLabel}>{status.label}</span>
                        <span className={styles.statusDesc}>{status.description}</span>
                      </div>
                    </div>

                    {/* Progress */}
                    <div className={styles.progress}>
                      <div className={`${styles.step} ${styles.active}`}>
                        <div className={styles.stepDot} />
                        <span>Alındı</span>
                      </div>
                      <div className={`${styles.step} ${['preparing', 'ready', 'served'].includes(order.status) ? styles.active : ''}`}>
                        <div className={styles.stepDot} />
                        <span>Hazırlanıyor</span>
                      </div>
                      <div className={`${styles.step} ${['ready', 'served'].includes(order.status) ? styles.active : ''}`}>
                        <div className={styles.stepDot} />
                        <span>Hazır</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className={styles.orderItems}>
                      {order.items.map((item, idx) => {
                        const menuItem = getMenuItem(item.menuItemId)
                        return (
                          <div key={idx} className={styles.orderItem}>
                            <span className={styles.qty}>{item.quantity}x</span>
                            <span className={styles.itemName}>{menuItem?.name || 'Ürün'}</span>
                            {item.notes && <span className={styles.itemNotes}>{item.notes}</span>}
                          </div>
                        )
                      })}
                    </div>

                    <div className={styles.orderFooter}>
                      <span className={styles.orderTime}>{getTimeAgo(order.createdAt)}</span>
                      <span className={styles.orderTotal}>₺{order.totalAmount}</span>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        </section>
      )}

      {/* Completed Orders */}
      {completedOrders.length > 0 && (
        <section className={styles.section}>
          <h2>Tamamlanan Siparişler</h2>
          <div className={styles.completedList}>
            {completedOrders.map(order => (
              <div key={order.id} className={styles.completedCard}>
                <div className={styles.completedItems}>
                  {order.items.map((item, idx) => {
                    const menuItem = getMenuItem(item.menuItemId)
                    return (
                      <span key={idx}>
                        {item.quantity}x {menuItem?.name}
                        {idx < order.items.length - 1 ? ', ' : ''}
                      </span>
                    )
                  })}
                </div>
                <span className={styles.completedTotal}>₺{order.totalAmount}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty State */}
      {orders?.length === 0 && (
        <div className={styles.emptyState}>
          <Utensils size={64} />
          <h3>Henüz sipariş yok</h3>
          <p>Menüden sipariş vermek için aşağıdaki butona tıklayın</p>
        </div>
      )}

      {/* Bottom Actions */}
      <div className={styles.bottomActions}>
        <button 
          className={styles.newOrderBtn}
          onClick={() => navigate('/customer/menu')}
        >
          <Plus size={20} />
          <span>Yeni Sipariş</span>
        </button>

        {totalBill > 0 && (
          <button className={styles.billBtn}>
            <CreditCard size={20} />
            <span>Hesap İste</span>
            <span className={styles.billTotal}>₺{totalBill}</span>
          </button>
        )}
      </div>

      {/* Call Waiter FAB */}
      <button className={styles.callWaiterFab}>
        <Bell size={24} />
      </button>
    </div>
  )
}

