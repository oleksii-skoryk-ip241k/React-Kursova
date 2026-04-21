import './style.css';
import { Card } from 'react-bootstrap';

export default function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <Card className="stat-card h-100 shadow-sm">
      <Card.Body className="d-flex align-items-center gap-3">
        <div className="stat-icon" style={{ backgroundColor: color + '22', color }}>
          <span>{icon}</span>
        </div>
        <div className="stat-text">
          <div className="stat-value">{value}</div>
          <div className="stat-title">{title}</div>
          {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        </div>
      </Card.Body>
    </Card>
  );
}
