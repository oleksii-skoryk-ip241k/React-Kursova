import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';

let seedingPromise = null;

const INITIAL_SERVER = {
  status: 'online',
  tps: 19.8,
  ram: 2.4,
  ramTotal: 8,
  cpu: 18,
  uptime: '3д 14г 22хв',
  players: [
    { name: 'Steve', joinedAt: Date.now() - 1000 * 60 * 134 },
    { name: 'Alex', joinedAt: Date.now() - 1000 * 60 * 108 },
    { name: 'Herobrine', joinedAt: Date.now() - 1000 * 60 * 32 },
    { name: 'Notch', joinedAt: Date.now() - 1000 * 60 * 7 },
  ],
  consoleLogs: [
    '[INFO] Server started on port 25565',
    '[INFO] World "world" loaded in 4.2s',
    '[INFO] Steve joined the game',
    '[INFO] Alex joined the game',
    '[INFO] Herobrine joined the game',
    "[WARN] Can't keep up! Did the system time change?",
    '[INFO] Steve: Hello everyone!',
    '[INFO] Alex: Hi Steve!',
    '[INFO] Notch joined the game',
    "[INFO] Saving chunks for level 'world'",
  ],
};

const INITIAL_PLUGINS = [
  { name: 'EssentialsX', version: 'v2.20.1', author: 'EssentialsX Team', icon: '🔧', enabled: true, description: 'Основний набір команд: /home, /tp, /warp, /spawn та сотні інших.' },
  { name: 'WorldEdit', version: 'v7.2.15', author: 'sk89q', icon: '🪄', enabled: true, description: 'Редактор світу в грі: маса, заповнення, копіювання, схеми.' },
  { name: 'LuckPerms', version: 'v5.4.98', author: 'Luck', icon: '🔑', enabled: true, description: 'Гнучка система прав і груп з web-редактором.' },
  { name: 'Vault', version: 'v1.7.3', author: 'MilkBowl', icon: '🏦', enabled: true, description: 'API для економіки, чату та прав — прошарок між плагінами.' },
  { name: 'ProtocolLib', version: 'v5.1.0', author: 'dmulloy2', icon: '📡', enabled: true, description: 'Бібліотека для роботи з пакетами протоколу Minecraft.' },
  { name: 'Multiverse-Core', version: 'v4.3.1', author: 'Multiverse Team', icon: '🌍', enabled: false, description: 'Управління кількома світами на одному сервері.' },
  { name: 'WorldGuard', version: 'v7.0.9', author: 'sk89q', icon: '🛡️', enabled: true, description: 'Захист регіонів та обмеження дій гравців у зонах.' },
  { name: 'CoreProtect', version: 'v22.3', author: 'Intelli', icon: '📜', enabled: true, description: 'Лог усіх дій гравців з можливістю відкату змін.' },
];

const INITIAL_CONFIG = {
  serverName: 'My Minecraft Server',
  maxPlayers: '50',
  gamemode: 'survival',
  difficulty: 'normal',
  pvp: true,
  serverPort: '25565',
  serverIp: '',
  onlineMode: true,
  levelName: 'world',
  levelType: 'minecraft:normal',
  seed: '',
  viewDistance: '10',
  motd: 'A Minecraft Server',
  maxTickTime: '60000',
  networkCompression: '256',
  spawnProtection: '16',
};

const INITIAL_BACKUPS = [
  { name: 'backup-2026-04-21-03-00', date: '21.04.2026 03:00', size: '2.34 GB', type: 'auto', status: 'ok', createdAt: 1745196000000 },
  { name: 'backup-2026-04-20-03-00', date: '20.04.2026 03:00', size: '2.31 GB', type: 'auto', status: 'ok', createdAt: 1745109600000 },
  { name: 'backup-2026-04-19-before-update', date: '19.04.2026 14:22', size: '2.28 GB', type: 'manual', status: 'ok', createdAt: 1745069320000 },
  { name: 'backup-2026-04-18-03-00', date: '18.04.2026 03:00', size: '2.25 GB', type: 'auto', status: 'ok', createdAt: 1744936800000 },
  { name: 'backup-2026-04-17-03-00', date: '17.04.2026 03:00', size: '2.20 GB', type: 'auto', status: 'ok', createdAt: 1744850400000 },
];

export async function seedFirestore() {
  if (seedingPromise) return seedingPromise;
  seedingPromise = _seed().finally(() => { seedingPromise = null; });
  return seedingPromise;
}

async function _seed() {
  try {
    const statusRef = doc(db, 'server', 'status');
    const statusSnap = await getDoc(statusRef);
    if (statusSnap.exists()) return;

    await setDoc(statusRef, INITIAL_SERVER);

    for (const plugin of INITIAL_PLUGINS) {
      await addDoc(collection(db, 'plugins'), plugin);
    }

    await setDoc(doc(db, 'configuration', 'settings'), INITIAL_CONFIG);

    for (const backup of INITIAL_BACKUPS) {
      await addDoc(collection(db, 'backups'), backup);
    }
  } catch (err) {
    console.warn('seedFirestore: could not seed data (offline or permission denied)', err.message);
  }
}
