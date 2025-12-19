import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Clock,
  AlertTriangle,
  BarChart3
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Skeleton } from '../components/ui/Skeleton'
import { 
  useDailyStats, 
  useWeeklyTrend,
  useCategoryPerformance,
  useTopSellingItems,
  useLowStockItems
} from '../hooks/useAnalytics'
import styles from './Analytics.module.css'

const COLORS = ['#d4a574', '#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export default function Analytics() {
  const { data: dailyStats, isLoading: statsLoading } = useDailyStats()
  const weeklyTrend = useWeeklyTrend()
  const { data: categoryPerformance, isLoading: categoryLoading } = useCategoryPerformance()
  const { data: topItems, isLoading: topItemsLoading } = useTopSellingItems(5)
  const lowStockItems = useLowStockItems()

  const isLoading = statsLoading || categoryLoading || topItemsLoading

  // Bugünkü istatistikler
  const todayStats = dailyStats?.[dailyStats.length - 1]

  // Grafik için veri formatla
  const chartData = dailyStats?.map(stat => ({
    date: new Date(stat.date).toLocaleDateString('tr-TR', { weekday: 'short' }),
    gelir: stat.revenue,
    siparis: stat.orders,
  })) || []

  // Kategori pasta grafiği için veri
  const pieData = categoryPerformance?.slice(0, 6).map(cat => ({
    name: cat.name,
    value: cat.totalRevenue,
    icon: cat.icon,
  })) || []

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.statsGrid}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} height="120px" borderRadius="16px" />
          ))}
        </div>
        <Skeleton height="400px" borderRadius="16px" />
      </div>
    )
  }

  return (
    <motion.div 
      className={styles.page}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Summary Stats */}
      <div className={styles.statsGrid}>
        <motion.div variants={item}>
          <Card className={styles.statCard} glow>
            <CardContent className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles.revenue}`}>
                <DollarSign size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Bugünkü Gelir</span>
                <span className={styles.statValue}>₺{todayStats?.revenue?.toLocaleString('tr-TR')}</span>
              </div>
              {weeklyTrend && (
                <div className={`${styles.trend} ${weeklyTrend.trend === 'up' ? styles.up : styles.down}`}>
                  {weeklyTrend.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  <span>{weeklyTrend.percentChange}%</span>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={styles.statCard}>
            <CardContent className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles.orders}`}>
                <ShoppingCart size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Bugünkü Sipariş</span>
                <span className={styles.statValue}>{todayStats?.orders}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={styles.statCard}>
            <CardContent className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles.avgOrder}`}>
                <BarChart3 size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Ortalama Sipariş</span>
                <span className={styles.statValue}>₺{todayStats?.avgOrderValue}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className={`${styles.statCard} ${lowStockItems.length > 0 ? styles.warning : ''}`}>
            <CardContent className={styles.statContent}>
              <div className={`${styles.statIcon} ${styles.stock}`}>
                <AlertTriangle size={24} />
              </div>
              <div className={styles.statInfo}>
                <span className={styles.statLabel}>Düşük Stok</span>
                <span className={styles.statValue}>{lowStockItems.length} ürün</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className={styles.chartsRow}>
        {/* Revenue Chart */}
        <motion.div variants={item} className={styles.chartLarge}>
          <Card>
            <CardHeader>
              <CardTitle>Haftalık Gelir Grafiği</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorGelir" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#d4a574" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#d4a574" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} tickFormatter={(value) => `₺${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#16162a', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                      formatter={(value) => [`₺${value.toLocaleString('tr-TR')}`, 'Gelir']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="gelir" 
                      stroke="#d4a574" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorGelir)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Category Distribution */}
        <motion.div variants={item} className={styles.chartSmall}>
          <Card>
            <CardHeader>
              <CardTitle>Kategori Dağılımı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: '#16162a', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                      formatter={(value) => [`₺${value.toLocaleString('tr-TR')}`, 'Gelir']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.legend}>
                  {pieData.map((entry, index) => (
                    <div key={index} className={styles.legendItem}>
                      <span className={styles.legendColor} style={{ background: COLORS[index % COLORS.length] }} />
                      <span>{entry.icon} {entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomRow}>
        {/* Top Selling Items */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>En Çok Satan Ürünler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.topItemsList}>
                {topItems?.map((item, index) => (
                  <div key={item.id} className={styles.topItem}>
                    <span className={styles.rank}>#{index + 1}</span>
                    <img src={item.image} alt={item.name} className={styles.itemImage} />
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.name}</span>
                      <span className={styles.itemStats}>{item.quantity} adet • ₺{item.revenue.toLocaleString('tr-TR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Low Stock Alert */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Stok Uyarıları</CardTitle>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className={styles.stockList}>
                  {lowStockItems.map(item => (
                    <div key={item.id} className={styles.stockItem}>
                      <AlertTriangle size={16} className={styles.warningIcon} />
                      <div className={styles.stockInfo}>
                        <span className={styles.stockName}>{item.name}</span>
                        <span className={styles.stockQty}>
                          {item.quantity} {item.unit} kaldı (min: {item.minQuantity})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.noAlerts}>
                  <span>✅</span>
                  <p>Tüm stoklar yeterli seviyede</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Orders Chart */}
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle>Günlük Sipariş Sayısı</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        background: '#16162a', 
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                      }}
                    />
                    <Bar dataKey="siparis" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

