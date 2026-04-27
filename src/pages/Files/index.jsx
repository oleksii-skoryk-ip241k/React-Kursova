
import { useState, useEffect } from 'react';
import {
  collection, onSnapshot, addDoc, deleteDoc, updateDoc,
  doc, getDocs, query, where, writeBatch,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { Container, Card, Table, Button, Breadcrumb, Badge, Form } from 'react-bootstrap';
import './style.css';

const INITIAL_FILE_TREE = {
  '/': [
    { name: 'plugins', type: 'folder' },
    { name: 'world', type: 'folder' },
    { name: 'world_nether', type: 'folder' },
    { name: 'logs', type: 'folder' },
    { name: 'backups', type: 'folder' },
    { name: 'server.properties', type: 'file', size: '4.2 KB', modified: '21.04.2026' },
    { name: 'eula.txt', type: 'file', size: '0.2 KB', modified: '15.04.2026' },
    { name: 'ops.json', type: 'file', size: '0.5 KB', modified: '20.04.2026' },
    { name: 'whitelist.json', type: 'file', size: '1.1 KB', modified: '19.04.2026' },
    { name: 'banned-players.json', type: 'file', size: '0.8 KB', modified: '18.04.2026' },
    { name: 'server.jar', type: 'file', size: '43.7 MB', modified: '10.04.2026' },
  ],
  '/plugins': [
    { name: 'EssentialsX.jar', type: 'file', size: '2.1 MB', modified: '12.04.2026' },
    { name: 'LuckPerms.jar', type: 'file', size: '3.4 MB', modified: '11.04.2026' },
    { name: 'WorldEdit.jar', type: 'file', size: '5.8 MB', modified: '10.04.2026' },
    { name: 'Vault.jar', type: 'file', size: '0.3 MB', modified: '09.04.2026' },
    { name: 'EssentialsX', type: 'folder' },
    { name: 'LuckPerms', type: 'folder' },
  ],
  '/logs': [
    { name: 'latest.log', type: 'file', size: '1.2 MB', modified: '21.04.2026' },
    { name: '2026-04-20-1.log.gz', type: 'file', size: '0.4 MB', modified: '20.04.2026' },
    { name: '2026-04-19-1.log.gz', type: 'file', size: '0.3 MB', modified: '19.04.2026' },
  ],
};

function getIcon(type, name) {
  if (type === 'folder') return '📁';
  if (name.endsWith('.jar')) return '☕';
  if (name.endsWith('.json')) return '📋';
  if (name.endsWith('.log') || name.endsWith('.gz')) return '📄';
  if (name.endsWith('.properties') || name.endsWith('.txt')) return '📝';
  return '📄';
}

function todayStr() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()}`;
}

export default function Files() {
  const [fileTree, setFileTree] = useState({});
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState('/');
  const [renamingName, setRenamingName] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'files'), (snap) => {
      if (snap.empty) {
        seedFiles();
        return;
      }
      const tree = {};
      snap.docs.forEach(d => {
        const data = { id: d.id, ...d.data() };
        if (!tree[data.path]) tree[data.path] = [];
        tree[data.path].push(data);
      });
      Object.keys(tree).forEach(p => {
        tree[p].sort((a, b) => {
          if (a.type !== b.type) return a.type === 'folder' ? -1 : 1;
          return a.name.localeCompare(b.name);
        });
      });
      setFileTree(tree);
      setLoading(false);
    });
    return unsub;
  }, []);

  async function seedFiles() {
    const batch = writeBatch(db);
    for (const [p, entries] of Object.entries(INITIAL_FILE_TREE)) {
      for (const entry of entries) {
        const ref = doc(collection(db, 'files'));
        batch.set(ref, { ...entry, path: p });
      }
    }
    await batch.commit();
  }

  const segments = path === '/' ? [] : path.split('/').filter(Boolean);
  const entries = fileTree[path] || [];

  function navigate(folder) {
    const newPath = path === '/' ? `/${folder}` : `${path}/${folder}`;
    setPath(newPath);
  }

  function navigateTo(index) {
    if (index === -1) { setPath('/'); return; }
    setPath('/' + segments.slice(0, index + 1).join('/'));
  }

  async function handleDelete(name) {
    if (!window.confirm(`Видалити "${name}"?`)) return;
    const item = entries.find(e => e.name === name);
    if (!item) return;
    await deleteDoc(doc(db, 'files', item.id));
    if (item.type === 'folder') {
      const folderPath = path === '/' ? `/${name}` : `${path}/${name}`;
      const q = query(
        collection(db, 'files'),
        where('path', '>=', folderPath),
        where('path', '<=', folderPath + '\uf8ff'),
      );
      const childSnap = await getDocs(q);
      const batch = writeBatch(db);
      childSnap.docs.forEach(d => batch.delete(d.ref));
      await batch.commit();
    }
  }

  async function handleCreateFolder() {
    const name = window.prompt('Назва нової папки:');
    if (!name?.trim()) return;
    const trimmed = name.trim();
    if (entries.some(e => e.name === trimmed)) { alert('Вже існує!'); return; }
    await addDoc(collection(db, 'files'), { path, name: trimmed, type: 'folder' });
  }

  async function handleCreateFile() {
    const name = window.prompt('Назва нового файлу:');
    if (!name?.trim()) return;
    const trimmed = name.trim();
    if (entries.some(e => e.name === trimmed)) { alert('Вже існує!'); return; }
    await addDoc(collection(db, 'files'), { path, name: trimmed, type: 'file', size: '0 KB', modified: todayStr() });
  }

  function startRename(name) {
    setRenamingName(name);
    setRenameValue(name);
  }

  async function commitRename(oldName) {
    const newName = renameValue.trim();
    setRenamingName(null);
    if (!newName || newName === oldName) return;
    if (entries.some(e => e.name === newName)) { alert('Вже існує!'); return; }
    const item = entries.find(e => e.name === oldName);
    if (!item) return;
    await updateDoc(doc(db, 'files', item.id), { name: newName });
    if (item.type === 'folder') {
      const oldKey = path === '/' ? `/${oldName}` : `${path}/${oldName}`;
      const newKey = path === '/' ? `/${newName}` : `${path}/${newName}`;
      const q = query(
        collection(db, 'files'),
        where('path', '>=', oldKey),
        where('path', '<=', oldKey + '\uf8ff'),
      );
      const childSnap = await getDocs(q);
      const batch = writeBatch(db);
      childSnap.docs.forEach(d => {
        const currentPath = d.data().path;
        batch.update(d.ref, { path: newKey + currentPath.slice(oldKey.length) });
      });
      await batch.commit();
    }
  }

  return (
    <div className="page-content">
      <Container fluid className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="page-title mb-0">Файли сервера</h2>
            <p className="text-muted mb-0">Перегляд та управління файлами</p>
          </div>
          <div className="d-flex gap-2">
            <Button variant="outline-secondary" size="sm" onClick={handleCreateFile}>📄 Новий файл</Button>
            <Button style={{ backgroundColor: '#1BA1E2', border: 'none' }} size="sm" onClick={handleCreateFolder}>📁 Нова папка</Button>
          </div>
        </div>

        <Card className="shadow-sm border-0 rounded-3">
          <Card.Body>
            {loading ? (
              <div className="d-flex justify-content-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (<>
            <Breadcrumb className="mb-3 files-breadcrumb">
              <Breadcrumb.Item onClick={() => setPath('/')} active={path === '/'}>
                🖥️ Сервер
              </Breadcrumb.Item>
              {segments.map((seg, i) => (
                <Breadcrumb.Item
                  key={i}
                  onClick={() => navigateTo(i)}
                  active={i === segments.length - 1}
                >
                  {seg}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>

            <Table hover className="files-table mb-0">
              <thead>
                <tr>
                  <th>Назва</th>
                  <th>Розмір</th>
                  <th>Змінено</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {path !== '/' && (
                  <tr className="folder-row" onClick={() => navigateTo(segments.length - 2)}>
                    <td colSpan={4}>📁 ..</td>
                  </tr>
                )}
                {entries.map(entry => (
                  <tr
                    key={entry.name}
                    className={entry.type === 'folder' ? 'folder-row' : ''}
                    onClick={() => entry.type === 'folder' && renamingName !== entry.name && navigate(entry.name)}
                  >
                    <td>
                      <span className="file-icon">{getIcon(entry.type, entry.name)}</span>
                      {renamingName === entry.name ? (
                        <Form.Control
                          autoFocus
                          size="sm"
                          style={{ display: 'inline-block', width: 'auto' }}
                          value={renameValue}
                          onChange={e => setRenameValue(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitRename(entry.name);
                            if (e.key === 'Escape') setRenamingName(null);
                          }}
                          onBlur={() => commitRename(entry.name)}
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        entry.name
                      )}
                      {entry.type === 'folder' && renamingName !== entry.name && (
                        <Badge bg="secondary" className="ms-2 py-0" style={{ fontSize: '0.7rem' }}>папка</Badge>
                      )}
                    </td>
                    <td className="text-muted">{entry.size || '—'}</td>
                    <td className="text-muted">{entry.modified || '—'}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="d-flex gap-1 justify-content-end">
                        <Button variant="outline-secondary" size="sm" className="py-0 px-2" title="Перейменувати" onClick={() => startRename(entry.name)}>✏️</Button>
                        {entry.type === 'file' && (
                          <Button variant="outline-primary" size="sm" className="py-0 px-2" title="Завантажити">↓</Button>
                        )}
                        <Button variant="outline-danger" size="sm" className="py-0 px-2" title="Видалити" onClick={() => handleDelete(entry.name)}>✕</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            </>)}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
