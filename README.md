# 🍽️ Akıllı Garson - Restoran Yönetim Sistemi

React ve TanStack Query ile geliştirilmiş modern bir restoran sipariş yönetim sistemi.

## ✨ Özellikler

### TanStack Query Özellikleri
- **useQuery**: Veri çekme ve cache yönetimi
- **useMutation**: Veri güncelleme işlemleri
- **Optimistic Updates**: Anlık UI güncellemeleri
- **Query Invalidation**: Akıllı cache geçersiz kılma
- **Prefetching**: Önceden veri yükleme
- **Stale Time & GC Time**: Esnek cache stratejisi
- **Auto Refetching**: Otomatik veri yenileme
- **Query Keys Factory**: Tutarlı key yönetimi

### Uygulama Özellikleri
- 📊 **Dashboard**: Gerçek zamanlı istatistikler
- 🪑 **Masa Yönetimi**: Durum takibi ve güncelleme
- 📋 **Menü Yönetimi**: Ürün ve stok kontrolü
- 🛒 **Sipariş Sistemi**: Sepet ve sipariş oluşturma
- 📈 **Sipariş Takibi**: Durum güncellemeleri

## 🚀 Kurulum

```bash
# Bağımlılıkları yükle
npm install

# JSON Server'ı başlat (ayrı terminalde)
npm run server

# Uygulamayı başlat
npm run dev
```

## 📁 Proje Yapısı

```
src/
├── api/
│   ├── axios.js          # Axios instance ve interceptor'lar
│   └── services.js       # API servis fonksiyonları
├── hooks/
│   ├── useTables.js      # Masa hook'ları
│   ├── useMenu.js        # Menü hook'ları
│   ├── useOrders.js      # Sipariş hook'ları
│   └── useStats.js       # İstatistik hook'ları
├── components/
│   ├── Layout/           # Ana layout bileşeni
│   └── ui/               # Yeniden kullanılabilir UI bileşenleri
├── pages/
│   ├── Dashboard.jsx     # Ana sayfa
│   ├── Tables.jsx        # Masa yönetimi
│   ├── Menu.jsx          # Menü yönetimi
│   ├── Orders.jsx        # Sipariş listesi
│   └── TableOrder.jsx    # Masaya sipariş alma
└── main.jsx              # Uygulama giriş noktası
```

## 🔧 TanStack Query Kullanım Örnekleri

### Query Kullanımı
```jsx
// Basit query
const { data, isLoading, error } = useTables()

// Filtrelenmiş query
const { data } = useTableOrders(tableId)

// Combined queries
const { categories, menuItems, isLoading } = useMenuWithCategories()
```

### Mutation Kullanımı
```jsx
const updateStatus = useUpdateTableStatus()

// Optimistic update ile kullanım
updateStatus.mutate({ id: tableId, status: 'occupied' })
```

### Cache Yönetimi
```jsx
// Cache'i geçersiz kıl
queryClient.invalidateQueries({ queryKey: ['tables'] })

// Cache'i manuel güncelle
queryClient.setQueryData(['tables'], (old) => [...old, newTable])
```

## 🎨 Teknolojiler

- **React 18** - UI kütüphanesi
- **TanStack Query v5** - Server state yönetimi
- **React Router v7** - Routing
- **Framer Motion** - Animasyonlar
- **Axios** - HTTP client
- **Lucide React** - İkonlar
- **React Hot Toast** - Bildirimler
- **JSON Server** - Mock API

## 📝 API Endpoints

| Endpoint | Açıklama |
|----------|----------|
| GET /tables | Tüm masaları getir |
| PATCH /tables/:id | Masa güncelle |
| GET /menuItems | Tüm menü öğeleri |
| GET /categories | Kategoriler |
| GET /orders | Siparişler |
| POST /orders | Yeni sipariş |
| PATCH /orders/:id | Sipariş güncelle |

## 🌐 Ekran Görüntüleri

### Dashboard
- Günlük istatistikler
- Masa durumu özeti
- Aktif siparişler

### Masa Yönetimi
- Tüm masaların görünümü
- Durum değiştirme (Boş/Dolu/Rezerve)
- Bölüme göre filtreleme

### Sipariş Alma
- Kategori bazlı menü
- Sepet yönetimi
- Not ekleme özelliği

## 📄 Lisans

MIT

