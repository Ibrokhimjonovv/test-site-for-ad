"use client"
import React, { useContext } from 'react';
import "./header.scss"
import Link from 'next/link';
import LangSelector from '../languageSelector/langSelector';
import { AccessContext } from '@/contexts/contexts';

const Header = () => {
  const { setLoginStat, setRegisterStat } = useContext(AccessContext);

  return (
    <header>
      <div className="header-inner">
        <div className="logo">
          <Link href="/">TestIshla<span>.</span></Link>
        </div>
        <nav>
          <ul>
            <li>
              <Link href="/tests/all">Testlar</Link>
            </li>
            <li>
              <Link href="#">O'rganish</Link>
            </li>
            <li>
              <Link href="#">Musobaqalar</Link>
            </li>
            <li>
              <Link href="#">Vazifalar</Link>
            </li>
          </ul>
        </nav>
        <div className="login-btns">
          {/* <LangSelector /> */}
          <button onClick={() => setLoginStat(true)}>Kirish</button>
          <button onClick={() => setRegisterStat(true)}>Ro'yxatdan o'tish</button>
        </div>
      </div>
    </header>
  )
}

export default Header