

export default function Files() {
  const projectName = localStorage.getItem('projectName') || 'Unnamed'
  return (
    <h1>{projectName}</h1>
  );
}