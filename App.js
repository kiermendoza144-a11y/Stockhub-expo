import SQLitePOSScreen from './src/screens/SQLitePOSScreen';
import { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Modal,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

// ── Figma tokens (Lab_Ex_04) ──────────────────────────────────
const C = {
  primary: '#5003C0',
  deep: '#3A0291',
  light: '#7A3FE0',
  lavBg: '#EFE9FB',
  lav: '#CDBBF0',
  ink: '#1A1530',
  muted: '#6B6880',
  card: '#F5F0FD',
  row: '#F6F5FA',
  line: '#E3DEED',
  chip: '#F0EDF6',
  accent: '#FF8A1F',
  accentBg: '#FFF6E9',
  success: '#147A4F',
  successBg: '#E3F5ED',
  error: '#B3262B',
  errorBg: '#FCEBED',
  warning: '#996100',
  warningBg: '#FFF2DB',
  stockGreen: '#21A16B',
  stockOrange: '#F5A624',
};

function peso(n) {
  const num = Number(n) || 0;
  return `\u20B1${Math.abs(num).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const initialProducts = [
  { id: 'cc001', name: 'Coca-Cola 1.5L', sku: 'CC001', qty: 24, maxQty: 48, price: 85.0, category: 'Beverages', icon: 'cola' },
  { id: 'ln002', name: 'Lucky Me Noodles', sku: 'LN002', qty: 48, maxQty: 48, price: 14.0, category: 'Groceries', icon: 'noodles' },
  { id: 'mi003', name: 'Milo 200g', sku: 'MI003', qty: 32, maxQty: 48, price: 62.0, category: 'Groceries', icon: 'milo' },
  { id: 'or004', name: 'Oreo Cookies', sku: 'OR004', qty: 8, maxQty: 48, price: 35.0, category: 'Snacks', icon: 'oreo' },
  { id: 'nc005', name: 'Nescaf\u00E9 Classic 100g', sku: 'NC005', qty: 0, maxQty: 48, price: 165.0, category: 'Beverages', icon: 'coffee' },
];

const reportData = {
  Daily: { total: '\u20B128,450', change: '+12%', orders: '36', avg: '\u20B1312', profit: '\u20B18.4K', profitChange: '+11%' },
  Weekly: { total: '\u20B1128,540', change: '+8.4%', orders: '412', avg: '\u20B1312', profit: '\u20B138.2K', profitChange: '+11%' },
  Monthly: { total: '\u20B1412,800', change: '+5.2%', orders: '1,480', avg: '\u20B1279', profit: '\u20B196.4K', profitChange: '+6.8%' },
};

function statusOf(qty) {
  if (qty <= 0) return 'Out of Stock';
  if (qty <= 10) return 'Low Stock';
  return 'In Stock';
}

// ── primitives ────────────────────────────────────────────────
// Prototype status bar: time left, signal/wifi/battery right, no Dynamic Island.
function FakeStatusBar() {
  return (
    <View style={styles.statusBar}>
      <Text style={styles.statusTime}>9:41</Text>
      <View style={styles.statusRight}>
        <View style={styles.signalBars}>
          <View style={[styles.sigBar, { height: 4 }]} />
          <View style={[styles.sigBar, { height: 6 }]} />
          <View style={[styles.sigBar, { height: 8 }]} />
          <View style={[styles.sigBar, { height: 11 }]} />
        </View>
        <MaterialCommunityIcons name="wifi" size={15} color={C.ink} />
        <View style={styles.battery}>
          <View style={styles.batteryFill} />
        </View>
      </View>
    </View>
  );
}

function HomeIndicator() {
  return (
    <View style={styles.homeWrap}>
      <View style={styles.homeBar} />
    </View>
  );
}

function StatusPill({ status }) {
  const map = {
    'In Stock': { bg: C.successBg, fg: C.success },
    'Low Stock': { bg: C.warningBg, fg: C.warning },
    'Out of Stock': { bg: C.errorBg, fg: C.error },
  };
  const s = map[status] || map['In Stock'];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.pillText, { color: s.fg }]}>{status}</Text>
    </View>
  );
}

function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, { backgroundColor: selected ? C.primary : C.chip }]}
    >
      <Text style={[styles.chipText, { color: selected ? '#fff' : C.muted }]}>{label}</Text>
    </TouchableOpacity>
  );
}

function AccentButton({ label, onPress, disabled, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.accentBtn, { opacity: disabled ? 0.5 : 1 }]}
    >
      <View style={styles.accentBtnRow}>
        {icon === 'lock' && <Feather name="lock" size={18} color={C.ink} />}
        <Text style={styles.accentBtnText}>{label}</Text>
        {icon === 'arrow' && <Feather name="arrow-right" size={20} color={C.ink} />}
      </View>
    </TouchableOpacity>
  );
}

function ProductThumb({ icon }) {
  return (
    <View style={styles.thumb}>
      {icon === 'cola' && (
        <View style={{ width: 16, height: 34 }}>
          <View style={{ marginLeft: 4, width: 8, height: 4, backgroundColor: C.ink, borderRadius: 1 }} />
          <View style={{ marginLeft: 5, width: 6, height: 8, backgroundColor: '#C81E33' }} />
          <View style={{ width: 16, height: 22, backgroundColor: '#D6253A', borderRadius: 5, alignItems: 'center', paddingTop: 4 }}>
            <View style={{ width: 16, height: 9, backgroundColor: '#fff' }}>
              <View style={{ marginLeft: 3, marginTop: 3, width: 10, height: 3, backgroundColor: '#D6253A', borderRadius: 2 }} />
            </View>
          </View>
        </View>
      )}
      {icon === 'noodles' && (
        <View style={{ width: 33, height: 31 }}>
          <View style={{ width: 33, height: 10, backgroundColor: '#D6253A', borderRadius: 5 }} />
          <View style={{ width: 33, height: 21, backgroundColor: '#F59E0B', borderRadius: 5, marginTop: -4, alignItems: 'center', paddingTop: 4 }}>
            <View style={{ width: 19, height: 12, backgroundColor: '#FFEDCC', borderRadius: 9 }} />
          </View>
        </View>
      )}
      {icon === 'milo' && (
        <View style={{ width: 22, height: 37, backgroundColor: '#2E8B3A', borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ height: 6, backgroundColor: '#1F6B28' }} />
          <View style={{ marginTop: 6, height: 12, backgroundColor: '#C7E6A0', alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 14, height: 4, backgroundColor: '#2E8B3A', borderRadius: 2 }} />
          </View>
        </View>
      )}
      {icon === 'oreo' && (
        <View style={{ width: 37, height: 24, backgroundColor: '#1E5BCC', borderRadius: 6, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ width: 18, height: 18, backgroundColor: '#2B2B30', borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 8, height: 8, backgroundColor: '#EDEDF0', borderRadius: 4 }} />
          </View>
        </View>
      )}
      {(icon === 'coffee' || !icon) && (
        <View style={{ width: 20, height: 37 }}>
          <View style={{ height: 8, backgroundColor: '#BF382B', borderRadius: 2 }} />
          <View style={{ height: 29, backgroundColor: '#7A2E1C', borderRadius: 3, alignItems: 'center', paddingTop: 6 }}>
            <View style={{ width: 20, height: 10, backgroundColor: '#F2E3C1', alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 12, height: 4, backgroundColor: '#BF382B', borderRadius: 2 }} />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

function StockBar({ qty, maxQty }) {
  const pct = Math.max(0, Math.min(100, (qty / (maxQty || 48)) * 100));
  const fill = qty <= 0 ? 'transparent' : qty <= 10 ? C.stockOrange : C.stockGreen;
  return (
    <View style={styles.stockTrack}>
      <View style={[styles.stockFill, { width: `${pct}%`, backgroundColor: fill }]} />
    </View>
  );
}

function BottomNav({ active, onNav }) {
  const tabs = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'inventory', label: 'Inventory', icon: 'package' },
    { id: 'pos', label: 'POS' },
    { id: 'reports', label: 'Reports', icon: 'bar-chart-2' },
    { id: 'more', label: 'More', icon: 'more-horizontal' },
  ];
  return (
    <View style={styles.bottomNav}>
      <View style={styles.tabRow}>
        {tabs.map((t) => {
          if (t.id === 'pos') {
            return (
              <View key="pos" style={styles.tab}>
                <Text style={styles.posSpacer} />
                <Text style={[styles.tabLabel, { color: active === 'pos' ? C.primary : C.muted }]}>POS</Text>
              </View>
            );
          }
          const isActive = active === t.id;
          return (
            <TouchableOpacity key={t.id} onPress={() => onNav(t.id)} style={styles.tab}>
              <Feather name={t.icon} size={24} color={isActive ? C.primary : C.muted} />
              <Text style={[styles.tabLabel, { color: isActive ? C.primary : C.muted }]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity onPress={() => onNav('pos')} style={styles.posButton}>
        <Feather name="shopping-cart" size={26} color="#fff" />
      </TouchableOpacity>
      <HomeIndicator />
    </View>
  );
}

// ── app ───────────────────────────────────────────────────────
export default function App() {
  const [route, setRoute] = useState('landing');
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState({ cc001: 1, ln002: 2, mi003: 1 });
  const [transactions, setTransactions] = useState([
    { id: 'ord-1042', title: 'Order #1042', subtitle: '2 min ago \u00B7 Cash', amount: 186.0 },
    { id: 'ord-1041', title: 'Order #1041', subtitle: '18 min ago \u00B7 GCash', amount: 94.5 },
    { id: 'ord-1040', title: 'Order #1040', subtitle: '45 min ago \u00B7 Card', amount: 320.0 },
  ]);
  const [invSearch, setInvSearch] = useState('');
  const [invFilter, setInvFilter] = useState('All');
  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState('All');
  const [posAdding, setPosAdding] = useState(false);
  const [summary, setSummary] = useState({ subtotal: 175, tax: 21, discount: 10, total: 186 });
  const [payMethod, setPayMethod] = useState('cash');
  const [received, setReceived] = useState('200');
  const [showMore, setShowMore] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newQty, setNewQty] = useState('');
  const [toast, setToast] = useState('');
  const [reportTab, setReportTab] = useState('Weekly');

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  const handleNav = (id) => {
    if (id === 'more') { setShowMore(true); return; }
    setShowMore(false);
    setRoute(id);
  };

  const setQty = (id, qty) => {
    const prod = products.find((p) => p.id === id);
    const max = prod ? prod.qty : 99;
    const q = Math.max(0, Math.min(max, qty));
    setCart((c) => {
      if (q <= 0) { const n = { ...c }; delete n[id]; return n; }
      return { ...c, [id]: q };
    });
  };

  const cartLines = useMemo(() => Object.entries(cart).map(([id, qty]) => {
    const p = products.find((x) => x.id === id);
    if (!p || qty <= 0) return null;
    return { ...p, cartQty: qty };
  }).filter(Boolean), [cart, products]);

  const calc = useMemo(() => {
    const subtotal = cartLines.reduce((s, l) => s + l.price * l.cartQty, 0);
    const tax = subtotal * 0.12;
    const discount = subtotal > 0 ? 10 : 0;
    return { subtotal, tax, discount, total: Math.max(0, subtotal + tax - discount) };
  }, [cartLines]);

  const lowCount = useMemo(() => products.filter((p) => p.qty <= 10).length + 12, [products]);
  const totalProducts = 243 + products.length; // 248 baseline to match Figma
  const recvVal = parseFloat(received) || 0;
  const change = Math.max(0, recvVal - summary.total);

  const completePayment = () => {
    const total = summary.total;
    const recv = parseFloat(received) || 0;
    if (recv < total || total <= 0) { notify('Insufficient amount received.'); return; }
    const orderNum = 1043 + transactions.length - 3;
    const methodLabel = payMethod === 'cash' ? 'Cash' : payMethod === 'card' ? 'Card' : payMethod === 'gcash' ? 'GCash' : 'Bank';
    setProducts((ps) => ps.map((p) => {
      const q = cart[p.id] || 0;
      return q > 0 ? { ...p, qty: Math.max(0, p.qty - q) } : p;
    }));
    setTransactions((t) => [{ id: `ord-${Date.now()}`, title: `Order #${orderNum}`, subtitle: `Just now \u00B7 ${methodLabel}`, amount: total }, ...t]);
    setCart({});
    setReceived('');
    setRoute('dashboard');
    notify(`Payment completed. Change ${peso(recv - total)}.`);
  };

  const restock = (id) => {
    setProducts((ps) => ps.map((p) => (p.id === id ? { ...p, qty: Math.min(p.maxQty, p.qty + 12) } : p)));
    notify('Restocked +12 pcs.');
  };

  const d = reportData[reportTab];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.phone}>

        {route === 'landing' && (
          <ScrollView contentContainerStyle={styles.container}>
            <FakeStatusBar />
            <View style={styles.logoRow}>
              <View style={styles.logoMark}>
                <Feather name="package" size={26} color="#fff" />
                <View style={styles.logoBadge}><Feather name="check" size={11} color={C.ink} /></View>
              </View>
              <View>
                <Text style={styles.logoText}>Stock<Text style={{ color: C.primary }}>Hub</Text></Text>
                <Text style={styles.tagline}>Smart Stock. Smooth Sales.</Text>
              </View>
            </View>

            <View style={styles.hero}>
              <View style={styles.heroCircle1} />
              <View style={styles.heroCircle2} />
              <View style={styles.heroPillar} />
              <View style={styles.heroCounterTop} />
              <View style={styles.heroCounter} />
              <View style={styles.heroTablet}>
                <View style={styles.heroScreen}>
                  <View style={styles.heroBar1} />
                  <View style={styles.heroBar2} />
                  <View style={styles.heroBtn} />
                </View>
              </View>
              <View style={styles.floatSales}>
                <View style={[styles.floatIcon, { backgroundColor: C.lavBg }]}><Feather name="trending-up" size={18} color={C.primary} /></View>
                <View><Text style={styles.floatLabel}>Today's Sales</Text><Text style={styles.floatValue}>{"\u20B128,450"}</Text></View>
              </View>
              <View style={styles.floatLow}>
                <View style={[styles.floatIcon, { backgroundColor: C.accentBg }]}><Feather name="alert-triangle" size={18} color={C.accent} /></View>
                <Text style={styles.floatLabel}>Low Stock</Text><Text style={styles.floatValue}>14 items</Text>
              </View>
            </View>

            <Text style={styles.h1}>Manage Your Store,{'\n'}<Text style={{ color: C.primary }}>All in One Place</Text></Text>
            <Text style={styles.bodyCenter}>Track inventory, sell faster, and grow with real-time reports.</Text>
            <View style={styles.dots}><View style={styles.dotActive} /><View style={styles.dot} /><View style={styles.dot} /></View>
            <AccentButton label="Get Started" icon="arrow" onPress={() => { setRoute('dashboard'); notify('Welcome to StockHub!'); }} />
            <TouchableOpacity onPress={() => setRoute('dashboard')} style={styles.loginLink}>
              <Text style={styles.mutedCenter}>Already have an account? <Text style={{ color: C.primary }}>Log in</Text></Text>
            </TouchableOpacity>
            <HomeIndicator />
          </ScrollView>
        )}

        {route === 'dashboard' && (
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
              <FakeStatusBar />
              <View style={styles.topBar}>
                <Feather name="menu" size={24} color={C.ink} />
                <Text style={styles.headerCenter}>Dashboard</Text>
                <View><Feather name="bell" size={24} color={C.ink} /><View style={styles.bellDot} /></View>
              </View>
              <View style={styles.greetingRow}>
                <View style={styles.avatar}><Text style={styles.avatarText}>SO</Text></View>
                <View style={{ flex: 1 }}><Text style={styles.caption}>Good Morning,</Text><Text style={styles.h3}>Store Owner</Text></View>
                <Text style={styles.caption}>Sun, Oct 4</Text>
              </View>
              <View style={styles.salesCard}>
                <View style={styles.salesDeco1} /><View style={styles.salesDeco2} />
                <Text style={styles.salesLabel}>Today's Sales</Text>
                <Text style={styles.salesValue}>{"\u20B128,450.00"}</Text>
                <View style={styles.trendChip}><Feather name="trending-up" size={14} color="#fff" /><Text style={styles.trendText}> +12% vs yesterday</Text></View>
                <View style={styles.sparkDot} />
              </View>
              <View style={styles.gridRow}>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: C.primary }]}><Feather name="package" size={18} color="#fff" /></View>
                  <View><Text style={styles.h2}>{totalProducts}</Text><Text style={styles.caption}>Total Products</Text></View>
                </View>
                <View style={[styles.statCard, { backgroundColor: C.accentBg, borderColor: C.accentBg }]}>
                  <View style={[styles.statIcon, { backgroundColor: C.accent }]}><Feather name="alert-triangle" size={18} color="#fff" /></View>
                  <View><Text style={styles.h2}>{lowCount}</Text><Text style={styles.caption}>Low Stock Items</Text></View>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: C.primary }]}><Feather name="file-text" size={18} color="#fff" /></View>
                  <View><Text style={styles.h2}>36</Text><Text style={styles.caption}>Orders Today</Text></View>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: C.primary }]}><Feather name="trending-up" size={18} color="#fff" /></View>
                  <View><Text style={styles.h2}>{"\u20B1412K"}</Text><Text style={styles.caption}>Month Revenue</Text></View>
                </View>
              </View>
              <Text style={styles.h3}>Quick Actions</Text>
              <View style={styles.quickRow}>
                {[
                  { q: 'New Sale', icon: 'shopping-cart' },
                  { q: 'Add Product', icon: 'plus' },
                  { q: 'Restock', icon: 'refresh-cw' },
                  { q: 'Reports', icon: 'bar-chart-2' },
                ].map(({ q, icon }) => (
                  <TouchableOpacity key={q} style={styles.quickBtn} onPress={() => {
                    if (q === 'New Sale') setRoute('pos');
                    else if (q === 'Reports') setRoute('reports');
                    else if (q === 'Add Product') setShowAdd(true);
                    else setRoute('inventory');
                  }}>
                    <View style={[styles.quickTile, q === 'New Sale' && { backgroundColor: C.primary }]}>
                      <Feather name={icon} size={24} color={q === 'New Sale' ? '#fff' : C.primary} />
                    </View>
                    <Text style={styles.quickLabel}>{q}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.recentHeader}><Text style={styles.h3}>Recent Transactions</Text><TouchableOpacity onPress={() => setRoute('reports')}><Text style={styles.link}>See all</Text></TouchableOpacity></View>
              {transactions.slice(0, 3).map((t) => (
                <View key={t.id} style={styles.txnRow}>
                  <View style={styles.txnIcon}><Feather name="file-text" size={18} color={C.primary} /></View>
                  <View style={{ flex: 1 }}><Text style={styles.txnTitle}>{t.title}</Text><Text style={styles.caption}>{t.subtitle}</Text></View>
                  <Text style={styles.txnTitle}>{peso(t.amount)}</Text>
                </View>
              ))}
            </ScrollView>
            <BottomNav active="dashboard" onNav={handleNav} />
          </View>
        )}

        {route === 'inventory' && (
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
              <FakeStatusBar />
              <View style={styles.titleRow}>
                <Text style={styles.h2}>Inventory</Text>
                <TouchableOpacity onPress={() => setShowAdd(true)} style={styles.addBtn}><Text style={styles.addBtnText}>+</Text></TouchableOpacity>
              </View>
              <View style={styles.searchRowWrap}>
                <View style={[styles.searchBox, { flex: 1 }]}>
                  <Feather name="search" size={20} color={C.muted} />
                  <TextInput value={invSearch} onChangeText={setInvSearch} placeholder="Search products or SKU..." style={styles.searchFlex} placeholderTextColor={C.muted} />
                </View>
                <View style={styles.filterBtn}><Feather name="sliders" size={20} color={C.primary} /></View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map((f) => (
                  <Chip key={f} label={f} selected={invFilter === f} onPress={() => setInvFilter(f)} />
                ))}
              </ScrollView>
              <View style={styles.summaryStrip}>
                <View style={{ flex: 1 }}><Text style={styles.caption}>Total Items</Text><Text style={styles.summaryVal}>248</Text></View>
                <View style={styles.summaryDiv} />
                <View style={{ flex: 1 }}><Text style={styles.caption}>Total Value</Text><Text style={styles.summaryVal}>{"\u20B1186,420"}</Text></View>
              </View>
              {products.filter((p) => {
                const q = invSearch.trim().toLowerCase();
                const mq = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q);
                const mf = invFilter === 'All' || statusOf(p.qty) === invFilter;
                return mq && mf;
              }).map((p) => (
                <TouchableOpacity key={p.id} style={styles.productCard} onPress={() => restock(p.id)}>
                  <ProductThumb icon={p.icon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.txnTitle}>{p.name}</Text>
                    <Text style={styles.caption}>SKU {p.sku} \u00B7 {p.qty} pcs</Text>
                    <StockBar qty={p.qty} maxQty={p.maxQty} />
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 6 }}>
                    <Text style={styles.txnTitle}>{peso(p.price)}</Text>
                    <StatusPill status={statusOf(p.qty)} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <BottomNav active="inventory" onNav={handleNav} />
          </View>
        )}

        {route === 'pos' && (
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
              <FakeStatusBar />
              <View style={styles.titleRow}><Text style={styles.h2}>POS</Text><View style={styles.scanBtn}><MaterialCommunityIcons name="barcode-scan" size={22} color={C.primary} /></View></View>
              <View style={styles.searchBox}>
                <Feather name="search" size={20} color={C.muted} />
                <TextInput value={posSearch} onChangeText={setPosSearch} placeholder="Scan or search product..." style={styles.searchFlex} placeholderTextColor={C.muted} />
                <MaterialCommunityIcons name="barcode-scan" size={20} color={C.primary} />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 10 }}>
                {['All', 'Beverages', 'Snacks', 'Groceries'].map((c) => (
                  <Chip key={c} label={c} selected={posCategory === c} onPress={() => setPosCategory(c)} />
                ))}
              </ScrollView>
              {(() => {
                const showCatalog = cartLines.length === 0 || posAdding;
                const catalog = products.filter((p) => {
                  const q = posSearch.trim().toLowerCase();
                  return (!q || p.name.toLowerCase().includes(q)) && (posCategory === 'All' || p.category === posCategory);
                });
                if (showCatalog) {
                  return (
                    <View>
                      {catalog.map((p) => (
                        <View key={p.id} style={styles.productCard}>
                          <ProductThumb icon={p.icon} />
                          <View style={{ flex: 1 }}><Text style={styles.txnTitle}>{p.name}</Text><Text style={styles.caption}>{peso(p.price)} each {"\u00B7"} {p.qty} in stock</Text></View>
                          <TouchableOpacity disabled={p.qty <= 0} onPress={() => setQty(p.id, (cart[p.id] || 0) + 1)} style={[styles.miniAdd, { opacity: p.qty <= 0 ? 0.4 : 1 }]}>
                            <Text style={styles.miniAddText}>{p.qty <= 0 ? 'Out' : 'Add'}</Text>
                          </TouchableOpacity>
                        </View>
                      ))}
                      {cartLines.length > 0 && (
                        <TouchableOpacity onPress={() => setPosAdding(false)} style={[styles.accentBtn, { marginTop: 8 }]}>
                          <View style={styles.accentBtnRow}>
                            <Text style={styles.accentBtnText}>Back to Cart ({cartLines.length})</Text>
                            <Feather name="arrow-right" size={20} color={C.ink} />
                          </View>
                        </TouchableOpacity>
                      )}
                    </View>
                  );
                }
                return (
                  <View>
                    {cartLines.map((l) => (
                      <View key={l.id} style={styles.productCard}>
                        <ProductThumb icon={l.icon} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.txnTitle}>{l.name}</Text>
                          <View style={styles.stepperRow}>
                            <TouchableOpacity onPress={() => setQty(l.id, l.cartQty - 1)} style={styles.stepBtn}><Feather name="minus" size={16} color={C.ink} /></TouchableOpacity>
                            <Text style={styles.txnTitle}>{l.cartQty}</Text>
                            <TouchableOpacity onPress={() => setQty(l.id, l.cartQty + 1)} style={[styles.stepBtn, { backgroundColor: C.primary, borderColor: C.primary }]}><Feather name="plus" size={16} color="#fff" /></TouchableOpacity>
                            <Text style={styles.caption}>{peso(l.price)} each</Text>
                          </View>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                          <TouchableOpacity onPress={() => { const n = { ...cart }; delete n[l.id]; setCart(n); }}><Feather name="x" size={16} color={C.muted} /></TouchableOpacity>
                          <Text style={styles.txnTitle}>{peso(l.price * l.cartQty)}</Text>
                        </View>
                      </View>
                    ))}
                    <TouchableOpacity onPress={() => setPosAdding(true)} style={[styles.miniAdd, { alignSelf: 'stretch', alignItems: 'center', height: 44, marginTop: 4, backgroundColor: C.lavBg }]}>
                      <Text style={[styles.miniAddText, { color: C.primary }]}>+ Add more items</Text>
                    </TouchableOpacity>
                  </View>
                );
              })()}
              {cartLines.length > 0 && (
                <View style={styles.summaryCard}>
                  <View style={styles.summaryRow}><Text style={styles.caption}>Subtotal</Text><Text style={styles.txnTitle}>{peso(calc.subtotal)}</Text></View>
                  <View style={styles.summaryRow}><Text style={styles.caption}>Tax (12%)</Text><Text style={styles.txnTitle}>{peso(calc.tax)}</Text></View>
                  <View style={styles.summaryRow}><Text style={styles.caption}>Discount</Text><Text style={[styles.txnTitle, { color: C.success }]}>-{peso(calc.discount)}</Text></View>
                  <View style={styles.summaryRow}><Text style={styles.h3}>Total</Text><Text style={[styles.h2, { color: C.primary }]}>{peso(calc.total)}</Text></View>
                  <AccentButton label="Proceed to Payment" icon="arrow" onPress={() => { setSummary(calc); setReceived(String(Math.ceil(calc.total / 100) * 100)); setRoute('payment'); }} />
                </View>
              )}
            </ScrollView>
            <BottomNav active="pos" onNav={handleNav} />
          </View>
        )}

        {route === 'payment' && (
          <ScrollView contentContainerStyle={styles.container}>
            <FakeStatusBar />
            <View style={styles.payHeader}>
              <TouchableOpacity onPress={() => setRoute('pos')} style={styles.backBtn}><Feather name="arrow-left" size={20} color={C.ink} /></TouchableOpacity>
              <Text style={styles.h2}>Payment</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}><Text style={styles.h3}>Order Summary</Text><Text style={styles.link}>3 items</Text></View>
              <View style={styles.summaryRow}><Text style={styles.caption}>Subtotal</Text><Text style={styles.txnTitle}>{peso(summary.subtotal)}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.caption}>Tax (12%)</Text><Text style={styles.txnTitle}>{peso(summary.tax)}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.caption}>Discount</Text><Text style={[styles.txnTitle, { color: C.success }]}>-{peso(summary.discount)}</Text></View>
              <View style={styles.summaryRow}><Text style={styles.txnTitle}>Total Amount</Text><Text style={styles.payTotal}>{peso(summary.total)}</Text></View>
            </View>
            <Text style={styles.h3}>Payment Method</Text>
            {[
              { id: 'cash', label: 'Cash', icon: 'cash' },
              { id: 'card', label: 'Card', icon: 'credit-card' },
              { id: 'gcash', label: 'GCash / E-Wallet', icon: 'cellphone' },
              { id: 'bank', label: 'Bank Transfer', icon: 'bank' },
            ].map((m) => (
              <TouchableOpacity key={m.id} onPress={() => setPayMethod(m.id)} style={[styles.methodRow, payMethod === m.id && { borderColor: C.primary, borderWidth: 1.5, backgroundColor: C.card }]}>
                <View style={[styles.methodIcon, payMethod === m.id && { backgroundColor: C.primary }]}><MaterialCommunityIcons name={m.icon} size={18} color={payMethod === m.id ? '#fff' : C.muted} /></View>
                <Text style={[styles.txnTitle, { flex: 1 }]}>{m.label}</Text>
                <View style={[styles.radio, payMethod === m.id && { borderColor: C.primary }]}>
                  {payMethod === m.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
            <View style={styles.cashRow}>
              <View style={{ flex: 1 }}><Text style={styles.caption}>Amount Received</Text><TextInput value={received} onChangeText={(t) => setReceived(t.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" placeholder="0.00" style={styles.cashInput} placeholderTextColor={C.muted} /></View>
              <View style={{ width: 130 }}><Text style={styles.caption}>Change</Text><View style={styles.changeBox}><Text style={styles.changeText}>{peso(change)}</Text></View></View>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
              {['200', '500', '1000'].map((v) => (
                <Chip key={v} label={`\u20B1${Number(v).toLocaleString()}`} selected={received === v} onPress={() => setReceived(v)} />
              ))}
            </View>
            <AccentButton label="Complete Payment" icon="lock" disabled={!(recvVal >= summary.total && summary.total > 0)} onPress={completePayment} />
            <HomeIndicator />
          </ScrollView>
        )}

        {route === 'reports' && (
          <View style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
              <FakeStatusBar />
              <View style={styles.titleRow}>
                <Text style={styles.h2}>Reports</Text>
                <View style={styles.titleActions}>
                  <View style={styles.datePill}>
                    <Feather name="calendar" size={16} color={C.primary} />
                    <Text style={styles.dateText}>Sep 28 – Oct 4</Text>
                    <Feather name="chevron-down" size={14} color={C.muted} />
                  </View>
                  <View style={styles.dlBtn}><Feather name="download" size={18} color={C.primary} /></View>
                </View>
              </View>
              <View style={styles.segment}>
                {['Daily', 'Weekly', 'Monthly'].map((t) => (
                  <TouchableOpacity key={t} onPress={() => setReportTab(t)} style={[styles.segBtn, reportTab === t && { backgroundColor: C.primary }]}>
                    <Text style={[styles.segText, reportTab === t && { color: '#fff' }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.salesCardLight}>
                <Text style={styles.caption}>Sales Overview</Text>
                <Text style={styles.h2}>{d.total}</Text>
                <Text style={[styles.pillText, { backgroundColor: C.successBg, color: C.success, padding: 4, borderRadius: 8, overflow: 'hidden' }]}>{d.change}</Text>
                <View style={styles.chartBox}><Text style={styles.caption}>Mon Tue Wed Thu Fri Sat Sun</Text><View style={styles.chartTip}><View style={styles.tipDot} /><Text style={styles.tipText}>{"\u20B124.1K"}</Text></View></View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.kpi}><Text style={styles.caption}>Total Revenue</Text><Text style={styles.h3}>{d.total.replace(',540', '.5K').replace(',450', '.4K').replace(',800', '.8K')} {d.change}</Text></View>
                <View style={styles.kpi}><Text style={styles.caption}>Orders</Text><Text style={styles.h3}>{d.orders} +5.2%</Text></View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.kpi}><Text style={styles.caption}>Avg. Order Value</Text><Text style={styles.h3}>{d.avg} -1.8%</Text></View>
                <View style={styles.kpi}><Text style={styles.caption}>Profit</Text><Text style={styles.h3}>{d.profit} {d.profitChange}</Text></View>
              </View>
              <Text style={styles.h3}>Top Selling</Text>
              {[['Coca-Cola 1.5L', 128], ['Lucky Me Noodles', 96], ['Milo 200g', 74]].map(([n, c]) => (
                <View key={n} style={styles.txnRow}><Text style={styles.txnTitle}>{n}</Text><Text style={styles.caption}>{c} sold</Text></View>
              ))}
            </ScrollView>
            <BottomNav active="reports" onNav={handleNav} />
          </View>
        )}
        
        {route === 'sqlite-pos' && (
  <View style={{ flex: 1 }}>
    <SQLitePOSScreen />
    <BottomNav active="more" onNav={handleNav} />
  </View>
)}

        {toast ? <View style={styles.toast}><Text style={styles.toastText}>{toast}</Text></View> : null}

        <Modal visible={showMore} transparent animationType="slide">
          <TouchableOpacity style={styles.sheetBg} onPress={() => setShowMore(false)}>
            <View style={styles.sheet}>
              {[['dashboard', 'Home'], ['inventory', 'Inventory'], ['reports', 'Reports'], ['sqlite-pos', 'SQLite Inventory'], ['landing', 'Log out']].map(([id, label]) => (
                <TouchableOpacity key={label} style={styles.sheetRow} onPress={() => { setShowMore(false); setRoute(id); }}>
                  <Text style={styles.txnTitle}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal visible={showAdd} transparent animationType="slide">
          <TouchableOpacity style={styles.sheetBg} onPress={() => setShowAdd(false)}>
            <View style={styles.sheet}>
              <Text style={styles.h3}>Add Product</Text>
              <TextInput value={newName} onChangeText={setNewName} placeholder="Product name" style={styles.search} placeholderTextColor={C.muted} />
              <TextInput value={newPrice} onChangeText={(t) => setNewPrice(t.replace(/[^0-9.]/g, ''))} placeholder="Price" keyboardType="decimal-pad" style={styles.search} placeholderTextColor={C.muted} />
              <TextInput value={newQty} onChangeText={(t) => setNewQty(t.replace(/[^0-9]/g, ''))} placeholder="Qty" keyboardType="number-pad" style={styles.search} placeholderTextColor={C.muted} />
              <AccentButton label="Add to Inventory" onPress={() => {
                if (!newName.trim() || !newPrice) { Alert.alert('Missing info', 'Enter name and price.'); return; }
                setProducts((ps) => [...ps, { id: `p-${Date.now()}`, name: newName.trim(), sku: 'NEW', qty: parseInt(newQty) || 0, maxQty: 48, price: parseFloat(newPrice) || 0, category: 'Groceries', icon: 'cola' }]);
                setNewName(''); setNewPrice(''); setNewQty(''); setShowAdd(false); notify('Product added.');
              }} />
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  phone: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, paddingBottom: 24 },
  statusBar: { height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, backgroundColor: '#fff' },
  statusTime: { fontSize: 14, fontWeight: '600', color: C.ink },
  statusRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  signalBars: { flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  sigBar: { width: 3, backgroundColor: C.ink, borderRadius: 1 },
  battery: { width: 23, height: 12, borderRadius: 3.5, borderWidth: 1.5, borderColor: C.ink, justifyContent: 'center', paddingHorizontal: 2 },
  batteryFill: { width: 14, height: 5, borderRadius: 2, backgroundColor: C.ink },
  statusIcons: { flexDirection: 'row' },
  statusIconText: { fontSize: 12, color: C.ink },
  homeWrap: { alignItems: 'center', paddingVertical: 8, backgroundColor: '#fff' },
  homeBar: { width: 134, height: 5, borderRadius: 3, backgroundColor: C.ink },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 },
  logoMark: { width: 48, height: 48, borderRadius: 14, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  logoMarkText: { color: '#fff', fontSize: 24, fontWeight: '800' },
  logoBadge: { position: 'absolute', right: -4, bottom: -2, width: 20, height: 20, borderRadius: 10, backgroundColor: C.accent, borderWidth: 2, borderColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  logoBadgeText: { fontSize: 11, fontWeight: '800', color: C.ink },
  logoText: { fontSize: 28, fontWeight: '800', color: C.ink },
  tagline: { fontSize: 12, color: C.muted },
  hero: { marginTop: 12, height: 330, borderRadius: 44, backgroundColor: C.lavBg, overflow: 'hidden' },
  heroCircle1: { position: 'absolute', left: 180, top: -70, width: 230, height: 230, borderRadius: 115, backgroundColor: '#D9CBF2' },
  heroCircle2: { position: 'absolute', left: -60, top: 190, width: 170, height: 170, borderRadius: 85, backgroundColor: '#D9CBF2', opacity: 0.7 },
  heroPillar: { position: 'absolute', left: 182, top: 138, width: 76, height: 100, backgroundColor: C.deep, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  heroCounterTop: { position: 'absolute', left: 0, top: 226, width: 350, height: 14, backgroundColor: C.deep },
  heroCounter: { position: 'absolute', left: 0, top: 240, width: 350, height: 90, backgroundColor: C.primary },
  heroTablet: { position: 'absolute', left: 220, top: 172, width: 98, height: 66, backgroundColor: C.ink, borderRadius: 12, padding: 7 },
  heroScreen: { flex: 1, backgroundColor: '#fff', borderRadius: 6, padding: 7 },
  heroBar1: { width: 38, height: 6, backgroundColor: C.primary, borderRadius: 3 },
  heroBar2: { marginTop: 5, width: 58, height: 5, backgroundColor: '#D9CBF2', borderRadius: 3 },
  heroBtn: { marginTop: 5, marginLeft: 44, width: 26, height: 10, backgroundColor: C.accent, borderRadius: 5 },
  floatSales: { position: 'absolute', left: 198, top: 12, width: 140, height: 54, backgroundColor: '#fff', borderRadius: 14, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, gap: 8, elevation: 2 },
  floatLow: { position: 'absolute', left: 12, top: 118, width: 83, height: 94, backgroundColor: '#fff', borderRadius: 14, padding: 10, gap: 6, elevation: 2 },
  floatIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  floatLabel: { fontSize: 11, color: C.muted },
  floatValue: { fontSize: 14, fontWeight: '700', color: C.ink },
  h1: { marginTop: 20, fontSize: 28, fontWeight: '800', lineHeight: 34, color: C.ink },
  h2: { fontSize: 20, fontWeight: '700', color: C.ink },
  h3: { fontSize: 16, fontWeight: '700', color: C.ink, marginTop: 14, marginBottom: 8 },
  payTotal: { fontSize: 28, fontWeight: '800', color: C.primary },
  bodyCenter: { fontSize: 14, color: C.muted, marginTop: 8, textAlign: 'left' },
  mutedCenter: { fontSize: 14, color: C.muted, textAlign: 'center' },
  caption: { fontSize: 12, color: C.muted },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 16 },
  dotActive: { width: 22, height: 6, borderRadius: 3, backgroundColor: C.primary },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.lav },
  headerCenter: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginBottom: 8, color: C.ink },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 44, marginBottom: 6 },
  menuIcon: { fontSize: 22, color: C.ink },
  bell: { fontSize: 22, color: C.ink },
  bellDot: { position: 'absolute', right: 0, top: 0, width: 10, height: 10, borderRadius: 5, backgroundColor: C.accent, borderWidth: 1.5, borderColor: '#fff' },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.lavBg, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.primary, fontWeight: '700' },
  salesCard: { backgroundColor: C.primary, borderRadius: 20, padding: 20, marginBottom: 12, overflow: 'hidden' },
  salesCardLight: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginTop: 10, elevation: 2, shadowColor: C.primary, shadowOpacity: 0.08, shadowRadius: 10 },
  salesDeco1: { position: 'absolute', right: -40, top: -70, width: 170, height: 170, borderRadius: 85, backgroundColor: C.light, opacity: 0.35 },
  salesDeco2: { position: 'absolute', left: -30, top: 80, width: 110, height: 110, borderRadius: 55, backgroundColor: C.light, opacity: 0.3 },
  salesLabel: { color: '#fff', opacity: 0.8, fontSize: 12 },
  salesValue: { color: '#fff', fontSize: 32, fontWeight: '800', marginTop: 4 },
  trendChip: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: C.light, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  trendText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  sparkDot: { position: 'absolute', right: 30, top: 46, width: 14, height: 14, borderRadius: 7, backgroundColor: C.accent, borderWidth: 2.5, borderColor: '#fff' },
  gridRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: 16, padding: 12, borderWidth: 1, borderColor: C.lavBg },
  statIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statIconText: { color: '#fff', fontSize: 18 },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  quickBtn: { alignItems: 'center', width: 78 },
  quickTile: { width: 56, height: 56, borderRadius: 18, backgroundColor: C.card, borderWidth: 1, borderColor: C.lavBg, alignItems: 'center', justifyContent: 'center' },
  quickIcon: { fontSize: 24, color: C.primary },
  quickLabel: { fontSize: 11, color: C.ink, marginTop: 4, textAlign: 'center' },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  link: { fontSize: 12, color: C.primary, fontWeight: '600' },
  txnRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.row, borderRadius: 14, padding: 12, marginBottom: 8, gap: 12 },
  txnIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: C.lavBg, alignItems: 'center', justifyContent: 'center' },
  txnTitle: { fontSize: 14, fontWeight: '600', color: C.ink },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  search: { backgroundColor: C.row, borderRadius: 12, paddingHorizontal: 14, height: 46, fontSize: 14, color: C.ink, marginBottom: 4 },
  searchRowWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.row, borderRadius: 12, paddingHorizontal: 14, height: 46, marginBottom: 4 },
  filterBtn: { width: 46, height: 46, borderRadius: 12, backgroundColor: C.lavBg, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  searchFlex: { flex: 1, fontSize: 14, color: C.ink },
  searchFlexPlaceholder: {},
  scanBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.lavBg, alignItems: 'center', justifyContent: 'center' },
  productCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 8, gap: 12, elevation: 2, shadowColor: C.primary, shadowOpacity: 0.08, shadowRadius: 10 },
  summaryStrip: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.lavBg, marginTop: 4 },
  summaryVal: { fontSize: 16, fontWeight: '700', color: C.primary },
  summaryDiv: { width: 1, height: 34, backgroundColor: C.lav, marginHorizontal: 12 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  pillText: { fontSize: 11, fontWeight: '600' },
  chip: { paddingHorizontal: 16, height: 32, borderRadius: 999, justifyContent: 'center', marginRight: 8 },
  chipText: { fontSize: 12, fontWeight: '600' },
  accentBtn: { height: 54, borderRadius: 14, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  accentBtnRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  accentBtnText: { fontSize: 16, fontWeight: '700', color: C.ink },
  loginLink: { marginTop: 16, alignItems: 'center' },
  thumb: { width: 52, height: 52, borderRadius: 11, backgroundColor: C.row, alignItems: 'center', justifyContent: 'center' },
  stockTrack: { width: 140, height: 6, borderRadius: 3, backgroundColor: C.chip, overflow: 'hidden', marginTop: 4 },
  stockFill: { height: 6, borderRadius: 3 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6 },
  stepBtn: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#fff', borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontSize: 16, fontWeight: '700', color: C.ink },
  miniAdd: { backgroundColor: C.primary, borderRadius: 999, paddingHorizontal: 14, height: 32, justifyContent: 'center' },
  miniAddText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  summaryCard: { backgroundColor: C.card, borderRadius: 16, padding: 16, marginTop: 10, borderWidth: 1, borderColor: C.lavBg },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  payHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.row, alignItems: 'center', justifyContent: 'center' },
  methodRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 12, marginBottom: 8, backgroundColor: '#fff' },
  methodIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.chip, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: C.line, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.primary },
  cashRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  cashInput: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1.5, borderColor: C.primary, height: 48, paddingHorizontal: 14, fontSize: 16, fontWeight: '700', marginTop: 4 },
  changeBox: { backgroundColor: C.successBg, borderRadius: 12, height: 48, paddingHorizontal: 14, justifyContent: 'center', marginTop: 4 },
  changeText: { fontSize: 16, fontWeight: '700', color: C.success },
  segment: { flexDirection: 'row', backgroundColor: C.chip, borderRadius: 12, padding: 3, height: 40, marginTop: 10 },
  segBtn: { flex: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  segText: { fontSize: 14, color: C.muted },
  kpi: { flex: 1, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 },
  chartBox: { marginTop: 8, height: 60, backgroundColor: C.lavBg, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  chartTip: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: C.ink, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginTop: 4 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent },
  tipText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  titleActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  datePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.row, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 },
  dateText: { fontSize: 12, fontWeight: '600', color: C.ink },
  dlBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.lavBg, alignItems: 'center', justifyContent: 'center' },
  bottomNav: { borderTopWidth: 1, borderTopColor: C.line, backgroundColor: '#fff', paddingTop: 6 },
  tabRow: { flexDirection: 'row', height: 56 },
  tab: { flex: 1, alignItems: 'center', paddingTop: 6 },
  tabIcon: { fontSize: 22 },
  tabLabel: { fontSize: 11, marginTop: 2 },
  posSpacer: { height: 22 },
  posButton: { position: 'absolute', left: '50%', marginLeft: -27, top: -24, width: 54, height: 54, borderRadius: 27, backgroundColor: C.primary, borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  posButtonText: { color: '#fff', fontSize: 22 },
  toast: { position: 'absolute', left: 24, right: 24, bottom: 110, backgroundColor: C.ink, borderRadius: 12, padding: 12, alignItems: 'center' },
  toastText: { color: '#fff', fontSize: 12 },
  sheetBg: { flex: 1, backgroundColor: 'rgba(26,21,48,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, gap: 8 },
  sheetRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: C.row },
});
