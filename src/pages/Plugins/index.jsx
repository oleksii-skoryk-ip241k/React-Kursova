
import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Container, Row, Col, Button, Form, InputGroup } from 'react-bootstrap';
import PluginCard from '../../components/PluginCard';
import './style.css';

export default function Plugins() {
  const [plugins, setPlugins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'plugins'), (snap) => {
      setPlugins(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function handleToggle(id) {
    const plugin = plugins.find(p => p.id === id);
    await updateDoc(doc(db, 'plugins', id), { enabled: !plugin.enabled });
  }

  async function handleDelete(id) {
    await deleteDoc(doc(db, 'plugins', id));
  }

  const filtered = plugins.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-content">
      <Container fluid className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="page-title mb-0">Плагіни</h2>
            <p className="text-muted mb-0">{plugins.filter(p => p.enabled).length} з {plugins.length} увімкнено</p>
          </div>
          <Button style={{ backgroundColor: '#1BA1E2', border: 'none' }}>
            + Встановити плагін
          </Button>
        </div>

        <InputGroup className="mb-4 plugins-search">
          <InputGroup.Text>🔍</InputGroup.Text>
          <Form.Control
            placeholder="Пошук плагінів..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </InputGroup>

        {loading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-primary" role="status" />
          </div>
        ) : (
          <Row className="g-3">
            {filtered.length === 0 && (
              <Col><p className="text-muted">Нічого не знайдено</p></Col>
            )}
            {filtered.map(plugin => (
              <Col key={plugin.id} xs={12} sm={6} xl={4}>
                <PluginCard plugin={plugin} onToggle={handleToggle} onDelete={handleDelete} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
}
