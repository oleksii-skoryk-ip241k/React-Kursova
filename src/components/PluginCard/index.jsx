import './style.css';
import { Card, Badge, Button, Form } from 'react-bootstrap';

export default function PluginCard({ plugin, onToggle, onDelete }) {
  return (
    <Card className={`plugin-card shadow-sm border-0 rounded-3 h-100 ${!plugin.enabled ? 'disabled' : ''}`}>
      <Card.Body className="d-flex flex-column gap-2">
        <div className="d-flex align-items-start justify-content-between">
          <div className="plugin-icon">{plugin.icon}</div>
          <Form.Check
            type="switch"
            checked={plugin.enabled}
            onChange={() => onToggle(plugin.id)}
            title={plugin.enabled ? 'Вимкнути' : 'Увімкнути'}
          />
        </div>
        <div>
          <div className="plugin-name">{plugin.name}</div>
          <Badge bg="secondary" className="plugin-version">{plugin.version}</Badge>
        </div>
        <p className="plugin-desc text-muted mb-0">{plugin.description}</p>
        <div className="d-flex align-items-center justify-content-between mt-auto pt-2 border-top">
          <small className="text-muted">by {plugin.author}</small>
          <Button
            variant="outline-danger"
            size="sm"
            className="py-0 px-2"
            onClick={() => onDelete(plugin.id)}
          >
            Видалити
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
