
import { useState, useEffect } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { Container, Card, Form, Row, Col, Button, Tab, Nav, Alert } from 'react-bootstrap';
import './style.css';

const DEFAULTS = {
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

export default function Configuration() {
  const [values, setValues] = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'configuration', 'settings'), (snap) => {
      if (snap.exists()) setValues(snap.data());
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  function handleChange(key, value) {
    setValues(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    await setDoc(doc(db, 'configuration', 'settings'), values);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  return (
    <div className="page-content">
      <Container fluid className="p-4">
        <div className="mb-4">
          <h2 className="page-title mb-0">Конфігурація</h2>
          <p className="text-muted mb-0">Налаштування server.properties</p>
        </div>

        {saved && <Alert variant="success" className="py-2">✔ Налаштування збережено</Alert>}

        <Form onSubmit={handleSave}>
          <Tab.Container defaultActiveKey="general">
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Header className="bg-white border-bottom pt-3 px-3 pb-0">
                <Nav variant="tabs" className="config-tabs">
                  <Nav.Item><Nav.Link eventKey="general">⚙️ Загальні</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="network">🌐 Мережа</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="world">🌍 Світ</Nav.Link></Nav.Item>
                  <Nav.Item><Nav.Link eventKey="performance">📊 Продуктивність</Nav.Link></Nav.Item>
                </Nav>
              </Card.Header>
              <Card.Body className="p-4">
                <Tab.Content>
                  {/* General */}
                  <Tab.Pane eventKey="general">
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="config-label">Назва сервера</Form.Label>
                          <Form.Control value={values.serverName} onChange={e => handleChange('serverName', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="config-label">MOTD (повідомлення дня)</Form.Label>
                          <Form.Control value={values.motd} onChange={e => handleChange('motd', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">Максимум гравців</Form.Label>
                          <Form.Control type="number" min={1} max={1000} value={values.maxPlayers} onChange={e => handleChange('maxPlayers', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">Режим гри</Form.Label>
                          <Form.Select value={values.gamemode} onChange={e => handleChange('gamemode', e.target.value)}>
                            <option value="survival">Виживання</option>
                            <option value="creative">Творчий</option>
                            <option value="adventure">Пригода</option>
                            <option value="spectator">Спостерігач</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">Складність</Form.Label>
                          <Form.Select value={values.difficulty} onChange={e => handleChange('difficulty', e.target.value)}>
                            <option value="peaceful">Мирна</option>
                            <option value="easy">Легка</option>
                            <option value="normal">Нормальна</option>
                            <option value="hard">Важка</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">Захист спавну (радіус)</Form.Label>
                          <Form.Control type="number" min={0} value={values.spawnProtection} onChange={e => handleChange('spawnProtection', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="d-flex align-items-center gap-2 mt-4 pt-2">
                          <Form.Check
                            type="switch"
                            id="pvp"
                            label="PvP увімкнено"
                            checked={values.pvp}
                            onChange={e => handleChange('pvp', e.target.checked)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* Network */}
                  <Tab.Pane eventKey="network">
                    <Row className="g-3">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">Порт сервера</Form.Label>
                          <Form.Control type="number" value={values.serverPort} onChange={e => handleChange('serverPort', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">IP сервера</Form.Label>
                          <Form.Control placeholder="(порожньо = всі адреси)" value={values.serverIp} onChange={e => handleChange('serverIp', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">Стиснення мережі (bytes)</Form.Label>
                          <Form.Control type="number" value={values.networkCompression} onChange={e => handleChange('networkCompression', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group className="d-flex align-items-center gap-2 mt-4 pt-2">
                          <Form.Check
                            type="switch"
                            id="onlineMode"
                            label="Online Mode (Авторизація Mojang)"
                            checked={values.onlineMode}
                            onChange={e => handleChange('onlineMode', e.target.checked)}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* World */}
                  <Tab.Pane eventKey="world">
                    <Row className="g-3">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">Назва рівня</Form.Label>
                          <Form.Control value={values.levelName} onChange={e => handleChange('levelName', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">Тип світу</Form.Label>
                          <Form.Select value={values.levelType} onChange={e => handleChange('levelType', e.target.value)}>
                            <option value="minecraft:normal">Нормальний</option>
                            <option value="minecraft:flat">Плаский</option>
                            <option value="minecraft:large_biomes">Великі біоми</option>
                            <option value="minecraft:amplified">Підсилений</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">Сид генерації</Form.Label>
                          <Form.Control placeholder="(порожньо = випадковий)" value={values.seed} onChange={e => handleChange('seed', e.target.value)} />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label className="config-label">Дальність огляду (чанки)</Form.Label>
                          <Form.Control type="number" min={3} max={32} value={values.viewDistance} onChange={e => handleChange('viewDistance', e.target.value)} />
                          <Form.Text className="text-muted">Більше = вищий вплив на RAM</Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab.Pane>

                  {/* Performance */}
                  <Tab.Pane eventKey="performance">
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label className="config-label">Max Tick Time (мс)</Form.Label>
                          <Form.Control type="number" value={values.maxTickTime} onChange={e => handleChange('maxTickTime', e.target.value)} />
                          <Form.Text className="text-muted">-1 вимикає watchdog</Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
              <Card.Footer className="bg-white border-top d-flex justify-content-end gap-2 p-3">
                <Button variant="outline-secondary" onClick={() => setValues(DEFAULTS)}>Скинути</Button>
                <Button type="submit" style={{ backgroundColor: '#1BA1E2', border: 'none' }}>Зберегти зміни</Button>
              </Card.Footer>
            </Card>
          </Tab.Container>
        </Form>
      </Container>
    </div>
  );
}
