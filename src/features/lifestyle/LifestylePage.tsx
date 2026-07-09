import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome,
  HiTruck,
  HiClock,
  HiShoppingBag,
  HiCurrencyDollar,
  HiBanknotes,
  HiHeart,
  HiCheckCircle,
  HiExclamationTriangle,
  HiBuildingOffice,
  HiMapPin,
} from 'react-icons/hi2';
import { useGameStore } from '../../stores/gameStore';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatDisplay from '../../components/ui/StatDisplay';
import PageTransition from '../../components/layout/PageTransition';

interface Property {
  id: string;
  name: string;
  type: string;
  price: number;
  location: string;
  bedrooms: number;
  icon: string;
}

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  price: number;
  topSpeed: number;
  type: string;
}

interface Watch {
  id: string;
  brand: string;
  model: string;
  price: number;
  material: string;
}

interface Business {
  id: string;
  name: string;
  investmentCost: number;
  weeklyReturn: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  category: string;
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const fullFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const properties: Property[] = [
  { id: 'apt_1', name: 'City Apartment', type: 'Apartment', price: 500000, location: 'Manchester City Centre', bedrooms: 2, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'apt_2', name: 'Riverside Loft', type: 'Apartment', price: 750000, location: 'London Docklands', bedrooms: 3, icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { id: 'house_1', name: 'Suburban House', type: 'House', price: 1200000, location: 'Cheshire', bedrooms: 4, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'house_2', name: 'Country Manor', type: 'House', price: 3500000, location: 'Cotswolds', bedrooms: 6, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'villa_1', name: 'Mediterranean Villa', type: 'Villa', price: 8500000, location: 'Marbella, Spain', bedrooms: 8, icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
  { id: 'villa_2', name: 'Dubai Penthouse', type: 'Villa', price: 15000000, location: 'Dubai Marina', bedrooms: 10, icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
];

const vehicles: Vehicle[] = [
  { id: 'rr_sport', brand: 'Range Rover', model: 'Sport Autobiography', price: 150000, topSpeed: 140, type: 'SUV' },
  { id: 'bent_gt', brand: 'Bentley', model: 'Continental GT', price: 300000, topSpeed: 207, type: 'Coupe' },
  { id: 'ferr_f8', brand: 'Ferrari', model: 'F8 Tributo', price: 500000, topSpeed: 211, type: 'Supercar' },
  { id: 'lamb_avent', brand: 'Lamborghini', model: 'Aventador SVJ', price: 400000, topSpeed: 217, type: 'Supercar' },
  { id: 'porsche_911', brand: 'Porsche', model: '911 Turbo S', price: 250000, topSpeed: 205, type: 'Sports' },
  { id: 'rolls_phantom', brand: 'Rolls-Royce', model: 'Phantom VIII', price: 450000, topSpeed: 155, type: 'Luxury' },
  { id: 'amg_gt', brand: 'Mercedes-AMG', model: 'GT Black Series', price: 325000, topSpeed: 202, type: 'Sports' },
  { id: 'mclaren_765', brand: 'McLaren', model: '765LT', price: 380000, topSpeed: 205, type: 'Supercar' },
];

const watches: Watch[] = [
  { id: 'rolex_sub', brand: 'Rolex', model: 'Submariner Date', price: 15000, material: 'Stainless Steel' },
  { id: 'rolex_daytona', brand: 'Rolex', model: 'Daytona Platinum', price: 85000, material: 'Platinum' },
  { id: 'audemars_royal', brand: 'Audemars Piguet', model: 'Royal Oak Offshore', price: 45000, material: 'Stainless Steel' },
  { id: 'patek_nau', brand: 'Patek Philippe', model: 'Nautilus 5711', price: 130000, material: 'Stainless Steel' },
  { id: 'richard_mille', brand: 'Richard Mille', model: 'RM 11-03', price: 200000, material: 'Titanium' },
  { id: 'hublot_big', brand: 'Hublot', model: 'Big Bang Unico', price: 25000, material: 'Ceramic' },
  { id: 'tag_heuer', brand: 'Tag Heuer', model: 'Carrera Chronograph', price: 10000, material: 'Stainless Steel' },
  { id: 'panerai_lum', brand: 'Panerai', model: 'Luminor Marina', price: 12000, material: 'Steel' },
  { id: 'jaeger_reverso', brand: 'Jaeger-LeCoultre', model: 'Reverso Tribute', price: 18000, material: 'Steel' },
  { id: 'omega_speed', brand: 'Omega', model: 'Speedmaster Moonwatch', price: 8000, material: 'Stainless Steel' },
];

const businesses: Business[] = [
  { id: 'biz_restaurant', name: 'Fine Dining Restaurant', investmentCost: 200000, weeklyReturn: 5000, riskLevel: 'Medium', category: 'Hospitality' },
  { id: 'biz_nightclub', name: 'VIP Nightclub', investmentCost: 500000, weeklyReturn: 15000, riskLevel: 'High', category: 'Entertainment' },
  { id: 'biz_clothing', name: 'Clothing Line', investmentCost: 300000, weeklyReturn: 8000, riskLevel: 'Medium', category: 'Fashion' },
  { id: 'biz_academy', name: 'Football Academy', investmentCost: 1000000, weeklyReturn: 25000, riskLevel: 'Medium', category: 'Sports' },
  { id: 'biz_realestate', name: 'Real Estate Portfolio', investmentCost: 2000000, weeklyReturn: 40000, riskLevel: 'Low', category: 'Property' },
  { id: 'biz_gym', name: 'Premium Gym Chain', investmentCost: 400000, weeklyReturn: 10000, riskLevel: 'Low', category: 'Fitness' },
  { id: 'biz_record', name: 'Record Label', investmentCost: 600000, weeklyReturn: 12000, riskLevel: 'High', category: 'Music' },
  { id: 'biz_esports', name: 'Esports Organization', investmentCost: 800000, weeklyReturn: 18000, riskLevel: 'High', category: 'Gaming' },
];

const riskColors: Record<string, string> = {
  Low: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30',
  Medium: 'text-amber-400 bg-amber-500/15 border-amber-500/30',
  High: 'text-rose-400 bg-rose-500/15 border-rose-500/30',
};

type Tab = 'properties' | 'vehicles' | 'watches' | 'businesses';

const tabItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'properties', label: 'Properties', icon: <HiHome className="w-4 h-4" /> },
  { key: 'vehicles', label: 'Vehicles', icon: <HiTruck className="w-4 h-4" /> },
  { key: 'watches', label: 'Watches', icon: <HiClock className="w-4 h-4" /> },
  { key: 'businesses', label: 'Businesses', icon: <HiShoppingBag className="w-4 h-4" /> },
];

function HappinessMeter({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <HiHeart className={`w-5 h-5 ${value >= 70 ? 'text-emerald-400' : value >= 40 ? 'text-amber-400' : 'text-rose-400'}`} />
      <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' as const }}
          className={`h-full rounded-full ${value >= 70 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : value >= 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 'bg-gradient-to-r from-rose-500 to-rose-400'}`}
        />
      </div>
      <span className="text-sm font-medium text-gray-300 w-8 text-right">{Math.round(value)}%</span>
    </div>
  );
}

export default function LifestylePage() {
  const player = useGameStore((s) => s.player);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const [activeTab, setActiveTab] = useState<Tab>('properties');
  const [purchaseMessage, setPurchaseMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!player) return null;

  const ownedHouses = player.houses ?? [];
  const ownedCars = player.cars ?? [];
  const ownedWatches = player.watches ?? [];
  const ownedBusinesses = player.businesses ?? [];

  const totalEarnings = player.weeklySalary * player.careerAppearances;

  const handlePurchase = (type: 'houses' | 'cars' | 'watches' | 'businesses', itemName: string, price: number) => {
    if (player.bankBalance < price) {
      setPurchaseMessage({ type: 'error', text: `Insufficient funds. Need ${fullFormatter.format(price - player.bankBalance)} more.` });
      setTimeout(() => setPurchaseMessage(null), 3000);
      return;
    }
    const currentItems = [...(player[type] ?? [])];
    if (currentItems.includes(itemName)) {
      setPurchaseMessage({ type: 'error', text: 'You already own this item.' });
      setTimeout(() => setPurchaseMessage(null), 3000);
      return;
    }
    const newBalance = player.bankBalance - price;
    const updatedItems = [...currentItems, itemName];
    const happinessBoost = Math.min(10, price / 100000);
    const newMorale = Math.min(100, player.morale + happinessBoost);
    updatePlayer({ bankBalance: newBalance, [type]: updatedItems, morale: newMorale });
    setPurchaseMessage({ type: 'success', text: `Purchased ${itemName}! Happiness +${Math.round(happinessBoost)}` });
    setTimeout(() => setPurchaseMessage(null), 3000);
  };

  const renderTabNav = () => (
    <div className="flex gap-1 bg-gray-900 rounded-xl p-1 border border-gray-800">
      {tabItems.map((tab) => (
        <motion.button
          key={tab.key}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab(tab.key)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex-1 justify-center ${
            activeTab === tab.key
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`}
        >
          {tab.icon}
          {tab.label}
        </motion.button>
      ))}
    </div>
  );

  const renderPropertiesTab = () => (
    <motion.div
      key="properties"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {ownedHouses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <HiCheckCircle className="w-4 h-4" />
            Owned Properties ({ownedHouses.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {properties.filter((p) => ownedHouses.includes(p.name)).map((p) => (
              <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <HiHome className="w-6 h-6 text-emerald-400" />
                    </div>
                    <Badge variant="success" icon={<HiCheckCircle className="w-3 h-3" />}>Owned</Badge>
                  </div>
                  <h4 className="text-white font-bold text-lg">{p.name}</h4>
                  <div className="mt-2 space-y-1 text-sm text-gray-400">
                    <div className="flex items-center gap-1.5"><HiMapPin className="w-3.5 h-3.5" />{p.location}</div>
                    <div className="flex items-center gap-1.5"><HiBuildingOffice className="w-3.5 h-3.5" />{p.type} &middot; {p.bedrooms} Bed</div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Available Properties</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {properties.filter((p) => !ownedHouses.includes(p.name)).map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-indigo-500/15 flex items-center justify-center">
                    <HiHome className="w-6 h-6 text-indigo-400" />
                  </div>
                  <Badge>{formatter.format(p.price)}</Badge>
                </div>
                <h4 className="text-white font-bold text-lg">{p.name}</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-400">
                  <div className="flex items-center gap-1.5"><HiMapPin className="w-3.5 h-3.5" />{p.location}</div>
                  <div className="flex items-center gap-1.5"><HiBuildingOffice className="w-3.5 h-3.5" />{p.type} &middot; {p.bedrooms} Bed</div>
                </div>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full"
                    onClick={() => handlePurchase('houses', p.name, p.price)}
                  >
                    <HiCurrencyDollar className="w-4 h-4" />
                    Buy Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderVehiclesTab = () => (
    <motion.div
      key="vehicles"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {ownedCars.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <HiCheckCircle className="w-4 h-4" />
            Your Garage ({ownedCars.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicles.filter((v) => ownedCars.includes(`${v.brand} ${v.model}`)).map((v) => (
              <motion.div key={v.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <HiTruck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <Badge variant="success" icon={<HiCheckCircle className="w-3 h-3" />}>Garage</Badge>
                  </div>
                  <h4 className="text-white font-bold">{v.brand}</h4>
                  <p className="text-gray-400 text-sm">{v.model}</p>
                  <div className="mt-2 flex gap-3 text-xs text-gray-500">
                    <span>{v.type}</span>
                    <span>{v.topSpeed} mph</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Available Vehicles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vehicles.filter((v) => !ownedCars.includes(`${v.brand} ${v.model}`)).map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-orange-500/15 flex items-center justify-center">
                    <HiTruck className="w-6 h-6 text-orange-400" />
                  </div>
                  <Badge>{formatter.format(v.price)}</Badge>
                </div>
                <h4 className="text-white font-bold">{v.brand}</h4>
                <p className="text-gray-400 text-sm">{v.model}</p>
                <div className="mt-2 flex gap-3 text-xs text-gray-500">
                  <span>{v.type}</span>
                  <span className="font-medium text-gray-300">{v.topSpeed} mph top speed</span>
                </div>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full"
                    onClick={() => handlePurchase('cars', `${v.brand} ${v.model}`, v.price)}
                  >
                    <HiCurrencyDollar className="w-4 h-4" />
                    Buy Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderWatchesTab = () => (
    <motion.div
      key="watches"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {ownedWatches.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <HiCheckCircle className="w-4 h-4" />
            Your Collection ({ownedWatches.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {watches.filter((w) => ownedWatches.includes(`${w.brand} ${w.model}`)).map((w) => (
              <motion.div
                key={w.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <HiClock className="w-6 h-6 text-emerald-400" />
                    </div>
                    <Badge variant="success">Owned</Badge>
                  </div>
                  <h4 className="text-white font-bold">{w.brand}</h4>
                  <p className="text-gray-400 text-sm">{w.model}</p>
                  <p className="text-xs text-gray-500 mt-1">{w.material}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Available Watches</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {watches.filter((w) => !ownedWatches.includes(`${w.brand} ${w.model}`)).map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-500/15 flex items-center justify-center">
                    <HiClock className="w-6 h-6 text-amber-400" />
                  </div>
                  <Badge>{formatter.format(w.price)}</Badge>
                </div>
                <h4 className="text-white font-bold">{w.brand}</h4>
                <p className="text-gray-400 text-sm">{w.model}</p>
                <p className="text-xs text-gray-500 mt-1">{w.material}</p>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full"
                    onClick={() => handlePurchase('watches', `${w.brand} ${w.model}`, w.price)}
                  >
                    <HiCurrencyDollar className="w-4 h-4" />
                    Buy Now
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderBusinessesTab = () => (
    <motion.div
      key="businesses"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {ownedBusinesses.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <HiShoppingBag className="w-4 h-4" />
            Your Portfolio ({ownedBusinesses.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {businesses.filter((b) => ownedBusinesses.includes(b.name)).map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="border-emerald-500/30 bg-emerald-500/5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                      <HiShoppingBag className="w-6 h-6 text-emerald-400" />
                    </div>
                    <Badge variant="success" icon={<HiCheckCircle className="w-3 h-3" />}>Active</Badge>
                  </div>
                  <h4 className="text-white font-bold text-lg">{b.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">{b.category}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <StatDisplay label="Invested" value={fullFormatter.format(b.investmentCost)} />
                    <StatDisplay label="Weekly Profit" value={formatter.format(b.weeklyReturn)} trend="up" />
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Investment Opportunities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businesses.filter((b) => !ownedBusinesses.includes(b.name)).map((b, i) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-500/15 flex items-center justify-center">
                    <HiShoppingBag className="w-6 h-6 text-purple-400" />
                  </div>
                  <Badge>{fullFormatter.format(b.investmentCost)}</Badge>
                </div>
                <h4 className="text-white font-bold text-lg">{b.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{b.category}</p>
                <div className="mt-3 flex items-center gap-3">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${riskColors[b.riskLevel]}`}>
                    {b.riskLevel} Risk
                  </span>
                  <span className="text-xs text-emerald-400 font-medium">
                    +{formatter.format(b.weeklyReturn)}/wk
                  </span>
                </div>
                <div className="mt-4">
                  <Button
                    size="sm"
                    variant="primary"
                    className="w-full"
                    onClick={() => handlePurchase('businesses', b.name, b.investmentCost)}
                  >
                    <HiCurrencyDollar className="w-4 h-4" />
                    Invest
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex items-center gap-3 mb-4">
              <HiHome className="w-7 h-7 text-indigo-400" />
              <h1 className="text-2xl font-bold text-white">Lifestyle Management</h1>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <StatDisplay
                  label="Bank Balance"
                  value={fullFormatter.format(player.bankBalance)}
                  icon={<HiBanknotes className="w-5 h-5 text-emerald-400" />}
                />
              </Card>
              <Card>
                <StatDisplay
                  label="Weekly Salary"
                  value={fullFormatter.format(player.weeklySalary)}
                  icon={<HiCurrencyDollar className="w-5 h-5 text-sky-400" />}
                />
              </Card>
              <Card>
                <StatDisplay
                  label="Career Earnings"
                  value={fullFormatter.format(totalEarnings)}
                  icon={<HiBanknotes className="w-5 h-5 text-purple-400" />}
                />
              </Card>
              <Card>
                <div className="space-y-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Happiness</p>
                  <HappinessMeter value={player.morale} />
                </div>
              </Card>
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            {purchaseMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${
                  purchaseMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                {purchaseMessage.type === 'success' ? (
                  <HiCheckCircle className="w-5 h-5 shrink-0" />
                ) : (
                  <HiExclamationTriangle className="w-5 h-5 shrink-0" />
                )}
                <span className="text-sm font-medium">{purchaseMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {renderTabNav()}

          <AnimatePresence mode="wait">
            {activeTab === 'properties' && renderPropertiesTab()}
            {activeTab === 'vehicles' && renderVehiclesTab()}
            {activeTab === 'watches' && renderWatchesTab()}
            {activeTab === 'businesses' && renderBusinessesTab()}
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
