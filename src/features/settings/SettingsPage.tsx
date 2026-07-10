import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  HiCog6Tooth,
  HiSun,
  HiSpeakerWave,
  HiPlay,
  HiBell,
  HiServer,
  HiTrash,
  HiArrowPath,
  HiInformationCircle,
  HiAdjustmentsHorizontal,
  HiCloud,
  HiCheckCircle,
  HiXMark,
} from 'react-icons/hi2';
import { useCloudStore } from '../../stores/cloudStore';
import { connectWithEmail, disconnectCloud } from '../../services/firebase';
import { useGameStore } from '../../stores/gameStore';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import PageTransition from '../../components/layout/PageTransition';

interface GameSettings {
  display: {
    darkMode: boolean;
    uiScale: number;
  };
  sound: {
    soundEffects: boolean;
    music: boolean;
  };
  gameplay: {
    matchSpeed: 'Normal' | 'Fast' | 'Instant';
    autoSaveInterval: 'Every Week' | 'Every Month' | 'Off';
    qteDifficulty: 'Easy' | 'Normal' | 'Hard';
    commentaryLanguage: 'English' | 'Spanish' | 'French' | 'German';
  };
  notifications: {
    matchNotifications: boolean;
    transferOffers: boolean;
    newsAlerts: boolean;
  };
}

const STORAGE_KEY = 'football-star-pro-settings';

const defaultSettings: GameSettings = {
  display: {
    darkMode: true,
    uiScale: 100,
  },
  sound: {
    soundEffects: false,
    music: false,
  },
  gameplay: {
    matchSpeed: 'Normal',
    autoSaveInterval: 'Every Month',
    qteDifficulty: 'Normal',
    commentaryLanguage: 'English',
  },
  notifications: {
    matchNotifications: true,
    transferOffers: true,
    newsAlerts: true,
  },
};

function loadSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultSettings, ...parsed, display: { ...defaultSettings.display, ...parsed.display }, sound: { ...defaultSettings.sound, ...parsed.sound }, gameplay: { ...defaultSettings.gameplay, ...parsed.gameplay }, notifications: { ...defaultSettings.notifications, ...parsed.notifications } };
    }
  } catch { /* ignore */ }
  return defaultSettings;
}

function saveSettings(settings: GameSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

interface SectionProps {
  title: string;
  icon: typeof HiCog6Tooth;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function SettingsSection({ title, icon: Icon, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="mb-4">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between mb-0">
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-indigo-400" />
          <span className="text-lg font-bold text-white">{title}</span>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} className="text-gray-500">
          <HiAdjustmentsHorizontal className="w-5 h-5" />
        </motion.div>
      </button>
      {open && <div className="mt-4 space-y-4">{children}</div>}
    </Card>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clearCacheDone, setClearCacheDone] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectMode, setConnectMode] = useState<'create' | 'login'>('create');
  const [connectEmail, setConnectEmail] = useState('');
  const [connectPassword, setConnectPassword] = useState('');
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  const cloudStatus = useCloudStore((s) => s.status);
  const cloudEmail = useCloudStore((s) => s.email);
  const loadFromCloud = useGameStore((s) => s.loadFromCloud);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  const updateSetting = useCallback(<K extends keyof GameSettings>(section: K, updates: Partial<GameSettings[K]>) => {
    setSettings((prev) => ({
      ...prev,
      [section]: { ...prev[section], ...updates },
    }));
  }, []);

  const resetDefaults = () => {
    setSettings(defaultSettings);
  };

  const exportData = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('football-star-pro-')) {
        data[key] = JSON.parse(localStorage.getItem(key) ?? 'null');
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `football-star-pro-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteAllSaves = () => {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('football-star-pro-save-')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setShowDeleteConfirm(false);
  };

  const clearCache = () => {
    const prefix = 'football-star-pro-cache-';
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setClearCacheDone(true);
    setTimeout(() => setClearCacheDone(false), 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-950 text-white pb-12">
        <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <HiCog6Tooth className="w-7 h-7 text-indigo-400" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>

          <SettingsSection title="Display" icon={HiSun}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Dark Mode</p>
                <p className="text-xs text-gray-500">Always enabled for the best experience</p>
              </div>
              <div className="w-11 h-6 rounded-full bg-indigo-600 flex items-center justify-center cursor-not-allowed opacity-60">
                <div className="w-4 h-4 rounded-full bg-white shadow ml-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-white">UI Scale</p>
                <span className="text-sm text-gray-400">{settings.display.uiScale}%</span>
              </div>
              <input
                type="range"
                min={80}
                max={120}
                step={5}
                value={settings.display.uiScale}
                onChange={(e) => updateSetting('display', { uiScale: Number(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-full appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>80%</span>
                <span>100%</span>
                <span>120%</span>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Sound" icon={HiSpeakerWave}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Sound Effects</p>
                <p className="text-xs text-gray-500">Match and UI sounds</p>
              </div>
              <button
                onClick={() => updateSetting('sound', { soundEffects: !settings.sound.soundEffects })}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.sound.soundEffects ? 'bg-indigo-600' : 'bg-gray-700'}`}
              >
                <motion.div
                  animate={{ x: settings.sound.soundEffects ? 22 : 2 }}
                  className="w-4 h-4 rounded-full bg-white shadow mt-1 ml-0.5"
                />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Music</p>
                <p className="text-xs text-gray-500">Background music (placeholder)</p>
              </div>
              <button
                onClick={() => updateSetting('sound', { music: !settings.sound.music })}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.sound.music ? 'bg-indigo-600' : 'bg-gray-700'}`}
              >
                <motion.div
                  animate={{ x: settings.sound.music ? 22 : 2 }}
                  className="w-4 h-4 rounded-full bg-white shadow mt-1 ml-0.5"
                />
              </button>
            </div>
          </SettingsSection>

          <SettingsSection title="Gameplay" icon={HiPlay}>
            <div>
              <p className="text-sm font-medium text-white mb-2">Match Speed</p>
              <div className="flex gap-2">
                {(['Normal', 'Fast', 'Instant'] as const).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => updateSetting('gameplay', { matchSpeed: speed })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.gameplay.matchSpeed === speed
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-2">Auto-Save Interval</p>
              <div className="flex gap-2">
                {(['Every Week', 'Every Month', 'Off'] as const).map((interval) => (
                  <button
                    key={interval}
                    onClick={() => updateSetting('gameplay', { autoSaveInterval: interval })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.gameplay.autoSaveInterval === interval
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-2">QTE Difficulty</p>
              <div className="flex gap-2">
                {(['Easy', 'Normal', 'Hard'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => updateSetting('gameplay', { qteDifficulty: diff })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.gameplay.qteDifficulty === diff
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-white mb-2">Commentary Language</p>
              <div className="flex gap-2">
                {(['English', 'Spanish', 'French', 'German'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => updateSetting('gameplay', { commentaryLanguage: lang })}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      settings.gameplay.commentaryLanguage === lang
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Notifications" icon={HiBell}>
            {([
              { key: 'matchNotifications' as const, label: 'Match Notifications', desc: 'Alerts for upcoming matches' },
              { key: 'transferOffers' as const, label: 'Transfer Offers', desc: 'Notify on new transfer bids' },
              { key: 'newsAlerts' as const, label: 'News Alerts', desc: 'Breaking football news' },
            ]).map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
                <button
                  onClick={() => updateSetting('notifications', { [item.key]: !settings.notifications[item.key] })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${settings.notifications[item.key] ? 'bg-indigo-600' : 'bg-gray-700'}`}
                >
                  <motion.div
                    animate={{ x: settings.notifications[item.key] ? 22 : 2 }}
                    className="w-4 h-4 rounded-full bg-white shadow mt-1 ml-0.5"
                  />
                </button>
              </div>
            ))}
          </SettingsSection>

          <SettingsSection title="Data Management" icon={HiServer}>
            <Button variant="secondary" size="md" className="w-full" icon={<HiArrowPath className="w-4 h-4" />} onClick={exportData}>
              Export Career Data
            </Button>

            {!showDeleteConfirm ? (
              <Button variant="secondary" size="md" className="w-full" icon={<HiTrash className="w-4 h-4" />} onClick={() => setShowDeleteConfirm(true)}>
                Delete All Saves
              </Button>
            ) : (
              <div className="flex flex-col gap-2 p-3 bg-rose-900/20 border border-rose-500/30 rounded-lg">
                <p className="text-sm text-rose-300 font-medium">Are you sure? This cannot be undone.</p>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm" className="flex-1 bg-rose-600 from-rose-600 to-rose-700 shadow-rose-600/25" onClick={deleteAllSaves}>
                    Confirm Delete
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => setShowDeleteConfirm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            <Button
              variant="secondary"
              size="md"
              className="w-full"
              icon={<HiArrowPath className="w-4 h-4" />}
              onClick={clearCache}
            >
              {clearCacheDone ? 'Cache Cleared' : 'Clear Cache'}
            </Button>
          </SettingsSection>

          <SettingsSection title="Cloud Save" icon={HiCloud}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">
                  {cloudStatus === 'connected'
                    ? 'Connected'
                    : cloudStatus === 'guest'
                      ? 'Guest Mode'
                      : cloudStatus === 'loading'
                        ? 'Initializing...'
                        : 'Disconnected'}
                </p>
                <p className="text-xs text-gray-500">
                  {cloudStatus === 'connected'
                    ? `Signed in as ${cloudEmail ?? 'unknown'}`
                    : cloudStatus === 'guest'
                      ? 'Data auto-saves to your device. Connect to sync across devices.'
                      : 'Cloud save unavailable'}
                </p>
              </div>
              {cloudStatus === 'connected' && (
                <HiCheckCircle className="w-6 h-6 text-emerald-400 shrink-0" />
              )}
            </div>

            {cloudStatus === 'guest' && (
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                icon={<HiCloud className="w-4 h-4" />}
                onClick={() => setShowConnectModal(true)}
              >
                Connect to Cloud
              </Button>
            )}

            {cloudStatus === 'connected' && (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setConnectEmail('');
                    setConnectPassword('');
                    setConnectError('');
                    setShowConnectModal(true);
                  }}
                >
                  Sync Save Now
                </Button>
                {!showDisconnectConfirm ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                    onClick={() => setShowDisconnectConfirm(true)}
                  >
                    Disconnect
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2 p-3 bg-rose-900/20 border border-rose-500/30 rounded-lg">
                    <p className="text-sm text-rose-300 font-medium">
                      Disconnect from cloud?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="flex-1 bg-rose-600 from-rose-600 to-rose-700 shadow-rose-600/25"
                        onClick={async () => {
                          await disconnectCloud();
                          setShowDisconnectConfirm(false);
                        }}
                      >
                        Confirm
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowDisconnectConfirm(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {cloudStatus === 'error' && (
              <p className="text-xs text-rose-400">
                Cloud save is not available. Check your connection or Firebase
                configuration.
              </p>
            )}
          </SettingsSection>

          {/* Connect Modal */}
          {showConnectModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
              <div className="bg-gray-900 rounded-xl border border-gray-700 p-6 w-full max-w-md space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-white">
                    {cloudStatus === 'connected'
                      ? 'Sync Save'
                      : 'Connect to Cloud'}
                  </h2>
                  <button
                    onClick={() => setShowConnectModal(false)}
                    className="text-gray-500 hover:text-white"
                  >
                    <HiXMark className="w-5 h-5" />
                  </button>
                </div>

                {cloudStatus !== 'connected' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setConnectMode('create');
                        setConnectError('');
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        connectMode === 'create'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      Create Account
                    </button>
                    <button
                      onClick={() => {
                        setConnectMode('login');
                        setConnectError('');
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        connectMode === 'login'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      Login
                    </button>
                  </div>
                )}

                {cloudStatus === 'connected' && (
                  <p className="text-sm text-gray-400">
                    This will upload your current save to the cloud and replace
                    the remote version.
                  </p>
                )}

                <input
                  type="email"
                  placeholder="Email"
                  value={connectEmail}
                  onChange={(e) => setConnectEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={connectPassword}
                  onChange={(e) => setConnectPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                />

                {connectError && (
                  <p className="text-sm text-rose-400">{connectError}</p>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    size="md"
                    className="flex-1"
                    disabled={connecting || !connectEmail || !connectPassword}
                    onClick={async () => {
                      setConnecting(true);
                      setConnectError('');
                      try {
                        if (cloudStatus === 'connected') {
                          useGameStore.getState().saveGame();
                          useGameStore.getState().addInboxItem({
                            id: `cloud-sync-${Date.now()}`,
                            week: useGameStore.getState().currentWeek,
                            season: useGameStore.getState().currentSeason,
                            type: 'System',
                            headline: 'Cloud save synced',
                            body: 'Your game data has been uploaded to the cloud.',
                            importance: 1,
                            date: new Date().toISOString(),
                          });
                        } else {
                          const result = await connectWithEmail(
                            connectEmail,
                            connectPassword,
                            connectMode,
                          );
                          if (result.ok) {
                            await loadFromCloud();
                          } else {
                            setConnectError(result.error ?? 'Failed');
                            setConnecting(false);
                            return;
                          }
                        }
                        setShowConnectModal(false);
                      } finally {
                        setConnecting(false);
                      }
                    }}
                  >
                    {connecting
                      ? 'Connecting...'
                      : cloudStatus === 'connected'
                        ? 'Sync'
                        : connectMode === 'create'
                          ? 'Create Account'
                          : 'Login'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setShowConnectModal(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          <SettingsSection title="About" icon={HiInformationCircle}>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Version</span>
                <span className="text-white font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Engine</span>
                <span className="text-white font-medium">React 19 + TypeScript</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Data Storage</span>
                <span className="text-white font-medium">LocalStorage + IndexedDB</span>
              </div>
              <p className="text-gray-500 text-xs pt-2 border-t border-gray-800">
                Football Career Simulator &mdash; A premium single-player career experience. All data is stored locally on your device.
              </p>
            </div>
          </SettingsSection>

          <div className="pt-4 text-center">
            <Button variant="secondary" size="lg" icon={<HiArrowPath className="w-5 h-5" />} onClick={resetDefaults}>
              Reset to Defaults
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
