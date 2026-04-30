export default function LoadingSpinner({ color = 'primary' }) {
  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <div className={`spinner-border text-${color}`} role="status" />
    </div>
  );
}
