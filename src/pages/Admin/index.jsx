import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Container, Row, Col, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import SectionCard from '../../components/SectionCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import './style.css';

export default function Admin() {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Server stats form state
  const [tps, setTps] = useState('');
  const [ram, setRam] = useState('');
  const [ramTotal, setRamTotal] = useState('');
  const [cpu, setCpu] = useState('');
  const [startedAtMins, setStartedAtMins] = useState('0');
  const [maxPlayers, setMaxPlayers] = useState('');
  // Player join times (minutes ago)
  const [playerJoinMins, setPlayerJoinMins] = useState({});

  // Add player
  const [newPlayerName, setNewPlayerName] = useState('');

  // Console log
  const [logLevel, setLogLevel] = useState('INFO');
  const [logMessage, setLogMessage] = useState('');

  const statusRef = doc(db, 'server', 'status');

  useEffect(() => {
    const unsubscribe = onSnapshot(statusRef, (snap) => {
      const data = snap.data();
      setServerData(data);
      setTps(String(data?.tps ?? ''));
      setRam(String(data?.ram ?? ''));
      setRamTotal(String(data?.ramTotal ?? ''));
      setCpu(String(data?.cpu ?? ''));
      setMaxPlayers(String(data?.maxPlayers ?? ''));
      setStartedAtMins(data?.startedAt
        ? String(Math.round((Date.now() - data.startedAt) / 60000))
        : '0');
      setPlayerJoinMins(prev => {
        const next = { ...prev };
        (data?.players || []).forEach(p => {
          if (!(p.name in next)) {
            next[p.name] = String(Math.round((Date.now() - p.joinedAt) / 60000));
          }
        });
        Object.keys(next).forEach(name => {
          if (!(data?.players || []).find(p => p.name === name)) {
            delete next[name];
          }
        });
        return next;
      });
      setLoading(false);
    });
    return unsubscribe;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleStatus() {
    const newStatus = serverData?.status === 'online' ? 'offline' : 'online';
    await updateDoc(statusRef, {
      status: newStatus,
      players: newStatus === 'offline' ? [] : serverData?.players || [],
      ...(newStatus === 'online' ? { startedAt: Date.now() } : {}),
    });
  }

  async function handleSaveStats() {
    await updateDoc(statusRef, {
      tps: parseFloat(tps) || 0,
      ram: parseFloat(ram) || 0,
      ramTotal: parseFloat(ramTotal) || 8,
      cpu: parseFloat(cpu) || 0,
      maxPlayers: parseInt(maxPlayers) || 20,
      startedAt: Date.now() - (parseInt(startedAtMins) || 0) * 60000,
    });
  }

  async function handleSavePlayerJoin(name) {
    const mins = parseInt(playerJoinMins[name]) || 0;
    const currentPlayers = serverData?.players || [];
    await updateDoc(statusRef, {
      players: currentPlayers.map(p =>
        p.name === name ? { ...p, joinedAt: Date.now() - mins * 60000 } : p
      ),
    });
  }

  async function handleAddPlayer() {
    const name = newPlayerName.trim();
    if (!name) return;
    const currentPlayers = serverData?.players || [];
    if (currentPlayers.find(p => p.name === name)) return;
    await updateDoc(statusRef, {
      players: [...currentPlayers, { name, joinedAt: Date.now() }],
    });
    setNewPlayerName('');
  }

  async function handleRemovePlayer(name) {
    const currentPlayers = serverData?.players || [];
    await updateDoc(statusRef, {
      players: currentPlayers.filter(p => p.name !== name),
    });
  }

  async function handleAddLog() {
    const msg = logMessage.trim();
    if (!msg) return;
    const currentLogs = serverData?.consoleLogs || [];
    await updateDoc(statusRef, {
      consoleLogs: [...currentLogs, `[${logLevel}] ${msg}`].slice(-50),
    });
    setLogMessage('');
  }

  async function handleClearLogs() {
    if (!window.confirm('Очистити всі логи консолі?')) return;
    await updateDoc(statusRef, { consoleLogs: [] });
  }

  if (loading) return <LoadingSpinner color="danger" />;

  const isOnline = serverData?.status === 'online';
  const players = serverData?.players || [];
  const consoleLogs = serverData?.consoleLogs || [];

  return (
    <div className="page-content">
      <Container fluid className="p-4">

        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="page-title mb-0">
              <span className="admin-badge-label me-2">ADMIN</span>
              Панель керування даними
            </h2>
            <p className="text-muted mb-0">Пряме редагування Firestore без консолі Firebase</p>
          </div>
          <Badge bg={isOnline ? 'success' : 'danger'} className="status-badge">
            {isOnline ? '● Онлайн' : '● Офлайн'}
          </Badge>
        </div>

        <Row className="g-3 mb-3">

          {/* Server status toggle */}
          <Col xs={12} md={4}>
            <SectionCard title="Статус сервера" className="h-100">
                <p className="text-muted mb-3">
                  Поточний стан: <strong>{isOnline ? 'Онлайн' : 'Офлайн'}</strong>
                </p>
                <Button variant={isOnline ? 'danger' : 'success'} className="w-100" onClick={handleToggleStatus}>
                  {isOnline ? '■ Перевести в Офлайн' : '▶ Перевести в Онлайн'}
                </Button>
            </SectionCard>
          </Col>

          {/* Resource stats */}
          <Col xs={12} md={8}>
            <SectionCard title="Ресурси сервера" className="h-100">
                <Row className="g-2">
                  <Col xs={6} sm={4}>
                    <Form.Label className="admin-field-label">TPS</Form.Label>
                    <Form.Control type="number" step="0.1" min="0" max="20" value={tps} onChange={e => setTps(e.target.value)} placeholder="0–20" />
                  </Col>
                  <Col xs={6} sm={4}>
                    <Form.Label className="admin-field-label">RAM (GB)</Form.Label>
                    <Form.Control type="number" step="0.1" min="0" value={ram} onChange={e => setRam(e.target.value)} placeholder="2.4" />
                  </Col>
                  <Col xs={6} sm={4}>
                    <Form.Label className="admin-field-label">RAM макс (GB)</Form.Label>
                    <Form.Control type="number" step="1" min="1" value={ramTotal} onChange={e => setRamTotal(e.target.value)} placeholder="8" />
                  </Col>
                  <Col xs={6} sm={4}>
                    <Form.Label className="admin-field-label">CPU (%)</Form.Label>
                    <Form.Control type="number" step="1" min="0" max="100" value={cpu} onChange={e => setCpu(e.target.value)} placeholder="0–100" />
                  </Col>
                  <Col xs={6} sm={4}>
                    <Form.Label className="admin-field-label">Макс гравців</Form.Label>
                    <Form.Control type="number" step="1" min="1" value={maxPlayers} onChange={e => setMaxPlayers(e.target.value)} placeholder="20" />
                  </Col>
                  <Col xs={12} sm={4}>
                    <Form.Label className="admin-field-label">Запущено (хвилин тому)</Form.Label>
                    <Form.Control type="number" min="0" value={startedAtMins} onChange={e => setStartedAtMins(e.target.value)} placeholder="0" />
                  </Col>
                </Row>
                <Button variant="primary" className="mt-3 px-4" onClick={handleSaveStats}>Зберегти ресурси</Button>
            </SectionCard>
          </Col>
        </Row>

        <Row className="g-3">

          {/* Players */}
          <Col xs={12} md={5}>
            <SectionCard
              title="Гравці онлайн"
              headerRight={<Badge bg="secondary">{players.length}</Badge>}
            >
                <InputGroup className="mb-3">
                  <Form.Control
                    placeholder="Ім'я гравця..."
                    value={newPlayerName}
                    onChange={e => setNewPlayerName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddPlayer()}
                  />
                  <Button variant="success" onClick={handleAddPlayer}>+ Додати</Button>
                </InputGroup>
                {players.length === 0 ? (
                  <p className="text-muted mb-0">Немає гравців</p>
                ) : (
                  <div className="admin-player-list">
                    {players.map(p => (
                      <div key={p.name} className="admin-player-row">
                        <div className="player-avatar">{p.name[0]}</div>
                        <div className="player-name flex-grow-1">{p.name}</div>
                        <Form.Control
                          type="number" min="0"
                          style={{ width: 72, padding: '2px 6px', fontSize: '0.75rem' }}
                          title="Хвилин тому приєднався"
                          value={playerJoinMins[p.name] ?? ''}
                          onChange={e => setPlayerJoinMins(prev => ({ ...prev, [p.name]: e.target.value }))}
                        />
                        <Button variant="outline-primary" size="sm" className="py-0 px-2" onClick={() => handleSavePlayerJoin(p.name)}>✓</Button>
                        <Button variant="outline-danger" size="sm" className="py-0 px-2" onClick={() => handleRemovePlayer(p.name)}>✕</Button>
                      </div>
                    ))}
                  </div>
                )}
            </SectionCard>
          </Col>

          {/* Console logs */}
          <Col xs={12} md={7}>
            <SectionCard
              title={<>Консоль <Badge bg="secondary" className="ms-2">{consoleLogs.length}</Badge></>}
              headerRight={<Button variant="outline-danger" size="sm" onClick={handleClearLogs}>Очистити</Button>}
            >
                <InputGroup className="mb-3">
                  <Form.Select style={{ maxWidth: 110 }} value={logLevel} onChange={e => setLogLevel(e.target.value)}>
                    <option>INFO</option>
                    <option>WARN</option>
                    <option>ERROR</option>
                  </Form.Select>
                  <Form.Control
                    placeholder="Текст повідомлення..."
                    value={logMessage}
                    onChange={e => setLogMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddLog()}
                  />
                  <Button variant="secondary" onClick={handleAddLog}>Додати</Button>
                </InputGroup>
                <div className="console-box admin-console">
                  {consoleLogs.length === 0
                    ? <span className="text-secondary">Логи порожні</span>
                    : [...consoleLogs].reverse().map((line, i) => (
                      <div key={i} className={`console-line ${line.includes('[WARN]') ? 'warn' : line.includes('[ERROR]') ? 'error' : ''}`}>
                        {line}
                      </div>
                    ))
                  }
                </div>
            </SectionCard>
          </Col>

        </Row>
      </Container>
    </div>
  );
}
