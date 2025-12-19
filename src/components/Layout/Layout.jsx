import { useState } from 'react'
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
  User
} from 'lucide-react'
import { useActiveOrdersCount } from '../../hooks/useOrders'
import { useCurrentUser, useLogout } from '../../hooks/useAuth'
import { useTodayReservationsCount } from '../../hooks/useReservations'
import styles from './Layout.module.css'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/tables', icon: Grid3X3, label: 'Masalar' },
  { path: '/menu', icon: UtensilsCrossed, label: 'Menü' },
  { path: '/orders', icon: ClipboardList, label: 'Siparişler', badge: 'orders' },
  { path: '/kitchen', icon: ChefHat, label: 'Mutfak' },
  { path: '/reservations', icon: CalendarDays, label: 'Rezervasyonlar', badge: 'reservations' },
  { path: '/analytics', icon: BarChart3, label: 'Raporlar' },
]

export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showUserMenu, setShowUserMenu] = useState(false)
  
  const activeOrdersCount = useActiveOrdersCount()
  const reservationsCount = useTodayReservationsCount()
  const currentUser = useCurrentUser()
  const logoutMutation = useLogout()

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        navigate('/login')
      }
    })
  }

  const getBadgeCount = (badgeType) => {
    if (badgeType === 'orders') return activeOrdersCount
    if (badgeType === 'reservations') return reservationsCount
    return 0
  }

  return (
    <div className={styles.layout}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <motion.div
            initial={{ rotate: -10 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ChefHat size={32} className={styles.logoIcon} />
          </motion.div>
          <div className={styles.logoText}>
            <span className={styles.logoTitle}>Akıllı</span>
            <span className={styles.logoSubtitle}>Garson</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map((item) => {
            const badgeCount = item.badge ? getBadgeCount(item.badge) : 0
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `${styles.navItem} ${isActive ? styles.active : ''}`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {badgeCount > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={styles.badge}
                  >
                    {badgeCount}
                  </motion.span>
                )}
              </NavLink>
            )
          })}
        </nav>

        {/* User Info in Sidebar */}
        {currentUser && (
          <div className={styles.sidebarUser}>
            <div className={styles.userAvatar}>{currentUser.avatar}</div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{currentUser.name}</span>
              <span className={styles.userShift}>
                {currentUser.shift === 'morning' ? 'Sabah Vardiyası' : 'Akşam Vardiyası'}
              </span>
            </div>
          </div>
        )}

        <div className={styles.sidebarFooter}>
          <button 
            className={styles.iconButton}
            onClick={() => navigate('/settings')}
            title="Ayarlar"
          >
            <Settings size={20} />
          </button>
          <button 
            className={`${styles.iconButton} ${styles.logoutBtn}`}
            onClick={handleLogout}
            title="Çıkış Yap"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.pageTitle}>
              {navItems.find(item => item.path === location.pathname)?.label || 'Akıllı Garson'}
            </h1>
            <p className={styles.headerSubtitle}>
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className={styles.headerRight}>
            <button className={styles.notificationBtn}>
              <Bell size={20} />
              {activeOrdersCount > 0 && (
                <span className={styles.notificationDot} />
              )}
            </button>
            
            {/* User Dropdown */}
            <div className={styles.userDropdown}>
              <button 
                className={styles.userBtn}
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <div className={styles.userAvatarHeader}>
                  {currentUser?.avatar || '👤'}
                </div>
                <span className={styles.userNameHeader}>{currentUser?.name}</span>
                <ChevronDown size={16} className={showUserMenu ? styles.rotated : ''} />
              </button>
              
              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    className={styles.dropdownMenu}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <div className={styles.dropdownHeader}>
                      <span className={styles.dropdownAvatar}>{currentUser?.avatar}</span>
                      <div>
                        <p className={styles.dropdownName}>{currentUser?.name}</p>
                        <p className={styles.dropdownEmail}>{currentUser?.email}</p>
                      </div>
                    </div>
                    <div className={styles.dropdownDivider} />
                    <button className={styles.dropdownItem}>
                      <User size={16} />
                      <span>Profil</span>
                    </button>
                    <button 
                      className={styles.dropdownItem}
                      onClick={() => {
                        navigate('/settings')
                        setShowUserMenu(false)
                      }}
                    >
                      <Settings size={16} />
                      <span>Ayarlar</span>
                    </button>
                    <div className={styles.dropdownDivider} />
                    <button 
                      className={`${styles.dropdownItem} ${styles.logoutItem}`}
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Çıkış Yap</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={styles.content}
        >
          {children}
        </motion.div>
      </main>
      
      {/* Overlay for dropdown */}
      {showUserMenu && (
        <div 
          className={styles.overlay}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </div>
  )
}
