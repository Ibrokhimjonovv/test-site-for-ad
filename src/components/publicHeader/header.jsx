"use client"
import React, { useContext, useState } from 'react';
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
  const { setLoginStat, setRegisterStat, profileData, profileLoading } = useContext(AccessContext);
  const [togg, setTogg] = useState(false);

  const pathname = usePathname()

  const formatBalance = (number) => {
    return number?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const toggleMen = () => {
    setTogg(!togg)
  }

  

  return (
    <>
      <header>
        <div className="header-inner">
          <div className="logo">
            <Link href="/">TestWork<span>.</span></Link>
          </div>
          <div className="hamb" onClick={toggleMen}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <nav className='desk-nav'>
            <ul>
              <li>
                <Link href="/tests/all" className={pathname === '/tests/all' ? "act" : ""}>Tests</Link>
              </li>
              <li>
                <Link href="/learn" className={pathname === '/learn' ? "act" : ""}>Learn</Link>
              </li>
              <li>
                <Link href="/contests" className={pathname === '/competitions' ? "act" : ""}>Competitions</Link>
              </li>
              <li>
                <Link href="/works" className={pathname === '/works' ? "act" : ""}>Works</Link>
              </li>
            </ul>
          </nav>
          <div className="login-btns desk-btns">
            {
              profileLoading ? (
                <HeaderSkeleton />
              ) : profileData !== null ? (
                <>
                  <Link href="/top-up-balance" className={`top-btn ${pathname === '/top-up-balance' ? "balance-act" : ""}`}>
                    {formatBalance(profileData.balance)} USD
                    <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                      <path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"></path>
                      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M256 176v160M336 256H176"></path>
                    </svg>
                  </Link>
                  <Link href={profileData.is_superuser ? "/adminPanel/admin-sciences" : "/profile"} className={pathname === '/profile' ? "prof-act" : ""}>{profileData.is_superuser ? "Admin panel" : "Profile"}</Link>
                </>
              ) : (
                <>
                  <button onClick={() => setLoginStat(true)}>Login</button>
                  <button onClick={() => setRegisterStat(true)}>Sign Up</button>
                </>
              )
            }
          </div>
        </div>
      </header>
      <div className={`off-shape ${togg ? "act" : ""}`}></div>
      <div className={`off-can ${togg ? "act" : ""}`}>
        <div className="hamb" onClick={toggleMen}>
          <span></span>
          <span></span>
        </div>
        <nav >
          <ul>
            <li>
              <Link href="/tests/all" className={pathname === '/tests/all' ? "act" : ""}>Tests</Link>
            </li>
            <li>
              <Link href="/learn" className={pathname === '/learn' ? "act" : ""}>Learn</Link>
            </li>
            <li>
              <Link href="/contests" className={pathname === '/competitions' ? "act" : ""}>Competitions</Link>
            </li>
            <li>
              <Link href="/works" className={pathname === '/works' ? "act" : ""}>Works</Link>
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
                  {formatBalance(profileData.balance)} USD
                  <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                    <path d="M448 256c0-106-86-192-192-192S64 150 64 256s86 192 192 192 192-86 192-192z" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32"></path>
                    <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M256 176v160M336 256H176"></path>
                  </svg>
                </Link>
                <Link href={profileData.is_superuser ? "/adminPanel/admin-sciences" : "/profile"} className={pathname === '/profile' ? "prof-act" : ""}>{profileData.is_superuser ? "Admin panel" : "Profile"}</Link>
              </>
            ) : (
              <>
                <button onClick={() => {
                  setLoginStat(true)
                  setTogg(false)
                }}>Login</button>
                <button onClick={() => {
                  setRegisterStat(true)
                  setTogg(false)
                }}>Sign Up</button>
              </>
            )
          }
        </div>
      </div>
    </>

  )
}

export default Header


