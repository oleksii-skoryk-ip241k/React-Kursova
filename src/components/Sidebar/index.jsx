import './style.css';
import { useState } from 'react';
import {links} from './settings.js';

import {Stack} from "react-bootstrap";

import NavigationLink from "./NavigationLink";
import Profile from "./Profile";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <button
          className="hamburger-btn"
          onClick={() => setIsOpen(true)}
          aria-label="Відкрити меню"
        >
          &#9776;
        </button>
      )}
      {isOpen && (
        <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />
      )}
      <div className={`sidebar${isOpen ? ' sidebar--open' : ''}`}>
        <button className="sidebar-close-btn" onClick={() => setIsOpen(false)} aria-label="Закрити меню">
          &times;
        </button>
        <div className="sidebar-logo">
          <img src={`${process.env.PUBLIC_URL}/logo512.png`} alt='logo' width={64} height={64} />
        </div>
        <hr className="border-white border-1 opacity-50 my-3" />
        <div className='sidebar-list'>
          <Stack gap={1}>
            {links.map((link) => (
              <NavigationLink key={link.href} {...link} />
            ))}
          </Stack>
        </div>
        <div className='sidebar-profile'>
          <Profile />
        </div>
      </div>
    </>
  );
}