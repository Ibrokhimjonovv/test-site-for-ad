"use client"
import React, { useState, useEffect, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import "./layout.scss";
import Link from 'next/link';
import { AccessContext } from '@/contexts/contexts';

function Modal({ children, onClose, showModal }) {
  return (
    <div className={`modal-overlay ${showModal ? "active" : ""}`}>
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
}

const CategoriesSkeleton = () => {
  return (
    <div className="menu skeleton-menu">
      {[...Array(5)].map((_, index) => (
        <div key={index} className="skeleton-category"></div>
      ))}
    </div>
  );
};

const TestCardsSkeleton = () => {
  return (
    <div className="tests-content skeleton-tests">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="skeleton-test-card">
          <div className="skeleton-image"></div>
          <div className="skeleton-text">
            <div className="skeleton-line"></div>
            <div className="skeleton-line"></div>
          </div>
          <div className="skeleton-footer">
            <div className="skeleton-line"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function TestsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeButton, setActiveButton] = useState('all');
  const [filteredTests, setFilteredTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setLoginStat, profileData } = useContext(AccessContext)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const categoriesRes = await fetch('/site/categories');
        const categoriesData = await categoriesRes.json();

        // Safely handle categories data
        const categoriesArray = Array.isArray(categoriesData?.data) ? categoriesData.data : [];
        setCategories(categoriesArray);
        // Fetch tests
        const testsRes = await fetch('/site/tests');
        const testsData = await testsRes.json();

        // Safely handle tests data
        const testsArray = Array.isArray(testsData?.data?.tests) ? testsData.data.tests : [];
        setTests({ tests: testsArray }); // Maintain consistent structure
        setFilteredTests({ tests: testsArray });
      } catch (error) {
        console.error('Error fetching data:', error);
        // Set empty arrays if there's an error
        setCategories([]);
        setTests({ tests: [] });
        setFilteredTests({ tests: [] });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  function formatCategoryLink(title) {
    return title?.toLowerCase().replace(/\s+/g, '-') || '';
  }

  useEffect(() => {
    if (!pathname || loading) return;

    const currentCategory = pathname.split('/').pop();

    if (pathname === '/tests/all' || pathname === '/tests') {
      setActiveButton('all');
      setFilteredTests(tests);
    } else if (currentCategory) {
      setActiveButton(currentCategory);
      const category = categories.find(cat =>
        formatCategoryLink(cat.category_title) === currentCategory
      );

      if (category) {
        const filtered = tests.tests.filter(test => test.category === category.id);
        setFilteredTests({ tests: filtered });
        document.title = `${category.category_title} - Infinite Co`;
      }
    }
  }, [pathname, categories, tests, loading]);

  function handleCategoryClick(categoryId, category_title) {
    const formattedLink = formatCategoryLink(category_title);
    setActiveButton(formattedLink);

    // Filter tests by category ID
    const filtered = tests.tests.filter(test => test.category === categoryId);
    setFilteredTests({ tests: filtered });

    router.push('/tests/' + formattedLink);
  }

  function handleAllClick() {
    setActiveButton('all');
    router.push('/tests/all');
  }

  function handleTestClick(test) {
    setSelectedTest(test);
    setShowModal(true);
  }

  function formatTestName(testName) {
    return testName?.trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
  }

  const [stLoading, setStLoading] = useState(false);

  const startTest = async () => {
    setStLoading(true);
    try {
      const token = localStorage.getItem("accessEdu");
      if (!token) {
        alert("Token yo'q");
        return;
      }

      // setProfileData(prev => ({
      //   ...prev,
      //   balance: prev.balance - selectedTest.price
      // }));

      const response = await fetch(`https://test.smartcoders.uz/api/start-test/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          test_id: selectedTest.id,
        }),
      });

      if (response.ok) {
        // localStorage.setItem("startTest", selectedTest.id);
        // setStartTest(selectedTest.id);
        const sessionId = crypto.randomUUID();
        router.push(`/tests/${formatTestName(selectedTest.title)}/${selectedTest.id}/${sessionId}`);
        setStLoading(false)
      } else {
        // setProfileData(prev => ({
        //   ...prev,
        //   balance: prev.balance + selectedTestPrice
        // }));
        const errorData = await response.json();
        setError(errorData.detail);
        setStLoading(false)
      }
    } catch (error) {
      setError(error);
    }
  }

  function formatTestTime(timeString) {
    if (!timeString) return "Vaqt cheklanmagan";

    // "HH:MM:SS" formatini tekshirish
    if (typeof timeString === 'string' && timeString.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
      const [hours, minutes] = timeString.split(':').map(Number);

      if (hours > 0 && minutes > 0) {
        return `${hours} soat ${minutes} daqiqa`;
      } else if (hours > 0) {
        return `${hours} soat`;
      } else if (minutes > 0) {
        return `${minutes} daqiqa`;
      } else {
        return "Vaqt cheklanmagan";
      }
    }

    // Raqamli qiymatni tekshirish (daqikalarda)
    const timeNumber = Number(timeString);
    if (!isNaN(timeNumber)) {
      if (timeNumber <= 0) return "Vaqt cheklanmagan";

      const hours = Math.floor(timeNumber / 60);
      const minutes = timeNumber % 60;

      if (hours > 0 && minutes > 0) {
        return `${hours} soat ${minutes} daqiqa`;
      } else if (hours > 0) {
        return `${hours} soat`;
      } else {
        return `${minutes} daqiqa`;
      }
    }

    return "Vaqt cheklanmagan";
  }

  if (loading) {
    return (
      <div className='tests-page'>
        <h1 className='page-title'>Testlar</h1>
        <CategoriesSkeleton />
        <TestCardsSkeleton />
      </div>
    );
  }


  return (
    <div className='tests-page'>
      <h1 className='page-title'>Testlar</h1>
      <div className="menu">
        <button
          className={activeButton === 'all' ? 'active' : ''}
          onClick={handleAllClick}
        >
          Barchasi
        </button>
        {Array.isArray(categories) && categories.length > 0 ? (
          categories.map((category) => {
            const formattedLink = formatCategoryLink(category.category_title);
            return (
              <button
                key={category.id}
                className={activeButton === formattedLink ? 'active' : ''}
                onClick={() => handleCategoryClick(category.id, category.category_title)}
              >
                {category.category_title}
                {category.isNew && <div className="new active">Yangi</div>}
              </button>
            );
          })
        ) : (
          <div className="no-categories">Kategoriyalar mavjud emas</div>
        )}
      </div>

      <div className="tests-content">
        {Array.isArray(filteredTests?.tests) && filteredTests.tests.length > 0 ? (
          filteredTests.tests.map((test) => (
            <div
              className="test-card"
              key={test.id}
              onClick={() => handleTestClick(test)}
            >
              <div className="card-top">
                <div className="card-top-top">
                  <img
                    src={test.testImage || "https://cdn.testbor.com/0/quiz-category/01JPMA7KTREH7RMB957PAQG926.png"}
                    alt={test.title || "Test rasmi"}
                    onError={(e) => {
                      e.target.src = "https://cdn.testbor.com/0/quiz-category/01JPMA7KTREH7RMB957PAQG926.png";
                    }}
                  />
                  {test.isNew && <div className="new active">Yangi</div>}
                </div>
                <div className="card-top-bottom">
                  <p>{test.title || "Test nomi"}</p>
                  <p>{test.testDescription || "Test tavsifi"}</p>
                </div>
              </div>
              <div className="card-bottom">
                <p className={`${test.price === "Bepul" ? "" : "green"}`}>
                  {test.price === 0 ? "Bepul" : `${test.price} UZS`}
                </p>
                <span></span>
                {formatTestTime(test.time) || "0 daqiqa"}
              </div>
            </div>
          ))
        ) : (
          <div className="no-tests">
            <p>Ushbu kategoriyada testlar mavjud emas</p>
          </div>
        )}
      </div>
  
      <Modal onClose={() => setShowModal(false)} showModal={showModal}>
        {selectedTest && (
          <div className="test-confirmation-modal">
            <h2>{selectedTest.title}</h2>
            <p>{selectedTest.testDescription}</p>
            <div className="test-details">
              <p><span>Savollar soni:</span> {selectedTest.tests_count}</p>
              <p><span>Vaqt:</span> {formatTestTime(selectedTest.time)}</p>
              <p><span>Narxi:</span> {selectedTest.price} UZS</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowModal(false)}>
                Bekor qilish
              </button>
              {
                profileData !== null ? (
                  <button
                    id='st'
                    type="button"
                    onClick={startTest}
                    disabled={stLoading}
                  >
                    {stLoading ? "Boshlanmoqda..." : "Boshlash"}
                  </button>
                ) : (
                  <button id='st' onClick={() => {
                    setLoginStat(true)
                    setShowModal(false)
                  }}>Kirish</button>
                )
              }
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}