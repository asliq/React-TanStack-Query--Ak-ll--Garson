import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Grid3X3, 
  UtensilsCrossed, 
  ClipboardList,
  Bell,
  Settings,
  ChefHat,
  CalendarDays,
  BarChart3,
  LogOut,
  ChevronDown,
  User,
  Wifi,
  WifiOff,
  Clock,
  HelpCircle,
  Command
} from 'lucide-react'
import { useActiveOrdersCount } from '../../hooks/useOrders'
import { useCurrentUser, useLogout } from '../../hooks/useAuth'
import { useTodayReservationsCount } from '../../hooks/useReservations'
import { useNotifications, NotificationPanel } from '../NotificationProvider'
import { CommandPalette } from '../CommandPalette'
import { LiveClock } from '../LiveClock'
import { QuickActions } from '../QuickActions'
import { PerformanceMonitor } from '../PerformanceMonitor'
import { ActivityFeed } from '../ActivityFeed'
import { VoiceCommand } from '../VoiceCommand'
import styles from './Layout.module.css'

const mainNavItems = [
  { path: '/', icon: LayoutDashboard, label: 'Anasayfa' },
  { path: '/tables', icon: Grid3X3, label: 'Masalar' },
  { path: '/orders', icon: ClipboardList, label: 'Siparişler', badge: 'orders' },
  { path: '/kitchen', icon: ChefHat, label: 'Mutfak' },
]

const secondaryNavItems = [
  { path: '/menu', icon: UtensilsCrossed, label: 'Menü Yönetimi' },
  { path: '/reservations', icon: CalendarDays, label: 'Rezervasyonlar', badge: 'reservations' },
  { path: '/analytics', icon: BarChart3, label: 'Raporlar' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  const activeOrdersCount = useActiveOrdersCount()
  const reservationsCount = useTodayReservationsCount()
  const currentUser = useCurrentUser()
  const logoutMutation = useLogout()
  const { unreadCount, setShowPanel, showPanel } = useNotifications()

  // Saat güncelleme
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Online durumu
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => navigate('/login')
    })
  }

  const getBadgeCount = (badgeType) => {
    if (badgeType === 'orders') return activeOrdersCount
    if (badgeType === 'reservations') return reservationsCount
    return 0
  }

  const allNavItems = [...mainNavItems, ...secondaryNavItems]
  const currentPage = allNavItems.find(item => item.path === location.pathname)

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        {/* Logo Area */}
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>
            <ChefHat size={22} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>AKILLIGARSON</span>
            <span className={styles.logoVersion}>POS v2.1</span>
          </div>
        </div>

        {/* Connection Status */}
        <div className={styles.statusBar}>
          <div className={`${styles.statusIndicator} ${isOnline ? styles.online : styles.offline}`}>
            {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{isOnline ? 'Bağlı' : 'Çevrimdışı'}</span>
          </div>
          <div className={styles.clock}>
            <Clock size={12} />
            <span>{currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>

        {/* Main Navigation */}
        <nav className={styles.nav}>
          <div className={styles.navSection}>
            <span className={styles.navLabel}>İŞLEMLER</span>
            {mainNavItems.map((item) => {
              const badgeCount = item.badge ? getBadgeCount(item.badge) : 0
              const isActive = location.pathname === item.path
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <div className={styles.navIconWrapper}>
                    <item.icon size={18} />
                  </div>
                  <span className={styles.navText}>{item.label}</span>
                  {badgeCount > 0 && (
                    <span className={styles.navBadge}>{badgeCount}</span>
                  )}
                  {isActive && <div className={styles.activeIndicator} />}
                </NavLink>
              )
            })}
          </div>

          <div className={styles.navSection}>
            <span className={styles.navLabel}>YÖNETİM</span>
            {secondaryNavItems.map((item) => {
              const badgeCount = item.badge ? getBadgeCount(item.badge) : 0
              const isActive = location.pathname === item.path
              
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                >
                  <div className={styles.navIconWrapper}>
                    <item.icon size={18} />
                  </div>
                  <span className={styles.navText}>{item.label}</span>
                  {badgeCount > 0 && (
                    <span className={styles.navBadge}>{badgeCount}</span>
                  )}
                  {isActive && <div className={styles.activeIndicator} />}
                </NavLink>
              )
            })}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          <button 
            className={styles.quickBtn}
            onClick={() => navigate('/settings')}
          >
            <Settings size={16} />
            <span>Ayarlar</span>
          </button>
          <button className={styles.quickBtn}>
            <HelpCircle size={16} />
            <span>Yardım</span>
          </button>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className={styles.shortcutHint}>
          <Command size={12} />
          <span>K</span>
          <span className={styles.shortcutLabel}>Hızlı Arama</span>
        </div>

        {/* User Panel */}
        <div className={styles.userPanel}>
          <div className={styles.userAvatar}>
            {currentUser?.avatar || '👤'}
          </div>
          <div className={styles.userDetails}>
            <span className={styles.userName}>{currentUser?.name || 'Kullanıcı'}</span>
            <span className={styles.userRole}>
              {currentUser?.shift === 'morning' ? 'Sabah Vardiyası' : 'Akşam Vardiyası'}
            </span>
          </div>
          <button 
            className={styles.logoutBtn}
            onClick={handleLogout}
            title="Çıkış Yap"
          >
            <LogOut size={16} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.breadcrumb}>
              <span className={styles.breadcrumbHome}>Anasayfa</span>
              {currentPage && currentPage.path !== '/' && (
                <>
                  <span className={styles.breadcrumbSep}>/</span>
                  <span className={styles.breadcrumbCurrent}>{currentPage.label}</span>
                </>
              )}
            </div>
            <h1 className={styles.pageTitle}>
              {currentPage?.label || 'Dashboard'}
            </h1>
          </div>
          
          <div className={styles.headerRight}>
            {/* Live Clock */}
            <LiveClock />
            
            {/* Activity Feed */}
            <ActivityFeed />

            {/* Notifications */}
            <button 
              className={`${styles.headerBtn} ${showPanel ? styles.active : ''}`}
              onClick={() => setShowPanel(!showPanel)}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className={styles.headerBadge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            
            <NotificationPanel />
            
            {/* User Menu */}
            <div className={styles.userDropdown}>
              <button 
                className={styles.userBtn}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.userAvatarSmall}>
                  {currentUser?.avatar || '👤'}
                </div>
                <ChevronDown size={14} className={showUserMenu ? styles.rotated : ''} />
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    className={styles.dropdownMenu}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className={styles.dropdownHeader}>
                      <div className={styles.dropdownAvatar}>{currentUser?.avatar}</div>
                      <div>
                        <p className={styles.dropdownName}>{currentUser?.name}</p>
                        <p className={styles.dropdownEmail}>{currentUser?.email}</p>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownItem}>
                      <User size={14} />
                      <span>Profil</span>
                    </button>
                    <button 
                      className={styles.dropdownItem}
                      onClick={() => {
                        navigate('/settings')
                        setShowUserMenu(false)
                      }}
                    >
                      <Settings size={14} />
                      <span>Ayarlar</span>
                    </button>
                    <div className={styles.dropdownDivider} />
                    <button 
                      className={`${styles.dropdownItem} ${styles.logoutItem}`}
                      onClick={handleLogout}
                    >
                      <LogOut size={14} />
                      <span>Çıkış Yap</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className={styles.content}
        >
          {children}
        </motion.div>
      </main>
      
      {/* Overlay */}
      {showUserMenu && (
        <div 
          className={styles.overlay}
          onClick={() => setShowUserMenu(false)}
        />
      )}
      
      {/* Advanced Components */}
      <CommandPalette />
      <QuickActions />
      <PerformanceMonitor />
      <VoiceCommand />
    </div>
  )
}
