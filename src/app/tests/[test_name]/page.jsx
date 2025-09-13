"use client"
import React, { useState, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import "./layout.scss";
import { AccessContext } from '@/contexts/contexts';
import { api } from '@/config';

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
  const [selectedTest, setSelectedTest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const { setLoginStat, profileData, setProfileData, showNewNotification } = useContext(AccessContext);
  const [error, setError] = useState('');
  const [stLoading, setStLoading] = useState(false);

  // ✅ Default categories
  const [categories] = useState([
    { id: 1, title: "Mathematics", isNew: true },
    { id: 2, title: "History", isNew: false },
    { id: 3, title: "Geography", isNew: true },
    { id: 4, title: "Physics", isNew: false },
    { id: 5, title: "English", isNew: true },
  ]);

  // ✅ Default tests
  const [tests] = useState({
    tests: [
      { id: 101, title: "Algebra Basics", testDescription: "Simple algebra equations", category: 1, price: 0, time: 30, tests_count: 15, isNew: true },
      { id: 102, title: "Geometry Shapes", testDescription: "Angles and triangles", category: 1, price: 2000, time: 45, tests_count: 20 },
      { id: 103, title: "World War II", testDescription: "Key historical events", category: 2, price: 1500, time: 40, tests_count: 18 },
      { id: 104, title: "Uzbek History", testDescription: "Important Uzbek figures", category: 2, price: 0, time: 25, tests_count: 10 },
      { id: 105, title: "Continents", testDescription: "Countries and capitals", category: 3, price: 3000, time: 60, tests_count: 30 },
      { id: 106, title: "Mountains & Rivers", testDescription: "Geography landmarks", category: 3, price: 0, time: 20, tests_count: 12 },
      { id: 107, title: "Mechanics", testDescription: "Force and motion", category: 4, price: 5000, time: 90, tests_count: 25 },
      { id: 108, title: "Optics", testDescription: "Light and reflection", category: 4, price: 0, time: 40, tests_count: 15 },
      { id: 109, title: "Grammar Test", testDescription: "English grammar rules", category: 5, price: 2500, time: 30, tests_count: 20 },
      { id: 110, title: "Vocabulary Quiz", testDescription: "Learn new words", category: 5, price: 0, time: 15, tests_count: 10, isNew: true },
    ]
  });

  const [filteredTests, setFilteredTests] = useState(tests);

  function formatCategoryLink(title) {
    return title?.toLowerCase().replace(/\s+/g, '-') || '';
  }

  function handleCategoryClick(categoryId, category_title) {
    const formattedLink = formatCategoryLink(category_title);

    // ✅ activeButton endi categoryId bo'ladi
    setActiveButton(categoryId);

    // ✅ shu categoryga tegishli testlarni filter qilamiz
    const filtered = tests.tests.filter(test => test.category === categoryId);
    setFilteredTests({ tests: filtered });

    // ✅ url o'zgaradi
    router.push('/tests/' + categoryId);
  }


  function handleAllClick() {
    setActiveButton('all');
    setFilteredTests(tests);
    router.push('/tests/all');
  }

  function handleTestClick(test) {
    setSelectedTest(test);
    setShowModal(true);
  }

  function formatTestTime(time) {
    if (!time) return "Unlimited time";
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    if (hours > 0 && minutes > 0) return `${hours} hours ${minutes} minutes`;
    if (hours > 0) return `${hours} hours`;
    return `${minutes} minutes`;
  }

  const startTest = async () => {
    setStLoading(true);
    try {
      if (!profileData) {
        showNewNotification("Please login first!", "error");
        return;
      }

      setProfileData(prev => ({
        ...prev,
        balance: prev.balance - selectedTest.price
      }));

      showNewNotification("Test started successfully!", "success", true);
      router.push(`/tests/${formatCategoryLink(selectedTest.title)}/${selectedTest.id}`);

    } catch (error) {
      showNewNotification("An error occurred!", "error");
      setError(error);
    } finally {
      setStLoading(false);
    }
  };

  return (
    <div className='tests-page'>
      <h1 className='page-title'>Tests</h1>
      <div className="menu">
        <button
          className={activeButton === 'all' ? 'active' : ''}
          onClick={handleAllClick}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={activeButton === category.id ? 'active' : ''} // ✅ id bilan solishtirilyapti
            onClick={() => handleCategoryClick(category.id, category.title)}
          >
            {category.title}
            {category.isNew && <div className="new active">New</div>}
          </button>
        ))}
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
                    src={test.testImage || "/logo-m.png"}
                    alt={test.title || "Test image"}
                  />
                  {test.isNew && <div className="new active">New</div>}
                </div>
                <div className="card-top-bottom">
                  <p>{test.title}</p>
                  <p>{test.testDescription}</p>
                </div>
              </div>
              <div className="card-bottom">
                <p className={`${test.price === 0 ? "" : "green"}`}>
                  {test.price === 0 ? "Free" : `${test.price} USD`}
                </p>
                <span></span>
                {formatTestTime(test.time)}
              </div>
            </div>
          ))
        ) : (
          <div className="no-tests">
            <p>No tests available in this category</p>
          </div>
        )}
      </div>

      <Modal onClose={() => setShowModal(false)} showModal={showModal}>
        {selectedTest && (
          <div className="test-confirmation-modal">
            <h2>{selectedTest.title}</h2>
            <p>{selectedTest.testDescription}</p>
            <div className="test-details">
              <p><span>Number of questions:</span> {selectedTest.tests_count}</p>
              <p><span>Time:</span> {formatTestTime(selectedTest.time)}</p>
              <p><span>Price:</span> {selectedTest.price === 0 ? "Free" : `${selectedTest.price} UZS`}</p>
            </div>
            <div className="modal-actions">
              <button className="cancel-button" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              {
                profileData !== null ? (
                  <button
                    id='st'
                    type="button"
                    onClick={startTest}
                    disabled={stLoading}
                  >
                    {stLoading ? "Starting..." : "Start"}
                  </button>
                ) : (
                  <button id='st' onClick={() => {
                    setLoginStat(true)
                    setShowModal(false)
                  }}>Login</button>
                )
              }
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
