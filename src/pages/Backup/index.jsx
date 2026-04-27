
import { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Container, Card, Table, Button, Badge, ProgressBar } from 'react-bootstrap';
import './style.css';

export default function Backup() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'backups'), (snap) => {
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.createdAt - a.createdAt);
      setBackups(data);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  function handleCreate() {
    if (creating) return;
    setCreating(true);
    setProgress(0);
    let current = 0;
    const interval = setInterval(async () => {
      current += 10;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const name = `backup-${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}-manual`;
        const dateStr = `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
        await addDoc(collection(db, 'backups'), {
          name,
          date: dateStr,
          size: '2.35 GB',
          type: 'manual',
          status: 'ok',
          createdAt: Date.now(),
        });
        await addDoc(collection(db, 'files'), {
          path: '/backups',
          name: name + '.zip',
          type: 'file',
          size: '2.35 GB',
          modified: `${pad(now.getDate())}.${pad(now.getMonth()+1)}.${now.getFullYear()}`,
        });
        setCreating(false);
        setProgress(0);
      }
    }, 200);
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'backups', id));
  }

  return (
    <div className="page-content">
      <Container fluid className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="page-title mb-0">Резервні копії</h2>
            <p className="text-muted mb-0">Автоматично: щодня о 03:00</p>
          </div>
          <Button
            style={{ backgroundColor: '#1BA1E2', border: 'none' }}
            disabled={creating}
            onClick={handleCreate}
          >
            {creating ? (
              <><span className="spinner-border spinner-border-sm me-2" />Створення...</>
            ) : '+ Створити резервну копію'}
          </Button>
        </div>

        {creating && (
          <div className="mb-3">
            <small className="text-muted d-block mb-1">Архівування файлів сервера...</small>
            <ProgressBar animated now={progress} label={`${progress}%`} style={{ borderRadius: 8 }} />
          </div>
        )}

        <Card className="shadow-sm border-0 rounded-3">
          <Card.Body>
            {loading ? (
              <div className="d-flex justify-content-center py-4">
                <div className="spinner-border text-primary" role="status" />
              </div>
            ) : (
            <Table hover className="backup-table mb-0">
              <thead>
                <tr>
                  <th>Назва</th>
                  <th>Дата</th>
                  <th>Розмір</th>
                  <th>Тип</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {backups.map(b => (
                  <tr key={b.id}>
                    <td>
                      <span className="backup-icon">📦</span>
                      <span className="backup-name">{b.name}</span>
                    </td>
                    <td className="text-muted">{b.date}</td>
                    <td className="text-muted">{b.size}</td>
                    <td>
                      <Badge bg={b.type === 'manual' ? 'primary' : 'secondary'} style={b.type === 'manual' ? { backgroundColor: '#1BA1E2' } : {}}>
                        {b.type === 'manual' ? 'Ручна' : 'Авто'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1 justify-content-end">
                        <Button variant="outline-success" size="sm" className="py-0 px-2" title="Відновити">↩ Відновити</Button>
                        <Button variant="outline-secondary" size="sm" className="py-0 px-2" title="Завантажити">↓</Button>
                        <Button variant="outline-danger" size="sm" className="py-0 px-2" onClick={() => handleDelete(b.id)} title="Видалити">✕</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
