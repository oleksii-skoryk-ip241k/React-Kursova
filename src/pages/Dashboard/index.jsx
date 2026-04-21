import { useState, useEffect } from 'react'

export default function Dashboard() {
  const [projectName, setProjectName] = useState(localStorage.getItem('projectName') || 'Unnamed');

  useEffect(() => {
    localStorage.setItem('projectName', projectName)
  }, [projectName])

  return (
    <div>
      <h1>Dashboard</h1>
      <input onChange={(e) => setProjectName(e.target.value)} value={projectName}></input>
      <button onClick={() => localStorage.removeItem('projectName')}>Скинути ім'я проєкту</button>
      <button onClick={() => localStorage.clear()}>Скинути всі налаштування</button>
    </div>
  );
}