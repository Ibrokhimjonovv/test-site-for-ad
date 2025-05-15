"use client"
import React, { useContext } from 'react';
import "./header.scss"
import Link from 'next/link';
import LangSelector from '../languageSelector/langSelector';
import { AccessContext } from '@/contexts/contexts';
import { usePathname } from 'next/navigation';

const HeaderSkeleton = () => {
  return (
    <>
      <div className="header-skeleton">
        <div className="skeleton-balance"></div>
        <div className="skeleton-profile"></div>
      </div>
    </>
  );
};

const Header = () => {
  const { setLoginStat, setRegisterStat, profileData, profileLoading} = useContext(AccessContext);

  const pathname = usePathname()

  return (
    <header>
      <div className="header-inner">
        <div className="logo">
          <Link href="/">TestIshla<span>.</span></Link>
        </div>
        <nav>
          <ul>
            <li>
              <Link href="/tests/all" className={pathname === '/tests/all' ? "act" : ""}>Testlar</Link>
            </li>
            <li>
              <Link href="/learn" className={pathname === '/learn' ? "act" : ""}>O'rganish</Link>
            </li>
            <li>
              <Link href="/contests" className={pathname === '/contests' ? "act" : ""}>Musobaqalar</Link>
            </li>
            <li>
              <Link href="/works" className={pathname === '/works' ? "act" : ""}>Vazifalar</Link>
            </li>
          </ul>
        </nav>
        <div className="login-btns">
          {
            profileLoading ? (
              <HeaderSkeleton />
            ) : profileData !== null ? (
              <>
                <Link href="/top-up-balance" className={`top-btn ${pathname === '/top-up-balance' ? "balance-act" : ""}`}>
                  {profileData.balance} UZS
                  <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                    <path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"></path>
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M256 176v160M336 256H176"></path>
                  </svg>
                </Link>
                <Link href="/profile" className={pathname === '/profile' ? "prof-act" : ""}>Shaxsiy kabinet</Link>
              </>
            ) : (
              <>
                <button onClick={() => setLoginStat(true)}>Kirish</button>
                <button onClick={() => setRegisterStat(true)}>Ro'yxatdan o'tish</button>
              </>
            )
          }
        </div>
      </div>
    </header>
  )
}

export default Header


