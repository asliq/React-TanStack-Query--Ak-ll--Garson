import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  ChefHat, 
  Utensils,
  CreditCard,
  XCircle,
  RefreshCw,
  Filter
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button, IconButton } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders'
import { useTables } from '../hooks/useTables'
import { useMenuItems } from '../hooks/useMenu'
import styles from './Orders.module.css'

const statusConfig = {
  pending: { 
    label: 'Beklemede', 
    icon: AlertCircle, 
    color: 'warning',
    nextStatus: 'preparing',
    nextLabel: 'Hazırlamaya Başla'
  },
  preparing: { 
    label: 'Hazırlanıyor', 
    icon: ChefHat, 
    color: 'info',
    nextStatus: 'ready',
    nextLabel: 'Hazır'
  },
  ready: { 
    label: 'Hazır', 
    icon: Utensils, 
    color: 'success',
    nextStatus: 'served',
    nextLabel: 'Servis Et'
  },
  served: { 
    label: 'Servis Edildi', 
    icon: CheckCircle, 
    color: 'success',
    nextStatus: 'paid',
    nextLabel: 'Ödeme Al'
  },
  paid: { 
    label: 'Ödendi', 
    icon: CreditCard, 
    color: 'success',
    nextStatus: null,
    nextLabel: null
  },
  cancelled: { 
    label: 'İptal', 
    icon: XCircle, 
    color: 'danger',
    nextStatus: null,
    nextLabel: null
  },
}

export default function Orders() {
  const [statusFilter, setStatusFilter] = useState('active')

  const { data: orders, isLoading: ordersLoading, refetch, isRefetching } = useOrders()
  const { data: tables } = useTables()
  const { data: menuItems } = useMenuItems()
  const updateStatus = useUpdateOrderStatus()

  const isLoading = ordersLoading

  // Filtreleme
  const filteredOrders = orders?.filter(order => {
    if (statusFilter === 'active') {
      return ['pending', 'preparing', 'ready'].includes(order.status)
    }
    if (statusFilter === 'completed') {
      return ['served', 'paid'].includes(order.status)
    }
    return order.status === statusFilter
  }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) || []

  // Durum güncelle
  const handleStatusUpdate = (orderId, newStatus) => {
    updateStatus.mutate({ id: orderId, status: newStatus })
  }

  // Sipariş iptali
  const handleCancel = (orderId) => {
    if (confirm('Siparişi iptal etmek istediğinize emin misiniz?')) {
      updateStatus.mutate({ id: orderId, status: 'cancelled' })
    }
  }

  // Menü öğesi bilgisi al
  const getMenuItem = (menuItemId) => {
    return menuItems?.find(item => item.id === menuItemId)
  }

  // Masa bilgisi al
  const getTable = (tableId) => {
    return tables?.find(table => table.id === tableId)
  }

  // Zaman formatı
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
  }

  // Geçen süre
  const getElapsedTime = (dateString) => {
    const now = new Date()
    const orderDate = new Date(dateString)
    const diffMs = now - orderDate
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins} dk`
    const hours = Math.floor(diffMins / 60)
    const mins = diffMins % 60
    return `${hours} sa ${mins} dk`
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.grid}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height="300px" borderRadius="16px" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Filtreler */}
      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          {[
            { value: 'active', label: 'Aktif', count: orders?.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length },
            { value: 'pending', label: 'Beklemede', count: orders?.filter(o => o.status === 'pending').length },
            { value: 'preparing', label: 'Hazırlanıyor', count: orders?.filter(o => o.status === 'preparing').length },
            { value: 'ready', label: 'Hazır', count: orders?.filter(o => o.status === 'ready').length },
            { value: 'completed', label: 'Tamamlanan', count: orders?.filter(o => ['served', 'paid'].includes(o.status)).length },
          ].map(tab => (
            <button
              key={tab.value}
              className={`${styles.filterTab} ${statusFilter === tab.value ? styles.active : ''}`}
              onClick={() => setStatusFilter(tab.value)}
            >
              {tab.label}
              {tab.count > 0 && <span className={styles.tabCount}>{tab.count}</span>}
            </button>
          ))}
        </div>

        <IconButton
          icon={RefreshCw}
          variant="secondary"
          onClick={() => refetch()}
          className={isRefetching ? styles.spinning : ''}
        />
      </div>

      {/* Siparişler Grid */}
      <motion.div 
        className={styles.grid}
        layout
      >
        <AnimatePresence mode="popLayout">
          {filteredOrders.map((order, index) => {
            const table = getTable(order.tableId)
            const status = statusConfig[order.status]
            const StatusIcon = status.icon

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
              >
                <Card className={styles.orderCard}>
                  <CardContent className={styles.cardContent}>
                    {/* Header */}
                    <div className={styles.orderHeader}>
                      <div className={styles.tableInfo}>
                        <span className={styles.tableNumber}>Masa {table?.number || '?'}</span>
                        <span className={styles.section}>{table?.section}</span>
                      </div>
                      <div className={`badge badge-${status.color}`}>
                        <StatusIcon size={14} />
                        {status.label}
                      </div>
                    </div>

                    {/* Zaman Bilgisi */}
                    <div className={styles.timeInfo}>
                      <Clock size={14} />
                      <span>{formatTime(order.createdAt)}</span>
                      <span className={styles.elapsed}>({getElapsedTime(order.createdAt)} önce)</span>
                    </div>

                    {/* Ürünler */}
                    <div className={styles.itemsList}>
                      {order.items.map((item, idx) => {
                        const menuItem = getMenuItem(item.menuItemId)
                        return (
                          <div key={idx} className={styles.orderItem}>
                            <span className={styles.quantity}>{item.quantity}x</span>
                            <span className={styles.itemName}>{menuItem?.name || 'Ürün'}</span>
                            {item.notes && (
                              <span className={styles.notes}>{item.notes}</span>
                            )}
                            <span className={styles.itemPrice}>
                              ₺{(menuItem?.price || 0) * item.quantity}
                            </span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer */}
                    <div className={styles.orderFooter}>
                      <div className={styles.total}>
                        <span>Toplam</span>
                        <span className={styles.totalAmount}>₺{order.totalAmount}</span>
                      </div>

                      <div className={styles.actions}>
                        {status.nextStatus && (
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleStatusUpdate(order.id, status.nextStatus)}
                            loading={updateStatus.isPending}
                          >
                            {status.nextLabel}
                          </Button>
                        )}
                        
                        {!['paid', 'cancelled'].includes(order.status) && (
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => handleCancel(order.id)}
                          >
                            İptal
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {filteredOrders.length === 0 && (
        <div className={styles.emptyState}>
          <Utensils size={64} />
          <h3>Sipariş Bulunamadı</h3>
          <p>Bu filtreyle eşleşen sipariş yok.</p>
        </div>
      )}
    </div>
  )
}

