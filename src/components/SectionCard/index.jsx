import { Card } from 'react-bootstrap';

export default function SectionCard({ title, children, className = '', headerRight = null }) {
  return (
    <Card className={`shadow-sm border-0 rounded-3 ${className}`}>
      <Card.Body>
        {title && (
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="section-label mb-0">{title}</h6>
            {headerRight}
          </div>
        )}
        {children}
      </Card.Body>
    </Card>
  );
}
