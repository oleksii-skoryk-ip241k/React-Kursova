import './style.css';

import { Image } from 'react-bootstrap';

export default function Profile() {
  return (
    <div className="profile">
      <div className='profile-displays'>
        <Image
          src="/avatar.jpg"
          alt="Avatar"
          roundedCircle
          width={50}
          height={50}
          />
        <p className='profile-username'>Nickname</p>
      </div>
      <div className='profile-logout'>
        <Image src="/icons/logout.png" alt="Logout" width={50} height={50} />
      </div>
    </div>
  );
}