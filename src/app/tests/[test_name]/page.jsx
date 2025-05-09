"use client"
import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import "./layout.scss";
import Link from 'next/link';

const categories = [
  {
    id: 1,
    categoryTitle: "Prezident maktablari",
    isNew: true,
  },
  {
    id: 2,
    categoryTitle: "Piima",
    isNew: false,
  }
];

const tests = [
  {
    id: 1,
    testImage: "https://cdn.testbor.com/0/quiz-category/01JPMA7KTREH7RMB957PAQG926.png",
    testDescription: "Saralash bosqichiga tayyorgarlik ko'rayotgan o'quvchilar uchun mo'ljallangan",
    isNew: false,
    testTitle: "Prezident Maktablari Testi",
    testCount: "Cheksiz testlar",
    testTime: 10,
    testPrice: "Bepul",
    categoryId: 1,
  },
  {
    id: 2,
    testImage: "https://cdn.testbor.com/0/quiz-category/01JPMA7KTREH7RMB957PAQG926.png",
    testDescription: "Piima haqida bilimingizni sinang",
    isNew: true,
    testTitle: "Piima Testi",
    testCount: "50 ta test",
    testTime: 15,
    testPrice: "10 000 so'm",
    categoryId: 2,
  },
  {
    id: 3,
    testImage: "https://cdn.testbor.com/0/quiz-category/01JPMA7KTREH7RMB957PAQG926.png",
    testDescription: "Prezident maktablariga tayyorgarlik",
    isNew: false,
    testTitle: "Prezident Maktablari Testi 2",
    testCount: "100 ta test",
    testTime: 20,
    testPrice: "Bepul",
    categoryId: 1,
  }
];



function Modal({ children, onClose, showModal }) {
  return (
    <div className={`modal-overlay ${showModal ? "active" : ""}`}>
      <div className="modal-content">
        {children}
      </div>
    </div>
  );
}
export default function TestsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const [activeButton, setActiveButton] = useState('all');
  const [filteredTests, setFilteredTests] = useState(tests);
  const [selectedTest, setSelectedTest] = useState(null);
  const [showModal, setShowModal] = useState(false);

  function formatCategoryLink(title) {
    return title.toLowerCase().replace(/\s+/g, '-');
  }

  useEffect(() => {
    const currentCategory = pathname?.split('/').pop();

    if (pathname === '/tests/all' || pathname === '/tests') {
      setActiveButton('all');
      setFilteredTests(tests);
    } else if (currentCategory) {
      setActiveButton(currentCategory);
      const category = categories.find(function (cat) {
        return formatCategoryLink(cat.categoryTitle) === currentCategory;
      });

      if (category) {
        const filtered = tests.filter(function (test) {
          return test.categoryId === category.id;
        });
        setFilteredTests(filtered);
        document.title = category.categoryTitle + " - Infinite Co";
      }
    }
  }, [pathname]);

  function handleCategoryClick(categoryTitle) {
    const formattedLink = formatCategoryLink(categoryTitle);
    setActiveButton(formattedLink);
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
    return testName
      .trim() // bo'sh joylarni olib tashlaydi
      .toLowerCase() // barcha harflarni kichik qiladi
      .replace(/\s+/g, '-') // bo'sh joylarni '-' bilan almashtiradi
      .replace(/[^\w-]/g, ''); // faqat so'z va '-' belgilarini qoldiradi
  }

  function startTest() {
    if (!selectedTest) return;

    // Generate a unique session ID
    const sessionId = crypto.randomUUID();

    // Redirect to the test page with the session ID
    router.push('/tests/' + formatTestName(selectedTest.testTitle) + '/' + selectedTest.id + '/' + sessionId);
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
        {categories.map(function (category, index) {
          const formattedLink = formatCategoryLink(category.categoryTitle);
          return (
            <button
              key={index}
              className={activeButton === formattedLink ? 'active' : ''}
              onClick={function () { handleCategoryClick(category.categoryTitle); }}
            >
              {category.categoryTitle}
              {category.isNew && <div className="new active">Yangi</div>}
            </button>
          );
        })}
      </div>

      <div className="tests-content">
        {filteredTests.length > 0 ? (
          filteredTests.map(function (test, index) {
            return (
              <div
                className="test-card"
                key={index}
                onClick={function () { handleTestClick(test); }}
              >
                <div className="card-top">
                  <div className="card-top-top">
                    <img src={test.testImage} alt={test.testTitle} />
                    {test.isNew && <div className="new active">Yangi</div>}
                  </div>
                  <div className="card-top-bottom">
                    <p>{test.testTitle}</p>
                    <p>{test.testDescription}</p>
                  </div>
                </div>
                <div className="card-bottom">
                  <p className={`${test.testPrice === "Bepul" ? "" : "green"}`}>{test.testPrice}</p> <span></span> {test.testTime} daqiqa
                </div>
              </div>
            );
          })
        ) : (
          <div className="no-tests">
            <p>Ushbu kategoriyada testlar mavjud emas</p>
          </div>
        )}
      </div>

      {/* Modal for test confirmation */}
      {/* {showModal && selectedTest && (
      )} */}
      <Modal onClose={() => setShowModal(false)} showModal={showModal}>
        <div className="test-confirmation-modal">
          <h2>{selectedTest?.testTitle}</h2>
          <p>{selectedTest?.testDescription}</p>
          <div className="test-details">
            <p><span>Testlar soni:</span> {selectedTest?.testCount}</p>
            <p><span>Vaqt:</span> {selectedTest?.testTime} daqiqa</p>
            <p><span>Narxi:</span> {selectedTest?.testPrice}</p>
          </div>
          <div className="modal-actions">
            <button className="cancel-button" onClick={() => setShowModal(false)}>
              Bekor qilish
            </button>
            <button className="start-button" onClick={startTest}>
              Testni boshlash
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
