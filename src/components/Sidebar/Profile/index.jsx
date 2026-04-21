import './style.css';

import { signOut } from 'firebase/auth';
import { auth } from '../../../firebase';
import { useAuth } from '../../../context/AuthContext';

export default function Profile() {
  const { user } = useAuth();

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Admin';
  const initials = displayName.slice(0, 2).toUpperCase();

  async function handleLogout() {
    await signOut(auth);
  }

  return (
    <div className="profile">
      <div className='profile-displays'>
        {user?.photoURL
          ? <img src={user.photoURL} alt="Avatar" className="profile-avatar-img" referrerPolicy="no-referrer" />
          : <div className="profile-avatar">{initials}</div>
        }
        <div>
          <p className='profile-username'>{displayName}</p>
          {user?.email && <p className='profile-email'>{user.email}</p>}
        </div>
      </div>
      <button className='profile-logout' onClick={handleLogout} title="Вийти">
        <img src="/icons/logout.png" alt="Logout" width={36} height={36} />
      </button>
    </div>
  );
}
