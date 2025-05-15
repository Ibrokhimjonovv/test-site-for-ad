'use client'
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import "./tests.scss";
import TestsSkeleton from '../homeTestsComp/layout';

const formatCategoryLink = (title) => {
  return title?.toLowerCase().replace(/\s+/g, '-') || 'default';
};

export default function Tests() {
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
        const response = await fetch(`/site/categories`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch tests');
        }

        const mappedData = result.data.map(category => ({
          id: category.id,
          testImage: category.category_img || "https://cdn.testbor.com/0/quiz-category/01JPMA7KTREH7RMB957PAQG926.png",
          isNew: category.is_new || false,
          testTitle: category.category_title,
          testCount: category.test_count > 0 ? `${category.test_count} ta test` : "Cheksiz testlar",
        }));

        setTests(mappedData);
      } catch (error) {
        console.error('Fetch error:', error);
        setTests(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  if (loading) {
    return <TestsSkeleton />;
  }

  if (!tests) {
    return (
      <div className='tests-container'>
        <div className="tests-container-inner">
          <h1>Testlar <Link href="/tests/all">Barchasini ko'rish <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M184 112l144 144-144 144" /></svg></Link></h1>
          <div className="error-message">
            Testlarni yuklashda xatolik yuz berdi. Iltimos, keyinroq urunib ko'ring.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='tests-container'>
      <div className="tests-container-inner">
        <h1>Testlar <Link href="/tests/all">Barchasini ko'rish <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M184 112l144 144-144 144" /></svg></Link></h1>

        <div className="tests-content">
          {tests.map((test) => (
            <div className="test-card" key={test.id}>
              <Link href={`/tests/${formatCategoryLink(test.testTitle)}`}>
                <div className="card-top">
                  <div className="card-top-top">
                    <img 
                      src={test.testImage} 
                      alt={test.testTitle} 
                    />
                    {test.isNew && <div className="new active">Yangi</div>}
                  </div>
                  <div className="card-top-bottom">
                    {test.testTitle}
                  </div>
                </div>
                <div className="card-bottom">
                  {test.testCount}
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
