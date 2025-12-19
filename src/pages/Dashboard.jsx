import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  Clock, 
  Star, 
  DollarSign,
  ChefHat,
  Users,
  Utensils,
  AlertCircle,
  Bell,
  ArrowRight,
  CheckCircle,
  XCircle,
  Coffee,
  ShoppingBag,
  Calendar,
  Activity,
  Zap,
  Award,
  Target,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react'
import { Card, CardContent } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { RealtimeChart } from '../components/RealtimeChart'
import { useStats } from '../hooks/useStats'
import { useTables } from '../hooks/useTables'
import { useOrders } from '../hooks/useOrders'
import { useMenuItems } from '../hooks/useMenu'
import { useAppStore } from '../store/useAppStore'
import styles from './Dashboard.module.css'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

// Saat formatı
const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('tr-TR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

// Zaman farkı
const getTimeAgo = (dateString) => {
  const now = new Date()
  const date = new Date(dateString)
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  
  if (diffMins < 1) return 'Az önce'
  if (diffMins < 60) return `${diffMins} dk önce`
  const hours = Math.floor(diffMins / 60)
  return `${hours} saat önce`
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useStats()
  const { data: tables, isLoading: tablesLoading } = useTables()
  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useOrders()
  const { data: menuItems } = useMenuItems()
  const activeWaiter = useAppStore((state) => state.activeWaiter)

  const [isRefreshing, setIsRefreshing] = useState(false)

  const isLoading = statsLoading || tablesLoading || ordersLoading

  // İstatistikleri hesapla
  const dashboardStats = useMemo(() => {
    if (!tables || !orders) return null

    const availableTables = tables.filter(t => t.status === 'available').length
    const occupiedTables = tables.filter(t => t.status === 'occupied').length
    const reservedTables = tables.filter(t => t.status === 'reserved').length
    
    const activeOrders = orders.filter(o => 
      ['pending', 'preparing', 'ready'].includes(o.status)
    )
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const preparingOrders = orders.filter(o => o.status === 'preparing').length
    const readyOrders = orders.filter(o => o.status === 'ready').length
    const completedToday = orders.filter(o => o.status === 'served').length
    
    const totalRevenue = orders
      .filter(o => ['served', 'paid'].includes(o.status))
      .reduce((sum, o) => sum + o.totalAmount, 0)

    // En çok satan ürünler
    const itemSales = {}
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!itemSales[item.menuItemId]) {
          itemSales[item.menuItemId] = 0
        }
        itemSales[item.menuItemId] += item.quantity
      })
    })

    const topItems = Object.entries(itemSales)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({
        item: menuItems?.find(m => m.id === id),
        count
      }))
      .filter(x => x.item)

    // Doluluk oranı
    const occupancyRate = tables.length > 0 
      ? Math.round((occupiedTables / tables.length) * 100) 
      : 0

    return {
      availableTables,
      occupiedTables,
      reservedTables,
      totalTables: tables.length,
      activeOrders: activeOrders.length,
      pendingOrders,
      preparingOrders,
      readyOrders,
      completedToday,
      totalRevenue,
      topItems,
      occupancyRate,
      recentOrders: activeOrders.slice(0, 6)
    }
  }, [tables, orders, menuItems])

  // Yenile
  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([refetchStats(), refetchOrders()])
    setTimeout(() => setIsRefreshing(false), 500)
  }

  // Stat kartları
  const statCards = [
    {
      title: 'Günlük Gelir',
      value: `₺${(dashboardStats?.totalRevenue || stats?.todayRevenue || 0).toLocaleString('tr-TR')}`,
      icon: DollarSign,
      color: 'gold',
      trend: '+12%',
      trendUp: true,
      subtitle: 'Bugün'
    },
    {
      title: 'Tamamlanan',
      value: dashboardStats?.completedToday || stats?.todayOrders || 0,
      icon: CheckCircle,
      color: 'emerald',
      trend: '+8',
      trendUp: true,
      subtitle: 'Sipariş'
    },
    {
      title: 'Aktif Sipariş',
      value: dashboardStats?.activeOrders || 0,
      icon: Activity,
      color: 'sapphire',
      trend: dashboardStats?.pendingOrders > 0 ? `${dashboardStats.pendingOrders} bekliyor` : 'Tümü hazır',
      trendUp: dashboardStats?.pendingOrders === 0,
      subtitle: 'Şu an'
    },
    {
      title: 'Doluluk',
      value: `%${dashboardStats?.occupancyRate || 0}`,
      icon: Target,
      color: 'amethyst',
      trend: `${dashboardStats?.occupiedTables || 0}/${dashboardStats?.totalTables || 0}`,
      trendUp: true,
      subtitle: 'Masa'
    },
  ]

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height="140px" borderRadius="20px" />
          ))}
        </div>
        <div className={styles.mainGrid}>
          <Skeleton height="400px" borderRadius="20px" />
          <Skeleton height="400px" borderRadius="20px" />
        </div>
      </div>
    )
  }

  return (
    <motion.div 
      className={styles.dashboard}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div className={styles.dashboardHeader} variants={item}>
        <div className={styles.greeting}>
          <h1>Merhaba{activeWaiter?.name ? `, ${activeWaiter.name.split(' ')[0]}` : ''} 👋</h1>
          <p>İşte bugünün özeti</p>
        </div>
        <div className={styles.headerActions}>
          <span className={styles.currentTime}>
            <Clock size={16} />
            {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </span>
          <motion.button 
            className={`${styles.refreshBtn} ${isRefreshing ? styles.spinning : ''}`}
            onClick={handleRefresh}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>
      </motion.div>

      {/* İstatistik Kartları */}
      <div className={styles.statsGrid}>
        {statCards.map((stat, index) => (
          <motion.div key={stat.title} variants={item}>
            <Card className={`${styles.statCard} ${styles[stat.color]}`}>
              <CardContent className={styles.statContent}>
                <div className={styles.statHeader}>
                  <div className={styles.statIcon}>
                    <stat.icon size={22} />
                  </div>
                  <div className={`${styles.trend} ${stat.trendUp ? styles.up : styles.down}`}>
                    {stat.trendUp ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{stat.value}</span>
                  <span className={styles.statTitle}>{stat.title}</span>
                </div>
                <span className={styles.statSubtitle}>{stat.subtitle}</span>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Realtime Chart - İleri Teknoloji */}
      <motion.div variants={item} className={styles.realtimeSection}>
        <RealtimeChart />
      </motion.div>

      {/* Ana İçerik - 3 Sütun */}
      <div className={styles.mainGrid}>
        {/* Sol - Masa Durumu */}
        <motion.div variants={item} className={styles.tableSection}>
          <Card className={styles.tableCard}>
            <CardContent>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <BarChart3 size={20} />
                  <h3>Masa Durumu</h3>
                </div>
                <button 
                  className={styles.viewAllBtn}
                  onClick={() => navigate('/tables')}
                >
                  Tümü <ArrowRight size={14} />
                </button>
              </div>

              {/* Mini İstatistikler */}
              <div className={styles.miniStats}>
                <div className={`${styles.miniStat} ${styles.available}`}>
                  <span className={styles.miniValue}>{dashboardStats?.availableTables}</span>
                  <span className={styles.miniLabel}>Boş</span>
                </div>
                <div className={`${styles.miniStat} ${styles.occupied}`}>
                  <span className={styles.miniValue}>{dashboardStats?.occupiedTables}</span>
                  <span className={styles.miniLabel}>Dolu</span>
                </div>
                <div className={`${styles.miniStat} ${styles.reserved}`}>
                  <span className={styles.miniValue}>{dashboardStats?.reservedTables}</span>
                  <span className={styles.miniLabel}>Rezerve</span>
                </div>
              </div>

              {/* Masa Grid */}
              <div className={styles.tableGrid}>
                {tables?.map((table) => (
                  <motion.div
                    key={table.id}
                    className={`${styles.tableItem} ${styles[table.status]}`}
                    whileHover={{ scale: 1.08, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate(`/tables/${table.id}/order`)}
                  >
                    <span className={styles.tableNumber}>{table.number}</span>
                    <span className={styles.tableCapacity}>
                      <Users size={10} /> {table.capacity}
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Orta - Aktif Siparişler */}
        <motion.div variants={item} className={styles.ordersSection}>
          <Card className={styles.ordersCard}>
            <CardContent>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <Activity size={20} />
                  <h3>Aktif Siparişler</h3>
                </div>
                <div className={styles.orderBadges}>
                  {dashboardStats?.pendingOrders > 0 && (
                    <span className={`${styles.badge} ${styles.pending}`}>
                      {dashboardStats.pendingOrders} bekliyor
                    </span>
                  )}
                  {dashboardStats?.readyOrders > 0 && (
                    <span className={`${styles.badge} ${styles.ready}`}>
                      {dashboardStats.readyOrders} hazır
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.ordersList}>
                <AnimatePresence mode="popLayout">
                  {dashboardStats?.recentOrders?.map((order, index) => {
                    const table = tables?.find(t => t.id === order.tableId)
                    const statusConfig = {
                      pending: { label: 'Bekliyor', icon: Clock, color: 'warning' },
                      preparing: { label: 'Hazırlanıyor', icon: ChefHat, color: 'info' },
                      ready: { label: 'Hazır!', icon: Utensils, color: 'success' },
                    }
                    const status = statusConfig[order.status]
                    
                    return (
                      <motion.div 
                        key={order.id} 
                        className={`${styles.orderItem} ${styles[order.status]}`}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => navigate('/orders')}
                      >
                        <div className={styles.orderLeft}>
                          <div className={`${styles.orderIcon} ${styles[order.status]}`}>
                            <status.icon size={16} />
                          </div>
                          <div className={styles.orderInfo}>
                            <span className={styles.orderTable}>
                              Masa {table?.number || '?'}
                            </span>
                            <span className={styles.orderMeta}>
                              {order.items?.length} ürün • {getTimeAgo(order.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className={styles.orderRight}>
                          <span className={styles.orderAmount}>₺{order.totalAmount}</span>
                          <span className={`${styles.orderStatus} ${styles[order.status]}`}>
                            {status.label}
                          </span>
                        </div>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {dashboardStats?.activeOrders === 0 && (
                  <div className={styles.emptyState}>
                    <Coffee size={48} />
                    <p>Şu an aktif sipariş yok</p>
                    <span>Yeni siparişler burada görünecek</span>
                  </div>
                )}
              </div>

              <button 
                className={styles.viewOrdersBtn}
                onClick={() => navigate('/orders')}
              >
                Tüm Siparişleri Görüntüle
                <ArrowRight size={16} />
              </button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sağ - Popüler & Hızlı İşlemler */}
        <motion.div variants={item} className={styles.rightSection}>
          {/* En Çok Satan */}
          <Card className={styles.topItemsCard}>
            <CardContent>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <Award size={20} />
                  <h3>En Çok Satan</h3>
                </div>
              </div>

              <div className={styles.topItemsList}>
                {dashboardStats?.topItems?.map((item, index) => (
                  <div key={item.item.id} className={styles.topItem}>
                    <span className={styles.topRank}>#{index + 1}</span>
                    <img 
                      src={item.item.image} 
                      alt={item.item.name}
                      className={styles.topItemImage}
                    />
                    <div className={styles.topItemInfo}>
                      <span className={styles.topItemName}>{item.item.name}</span>
                      <span className={styles.topItemCount}>{item.count} adet satıldı</span>
                    </div>
                  </div>
                ))}

                {(!dashboardStats?.topItems || dashboardStats.topItems.length === 0) && (
                  <div className={styles.emptyTopItems}>
                    <PieChart size={32} />
                    <span>Henüz satış verisi yok</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Hızlı İşlemler */}
          <Card className={styles.quickActionsCard}>
            <CardContent>
              <h4>Hızlı İşlemler</h4>
              <div className={styles.quickGrid}>
                <motion.button
                  className={styles.quickBtn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/tables')}
                >
                  <Zap size={20} />
                  <span>Yeni Sipariş</span>
                </motion.button>
                <motion.button
                  className={styles.quickBtn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/kitchen')}
                >
                  <ChefHat size={20} />
                  <span>Mutfak</span>
                </motion.button>
                <motion.button
                  className={styles.quickBtn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/reservations')}
                >
                  <Calendar size={20} />
                  <span>Rezervasyon</span>
                </motion.button>
                <motion.button
                  className={styles.quickBtn}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/analytics')}
                >
                  <BarChart3 size={20} />
                  <span>Raporlar</span>
                </motion.button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alt Bilgi Kartları */}
      <div className={styles.bottomGrid}>
        <motion.div variants={item}>
          <Card className={styles.infoCard}>
            <CardContent className={styles.infoContent}>
              <div className={styles.infoIcon}>
                <ShoppingBag size={24} />
              </div>
              <div className={styles.infoText}>
                <span className={styles.infoValue}>{orders?.length || 0}</span>
                <span className={styles.infoLabel}>Toplam Sipariş</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={styles.infoCard}>
            <CardContent className={styles.infoContent}>
              <div className={styles.infoIcon}>
                <Clock size={24} />
              </div>
              <div className={styles.infoText}>
                <span className={styles.infoValue}>{stats?.avgOrderTime || 12} dk</span>
                <span className={styles.infoLabel}>Ort. Hazırlama</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={styles.infoCard}>
            <CardContent className={styles.infoContent}>
              <div className={styles.infoIcon}>
                <Star size={24} />
              </div>
              <div className={styles.infoText}>
                <span className={styles.infoValue}>{stats?.customerSatisfaction || 4.8}</span>
                <span className={styles.infoLabel}>Müşteri Puanı</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={styles.infoCard}>
            <CardContent className={styles.infoContent}>
              <div className={styles.infoIcon}>
                <Users size={24} />
              </div>
              <div className={styles.infoText}>
                <span className={styles.infoValue}>{dashboardStats?.occupiedTables * 3 || 0}</span>
                <span className={styles.infoLabel}>Tahmini Müşteri</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}
