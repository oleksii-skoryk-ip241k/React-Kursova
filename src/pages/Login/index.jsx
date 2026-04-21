import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { auth } from '../../firebase';
import './style.css';

const googleProvider = new GoogleAuthProvider();

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch {
      setError('Невірний email або пароль.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch {
      setError('Не вдалося увійти через Google.');
    } finally {
      setGoogleLoading(false);
    }
  }

  return (
    <div className="login-page">
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Card className="login-card shadow-lg">
          <Card.Body className="p-5">
            <div className="text-center mb-4">
              <img src="/logo512.png" alt="logo" width={72} height={72} className="mb-3" />
              <h3 className="fw-bold login-title">Minecraft Panel</h3>
              <p className="text-muted mb-0">Панель управління сервером</p>
            </div>
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Пароль</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </Form.Group>
              <Button
                type="submit"
                className="w-100 login-btn"
                disabled={loading || googleLoading}
              >
                {loading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Вхід...</>
                ) : 'Увійти'}
              </Button>

              <div className="login-divider"><span>або</span></div>

              <Button
                type="button"
                className="w-100 google-btn"
                onClick={handleGoogle}
                disabled={loading || googleLoading}
              >
                {googleLoading ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Зачекайте...</>
                ) : (
                  <><img src="/icons/google.svg" alt="Google" width={20} height={20} className="me-2" />Увійти через Google</>
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
