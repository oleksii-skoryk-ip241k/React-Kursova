import { useState, useEffect, useReducer } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import StatCard from '../../components/StatCard';
import './style.css';

function formatTimeOnline(joinedAt) {
  const diff = Math.floor((Date.now() - joinedAt) / 1000);
  const h = Math.floor(diff / 3600);
  const m = Math.floor((diff % 3600) / 60);
  if (h > 0) return `${h}г ${m}хв`;
  return `${m}хв`;
}

export default function Dashboard() {
  const [serverData, setServerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  useEffect(() => {
    const interval = setInterval(forceUpdate, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'server', 'status'), (snap) => {
      setServerData(snap.data());
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  async function simulateAction(action) {
    setActionLoading(action);
    const statusRef = doc(db, 'server', 'status');
    const currentLogs = serverData?.consoleLogs || [];
    const now = new Date().toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTimeout(async () => {
      if (action === 'stop') {
        await updateDoc(statusRef, {
          status: 'offline',
          players: [],
          consoleLogs: [...currentLogs,
            `[INFO] Stopping the server...`,
            `[INFO] Kicked all players from the server`,
            `[INFO] Server stopped at ${now}`,
          ],
        });
        setActionLoading(null);
      } else if (action === 'start') {
        await updateDoc(statusRef, {
          status: 'online',
          consoleLogs: [...currentLogs,
            `[INFO] Starting server...`,
            `[INFO] Done (2.341s)! For help, type "help"`,
          ],
        });
        setActionLoading(null);
      } else if (action === 'restart') {
        await updateDoc(statusRef, {
          status: 'offline',
          players: [],
          consoleLogs: [...currentLogs,
            `[INFO] Restarting server...`,
            `[INFO] Kicked all players from the server`,
          ],
        });
        setTimeout(async () => {
          await updateDoc(statusRef, {
            status: 'online',
            consoleLogs: [...currentLogs,
              `[INFO] Restarting server...`,
              `[INFO] Kicked all players from the server`,
              `[INFO] Server restarted successfully`,
              `[INFO] Done (2.341s)! For help, type "help"`,
            ],
          });
          setActionLoading(null);
        }, 2000);
      }
    }, 2000);
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  const isOnline = serverData?.status === 'online';
  const players = serverData?.players || [];
  const consoleLogs = serverData?.consoleLogs || [];
  const ramPercent = Math.round((serverData?.ram / serverData?.ramTotal) * 100) || 0;

  return (
    <div className="page-content">
      <Container fluid className="p-4">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h2 className="page-title mb-0">Dashboard</h2>
            <p className="text-muted mb-0">Загальний стан сервера</p>
          </div>
          <Badge bg={isOnline ? 'success' : 'danger'} className="status-badge">
            {isOnline ? '● Онлайн' : '● Офлайн'}
          </Badge>
        </div>

        <Row className="g-3 mb-4">
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              title="Статус сервера"
              value={isOnline ? 'Онлайн' : 'Офлайн'}
              subtitle="25565 порт"
              icon="🖥️"
              color={isOnline ? '#22c55e' : '#ef4444'}
            />
          </Col>
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              title="Гравці онлайн"
              value={isOnline ? `${players.length} / ${serverData?.maxPlayers || 50}` : '0 / 50'}
              subtitle="Максимум 50"
              icon="👥"
              color="#1BA1E2"
            />
          </Col>
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              title="TPS"
              value={isOnline ? serverData?.tps : '—'}
              subtitle="Максимум 20"
              icon="⚡"
              color="#f59e0b"
            />
          </Col>
          <Col xs={12} sm={6} xl={3}>
            <StatCard
              title="Оперативна пам'ять"
              value={isOnline ? `${serverData?.ram} GB` : '—'}
              subtitle={`з ${serverData?.ramTotal} GB`}
              icon="💾"
              color="#8b5cf6"
            />
          </Col>
        </Row>

        <Row className="g-3 mb-4">
          <Col xs={12} md={6}>
            <Card className="h-100 shadow-sm border-0 rounded-3">
              <Card.Body>
                <h6 className="section-label mb-3">Використання ресурсів</h6>
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">RAM: {serverData?.ram} GB / {serverData?.ramTotal} GB</small>
                  <small className="text-muted">{ramPercent}%</small>
                </div>
                <ProgressBar now={ramPercent} variant="primary" className="mb-3" style={{ height: 10, borderRadius: 6 }} />
                <div className="d-flex justify-content-between mb-1">
                  <small className="text-muted">CPU</small>
                  <small className="text-muted">{serverData?.cpu}%</small>
                </div>
                <ProgressBar now={serverData?.cpu || 0} variant="success" style={{ height: 10, borderRadius: 6 }} />
                <div className="mt-3">
                  <small className="text-muted">Час роботи: <strong>{serverData?.uptime}</strong></small>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={6}>
            <Card className="h-100 shadow-sm border-0 rounded-3">
              <Card.Body>
                <h6 className="section-label mb-3">Управління сервером</h6>
                <div className="d-flex flex-wrap gap-2 mb-3">
                  <Button
                    variant="success"
                    className="control-btn"
                    disabled={isOnline || actionLoading !== null}
                    onClick={() => simulateAction('start')}
                  >
                    {actionLoading === 'start' ? <span className="spinner-border spinner-border-sm" /> : '▶ Запустити'}
                  </Button>
                  <Button
                    variant="danger"
                    className="control-btn"
                    disabled={!isOnline || actionLoading !== null}
                    onClick={() => simulateAction('stop')}
                  >
                    {actionLoading === 'stop' ? <span className="spinner-border spinner-border-sm" /> : '■ Зупинити'}
                  </Button>
                  <Button
                    variant="warning"
                    className="control-btn"
                    disabled={!isOnline || actionLoading !== null}
                    onClick={() => simulateAction('restart')}
                  >
                    {actionLoading === 'restart' ? <span className="spinner-border spinner-border-sm" /> : '↺ Перезапустити'}
                  </Button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <Button variant="outline-secondary" size="sm">Зберегти світ</Button>
                  <Button variant="outline-secondary" size="sm">Очистити кеш</Button>
                  <Button variant="outline-secondary" size="sm">Переглянути логи</Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-3">
          <Col xs={12} md={5}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body>
                <h6 className="section-label mb-3">Гравці онлайн</h6>
                {isOnline ? (
                  <div className="player-list">
                    {players.map(p => (
                      <div key={p.name} className="player-row">
                        <div className="player-avatar">{p.name[0]}</div>
                        <div className="player-name">{p.name}</div>
                        <div className="player-time text-muted">{formatTimeOnline(p.joinedAt)}</div>
                        <Button variant="outline-danger" size="sm" className="py-0 px-2">Кік</Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mb-0">Сервер офлайн</p>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} md={7}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Body>
                <h6 className="section-label mb-3">Консоль (останні записи)</h6>
                <div className="console-box">
                  {consoleLogs.map((line, i) => (
                    <div key={i} className={`console-line ${line.includes('[WARN]') ? 'warn' : ''}`}>
                      {line}
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
