'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import "./tests.scss";
import TestsSkeleton from '../homeTestsComp/layout';

const formatCategoryLink = (title) => {
  return title?.toLowerCase().replace(/\s+/g, '-') || 'default';
};

export default function Tests() {
  const [rotateDirections, setRotateDirections] = useState({});

  // ✅ API o‘rniga static testlar
  const [tests] = useState([
      { id: 1, title: "Mathematics", isNew: true },
      { id: 2, title: "History", isNew: false },
      { id: 3, title: "Geography", isNew: true },
      { id: 4, title: "Physics", isNew: false },
      { id: 5, title: "English", isNew: true },
    ]);

  const handleMouseEnter = (id) => {
    const randomDirection = Math.random() < 0.5 ? 'left' : 'right';
    setRotateDirections(prev => ({
      ...prev,
      [id]: randomDirection
    }));
  };

  const handleMouseLeave = (id) => {
    setRotateDirections(prev => ({
      ...prev,
      [id]: null
    }));
  };

  return (
    <div className='tests-container'>
      <div className="tests-container-inner">
        <h1>Test categories 
          <Link href="/tests/all">View all 
            <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
              <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M184 112l144 144-144 144" />
            </svg>
          </Link>
        </h1>

        <div className="tests-content">
          {tests.map((test, indx) => {
            const direction = rotateDirections[test.id];

            return (
              <div className="test-card" key={test.id}>
                <Link href={`/tests/${test.id}`}>
                  <div
                    className="card-top"
                    onMouseEnter={() => handleMouseEnter(test.id)}
                    onMouseLeave={() => handleMouseLeave(test.id)}
                  >
                    <div className="card-top-top">
                      <div className={`card-number ${direction === 'left' ? 'rotate-left' :
                        direction === 'right' ? 'rotate-right' : ''
                        }`}>
                        {indx + 1}
                      </div>
                      {test.isNew && <div className="new active">New</div>}
                    </div>
                    <div className="card-top-bottom">
                      {test.title}
                    </div>
                  </div>
                  <div className="card-bottom">
                    <button onMouseEnter={() => handleMouseEnter(test.id)}
                      onMouseLeave={() => handleMouseLeave(test.id)}>
                      <span>Go to section tests</span>
                      <span>Start now</span>
                    </button>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
