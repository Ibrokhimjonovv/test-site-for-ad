import React, { useState, useEffect } from 'react'

const Header = ({ timeLeft, setTimeLeft, testStatus, currentTest, currentQuestionIndex, questions, toggleZoom, handleTimeout, finishTest }) => {

    const [aggModal, setAggModal] = useState(false);

    // Format time
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Timer
    useEffect(() => {
        if (timeLeft <= 0 || testStatus !== 'active') return;

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, testStatus]);

    // Timeout handler
    useEffect(() => {
        if (timeLeft === 0 && testStatus === 'active') {
            handleTimeout();
        }
    }, [timeLeft, testStatus]);
    

    return (
        <>
            {/* Test header */}
            <div className="test-header">
                <h2>{currentTest.testTitle}</h2>
                <div className="test-info">

                    <div className="timer">Qolgan vaqt: {formatTime(timeLeft)}</div>
                    <div className="progress">
                        Savol {currentQuestionIndex + 1} / {questions.length}
                        <button
                            className="zoom-button"
                            onClick={toggleZoom}
                            title="Zoom"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                                <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
                            </svg>
                        </button>
                    </div>
                    <div className="end-test" onClick={() => setAggModal(true)}>
                        Testni yakunlash
                    </div>
                </div>
            </div>
            <div className={`agg-modal ${aggModal ? "act" : ""}`}>
                <div className="agg-content">
                    <h2>Haqiqatdan ham testni yakunlamoqchimisiz?</h2>
                    <div className="agg-actions">
                        <button className="cancel-button" onClick={() => setAggModal(false)}>Yo'q</button>
                        <button className="end-button" onClick={finishTest}>Ha</button>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Header