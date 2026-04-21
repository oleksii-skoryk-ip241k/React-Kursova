import './style.css';

import {Button} from 'react-bootstrap';
import { useMatch } from 'react-router-dom';

export default function NavigationLink({ label, href, imgurl, selected=false }) {
  const match = useMatch(href);
  if (match) {
    selected = true;
  }

  return (
    <a href={href} className={`side-link ${selected ? 'selected' : ''}`}>
        <img
            src={imgurl}
            alt={label}
            width={50}
            height={50} />
        {label}
    </a>
  );
}