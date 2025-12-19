import { motion, AnimatePresence } from 'framer-motion'
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  ChefHat,
  Timer,
  Flame,
  Bell,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { 
  useKitchenOrders, 
  useUpdateKitchenItemStatus,
  useMarkOrderReady,
  useKitchenStats
} from '../hooks/useKitchen'
import { useAppStore } from '../store/useAppStore'
import styles from './Kitchen.module.css'

const priorityConfig = {
  low: { label: 'Düşük', color: 'muted' },
  normal: { label: 'Normal', color: 'info' },
  high: { label: 'Yüksek', color: 'warning' },
  urgent: { label: 'Acil', color: 'danger' },
}

const statusConfig = {
  pending: { label: 'Bekliyor', color: 'warning', icon: Clock },
  preparing: { label: 'Hazırlanıyor', color: 'info', icon: ChefHat },
  ready: { label: 'Hazır', color: 'success', icon: CheckCircle2 },
}

export default function Kitchen() {
  const { data: orders, isLoading, refetch, isRefetching } = useKitchenOrders()
  const updateItemStatus = useUpdateKitchenItemStatus()
  const markReady = useMarkOrderReady()
  const stats = useKitchenStats()
  
  const kitchenAutoRefresh = useAppStore((state) => state.kitchenAutoRefresh)
  const setKitchenAutoRefresh = useAppStore((state) => state.setKitchenAutoRefresh)

  const getElapsedTime = (dateString) => {
    const now = new Date()
    const orderDate = new Date(dateString)
    const diffMs = now - orderDate
    const diffMins = Math.floor(diffMs / 60000)
    return diffMins
  }

  const handleItemStatusChange = (orderId, menuItemId, newStatus) => {
    updateItemStatus.mutate({ orderId, menuItemId, status: newStatus })
  }

  const handleMarkAllReady = (orderId) => {
    markReady.mutate(orderId)
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

  // Siparişleri önceliğe göre sırala
  const sortedOrders = [...(orders || [])].sort((a, b) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className={styles.page}>
      {/* Stats Header */}
      <div className={styles.statsHeader}>
        <div className={styles.statItem}>
          <Flame size={20} className={styles.statIconPending} />
          <div>
            <span className={styles.statValue}>{stats?.pendingItems || 0}</span>
            <span className={styles.statLabel}>Bekleyen</span>
          </div>
        </div>
        <div className={styles.statItem}>
          <ChefHat size={20} className={styles.statIconPreparing} />
          <div>
            <span className={styles.statValue}>{stats?.preparingItems || 0}</span>
            <span className={styles.statLabel}>Hazırlanıyor</span>
          </div>
        </div>
        <div className={styles.statItem}>
          <Bell size={20} className={styles.statIconReady} />
          <div>
            <span className={styles.statValue}>{stats?.readyItems || 0}</span>
            <span className={styles.statLabel}>Servis Bekliyor</span>
          </div>
        </div>
        <div className={styles.statItem}>
          <AlertTriangle size={20} className={styles.statIconUrgent} />
          <div>
            <span className={styles.statValue}>{stats?.highPriorityOrders || 0}</span>
            <span className={styles.statLabel}>Öncelikli</span>
          </div>
        </div>

        <div className={styles.controls}>
          <label className={styles.autoRefresh}>
            <input
              type="checkbox"
              checked={kitchenAutoRefresh}
              onChange={(e) => setKitchenAutoRefresh(e.target.checked)}
            />
            <span>Otomatik Yenile</span>
          </label>
          <Button
            variant="secondary"
            size="small"
            icon={RefreshCw}
            onClick={() => refetch()}
            loading={isRefetching}
          >
            Yenile
          </Button>
        </div>
      </div>

      {/* Orders Grid */}
      <motion.div className={styles.grid} layout>
        <AnimatePresence mode="popLayout">
          {sortedOrders.map((order, index) => {
            const elapsed = getElapsedTime(order.createdAt)
            const isUrgent = elapsed > 15 || order.priority === 'urgent' || order.priority === 'high'
            const allReady = order.items.every(item => item.status === 'ready')
            
            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className={`${styles.orderCard} ${isUrgent ? styles.urgent : ''}`}
                  hover={false}
                >
                  <CardContent className={styles.cardContent}>
                    {/* Header */}
                    <div className={styles.orderHeader}>
                      <div className={styles.tableInfo}>
                        <span className={styles.tableNumber}>Masa {order.tableNumber}</span>
                        <span className={`badge badge-${priorityConfig[order.priority].color}`}>
                          {priorityConfig[order.priority].label}
                        </span>
                      </div>
                      <div className={`${styles.timer} ${elapsed > 15 ? styles.late : ''}`}>
                        <Timer size={16} />
                        <span>{elapsed} dk</span>
                      </div>
                    </div>

                    {/* Items */}
                    <div className={styles.itemsList}>
                      {order.items.map((item, idx) => {
                        const StatusIcon = statusConfig[item.status].icon
                        
                        return (
                          <motion.div 
                            key={idx} 
                            className={`${styles.item} ${styles[item.status]}`}
                            layout
                          >
                            <div className={styles.itemInfo}>
                              <span className={styles.quantity}>{item.quantity}x</span>
                              <div>
                                <span className={styles.itemName}>{item.name}</span>
                                {item.notes && (
                                  <span className={styles.notes}>{item.notes}</span>
                                )}
                              </div>
                            </div>
                            
                            <div className={styles.itemActions}>
                              {item.status === 'pending' && (
                                <Button
                                  variant="outline"
                                  size="small"
                                  onClick={() => handleItemStatusChange(order.id, item.menuItemId, 'preparing')}
                                  loading={updateItemStatus.isPending}
                                >
                                  Başla
                                </Button>
                              )}
                              {item.status === 'preparing' && (
                                <Button
                                  variant="success"
                                  size="small"
                                  onClick={() => handleItemStatusChange(order.id, item.menuItemId, 'ready')}
                                  loading={updateItemStatus.isPending}
                                >
                                  Hazır
                                </Button>
                              )}
                              {item.status === 'ready' && (
                                <span className={styles.readyBadge}>
                                  <CheckCircle2 size={16} />
                                  Hazır
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>

                    {/* Footer */}
                    {!allReady && (
                      <div className={styles.orderFooter}>
                        <Button
                          variant="primary"
                          size="small"
                          fullWidth
                          icon={CheckCircle2}
                          onClick={() => handleMarkAllReady(order.id)}
                          loading={markReady.isPending}
                        >
                          Tümünü Hazır İşaretle
                        </Button>
                      </div>
                    )}
                    
                    {allReady && (
                      <div className={styles.allReadyBanner}>
                        <Bell size={20} />
                        <span>Servis Bekliyor</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {sortedOrders.length === 0 && (
        <div className={styles.emptyState}>
          <ChefHat size={64} />
          <h3>Mutfakta Sipariş Yok</h3>
          <p>Yeni siparişler burada görünecek</p>
        </div>
      )}
    </div>
  )
}

