import React, { useState, useEffect, useRef } from 'react'

const Questions = ({ toggleZoom, currentQuestionIndex, currentQuestion, selectedOption, questions, setSelectedOption, sessionManager, sessionId, setScore, setCurrentQuestionIndex, setTestStatus, isZoomed, handleOptionSelect }) => {
    const [zoomLevel, setZoomLevel] = useState(1);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const [initialDistance, setInitialDistance] = useState(null);


    const handleZoomIn = (e) => {
        e.stopPropagation();
        const newZoom = Math.min(zoomLevel + 0.5, 3);
        setZoomLevel(newZoom);
        adjustPositionForZoom(newZoom);
    };

    const handleZoomOut = (e) => {
        e.stopPropagation();
        const newZoom = Math.max(zoomLevel - 0.5, 1);
        setZoomLevel(newZoom);
        if (newZoom === 1) {
            setPosition({ x: 0, y: 0 });
        } else {
            adjustPositionForZoom(newZoom);
        }
    };

    const adjustPositionForZoom = (newZoom) => {
        if (imageRef.current && containerRef.current) {
            const imgWidth = imageRef.current.offsetWidth * newZoom;
            const imgHeight = imageRef.current.offsetHeight * newZoom;
            const containerWidth = containerRef.current.offsetWidth;
            const containerHeight = containerRef.current.offsetHeight;

            const maxX = Math.max(0, (imgWidth - containerWidth) / 2);
            const maxY = Math.max(0, (imgHeight - containerHeight) / 2);

            setPosition(prev => ({
                x: Math.min(Math.max(prev.x, -maxX), maxX),
                y: Math.min(Math.max(prev.y, -maxY), maxY)
            }));
        }
    };

    // Drag functionality
    const handleMouseDown = (e) => {
        if (zoomLevel > 1) {
            setIsDragging(true);
            setStartPos({
                x: e.clientX - position.x,
                y: e.clientY - position.y
            });
        }
    };

    const handleMouseMove = (e) => {
        if (!isDragging || zoomLevel <= 1) return;
        const newX = e.clientX - startPos.x;
        const newY = e.clientY - startPos.y;
        if (imageRef.current && containerRef.current) {
            const imgWidth = imageRef.current.offsetWidth * zoomLevel;
            const imgHeight = imageRef.current.offsetHeight * zoomLevel;
            const containerWidth = containerRef.current.offsetWidth;
            const containerHeight = containerRef.current.offsetHeight;
            const maxX = Math.max(0, (imgWidth - containerWidth) / 2);
            const maxY = Math.max(0, (imgHeight - containerHeight) / 2);
            setPosition({
                x: Math.min(Math.max(newX, -maxX), maxX),
                y: Math.min(Math.max(newY, -maxY), maxY)
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Touch functionality
    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            const distance = Math.hypot(
                e.touches[0].clientX - e.touches[1].clientX,
                e.touches[0].clientY - e.touches[1].clientY
            );
            setInitialDistance(distance);
            setIsDragging(false);
        } else if (zoomLevel > 1 && e.touches.length === 1) {
            setIsDragging(true);
            setStartPos({
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            });
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2) {
            e.preventDefault();
            const touch1 = e.touches[0];
            const touch2 = e.touches[1];
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            if (initialDistance) {
                const scale = 1 + (currentDistance - initialDistance) / initialDistance * 0.3;
                const newZoom = Math.min(Math.max(zoomLevel * scale, 1), 3);
                const centerX = (touch1.clientX + touch2.clientX) / 2;
                const centerY = (touch1.clientY + touch2.clientY) / 2;
                const newPosition = {
                    x: centerX - (centerX - position.x) * (newZoom / zoomLevel),
                    y: centerY - (centerY - position.y) * (newZoom / zoomLevel)
                };

                setZoomLevel(newZoom);
                setPosition(newPosition);
                setInitialDistance(currentDistance);
            }
        } else if (isDragging && e.touches.length === 1) {
            const newX = e.touches[0].clientX - startPos.x;
            const newY = e.touches[0].clientY - startPos.y;

            if (imageRef.current && containerRef.current) {
                const imgWidth = imageRef.current.offsetWidth * zoomLevel;
                const imgHeight = imageRef.current.offsetHeight * zoomLevel;
                const containerWidth = containerRef.current.offsetWidth;
                const containerHeight = containerRef.current.offsetHeight;

                const maxX = Math.max(0, (imgWidth - containerWidth) / 2);
                const maxY = Math.max(0, (imgHeight - containerHeight) / 2);

                setPosition({
                    x: Math.min(Math.max(newX, -maxX), maxX),
                    y: Math.min(Math.max(newY, -maxY), maxY)
                });
            }
        }
    };

    const handleTouchEnd = (e) => {
        if (e.touches.length === 1) {
            setInitialDistance(null);
        } else {
            setIsDragging(false);
            setInitialDistance(null);
        }
    };


    // Question navigation
    const handleNextQuestion = () => {
        if (selectedOption === questions[currentQuestionIndex].correctAnswer) {
            setScore(prev => prev + 1);
        }

        if (currentQuestionIndex < questions.length - 1) {
            const nextQuestionIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextQuestionIndex);
            setSelectedOption(
                sessionManager.getSession(sessionId).answers[nextQuestionIndex] ?? null
            );
        } else {
            finishTest();
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            const prevQuestionIndex = currentQuestionIndex - 1;
            setCurrentQuestionIndex(prevQuestionIndex);
            setSelectedOption(
                sessionManager.getSession(sessionId).answers[prevQuestionIndex] ?? null
            );
        }
    };



    // Test completion
    const finishTest = () => {
        let finalScore = 0;
        const session = sessionManager.getSession(sessionId);

        Object.entries(session.answers || {}).forEach(([index, answer]) => {
            if (questions[index]?.correctAnswer === answer) {
                finalScore++;
            }
        });

        if (selectedOption === questions[currentQuestionIndex]?.correctAnswer) {
            finalScore++;
        }

        sessionManager.updateSession(sessionId, {
            status: 'completed',
            endTime: new Date().toISOString(),
            isValid: false,
            score: finalScore,
            totalQuestions: questions.length
        });

        setScore(finalScore);
        setTestStatus('completed');
    };

    // Timeout handler

    return (
        <>
            {/* Zoom modal */}
            {isZoomed && (
                <div className="zoom-modal" onClick={toggleZoom}>
                    <div
                        className="zoom-modal-content"
                        onClick={e => e.stopPropagation()}
                        ref={containerRef}
                    >
                        <div className="zoom-controls">
                            <button className="zoom-in" onClick={handleZoomIn}>+</button>
                            <span className="zoom-level">{Math.round(zoomLevel * 100)}%</span>
                            <button className="zoom-out" onClick={handleZoomOut}>-</button>
                            <button className="close-zoom" onClick={toggleZoom}>×</button>
                        </div>
                        <div
                            className="zoomed-image-container"
                            onMouseDown={zoomLevel > 1 ? handleMouseDown : undefined}
                            onMouseMove={zoomLevel > 1 ? handleMouseMove : undefined}
                            onMouseUp={handleMouseUp}
                            onMouseLeave={handleMouseUp}
                            onTouchStart={handleTouchStart}
                            onTouchMove={handleTouchMove}
                            onTouchEnd={handleTouchEnd}
                            style={{ cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
                        >
                            <div
                                className="zoomed-image-wrapper"
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) scale(${zoomLevel})`,
                                    transition: 'transform 0.1s ease-out'
                                }}
                                ref={imageRef}
                            >
                                {currentQuestion.question}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Question container */}
            <div className="question-container">
                <h3 className="question-text" onClick={toggleZoom}>
                    {currentQuestion.question}
                </h3>

                <div className="options-container">
                    {currentQuestion.options.map((option, index) => (
                        <div
                            key={index}
                            className={`option ${selectedOption === index ? 'selected' : ''}`}
                            onClick={() => handleOptionSelect(index)}
                        >
                            <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
                            {option}
                        </div>
                    ))}
                </div>

                {/* Navigation buttons */}
                <div className="navigation-buttons" >
                    <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        Oldingi savol
                    </button>

                    {
                        currentQuestionIndex < questions.length - 1 ? (
                            <button
                                onClick={handleNextQuestion}
                                disabled={selectedOption === null}
                            >
                                Keyingi savol
                            </button>
                        ) : (
                            <button
                                onClick={finishTest}
                                disabled={selectedOption === null}
                                className="finish-button"
                            >
                                Testni yakunlash
                            </button>
                        )
                    }
                </div >
            </div>
        </>
    )
}

export default Questions