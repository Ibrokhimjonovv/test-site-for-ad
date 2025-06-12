import React, { useState, useEffect, useRef } from 'react'
import parse from "html-react-parser";
import katex from "katex";
import "katex/dist/katex.min.css";

const Questions = ({ 
  toggleZoom, 
  currentQuestionIndex, 
  currentQuestion, 
  selectedOption, 
  questions, 
  setSelectedOption, 
  setScore, 
  setCurrentQuestionIndex, 
  setTestStatus, 
  isZoomed, 
  handleOptionSelect, 
  finishTest 
}) => {
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

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedOption(null);
        } else {
            finishTest();
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1);
            setSelectedOption(null);
        }
    };

    const fixBrokenImageTags = (text) => {
        return text.replace(
            /alt=["']?Question Image["']?\s*style=["'][^"']*["']?\s*\/?>/g,
            ""
        );
    };

    const renderQuestionText = (text) => {
        if (typeof text !== "string") return "";

        const baseUrl = "http://37.27.23.255:2222";
        const imgPlaceholders = [];
        let imgIndex = 0;

        text = text.replace(/<img\s+[^>]*>/g, (match) => {
            imgPlaceholders.push(match);
            return `@@IMG${imgIndex++}@@`;
        });

        const mathRegex =
            /\\frac\{.*?\}\{.*?\}|\\sum|\\sqrt|\\left|\\right|\\times|\\div|a\d|⍟/g;
        text = text.replace(mathRegex, (match) => {
            try {
                if (match.startsWith("a")) {
                    return katex.renderToString(match.replace("a", "a^"), {
                        throwOnError: false,
                    });
                }
                return katex.renderToString(match, { throwOnError: false });
            } catch (error) {
                console.error("KaTeX render error:", error);
                return match;
            }
        });

        text = text.replace(/@@IMG(\d+)@@/g, (match, index) => {
            const imgTag = imgPlaceholders[Number(index)];
            return imgTag.replace(
                /<img\s+src=["'](\/media[^"']+)["']/g,
                (match, path) => `<img src="${baseUrl}${path}" />`
            );
        });

        text = fixBrokenImageTags(text);
        return text;
    };

    const cleanText = (text) => {
        if (typeof text !== "string") return "";
        const mathRegex = /\$[^$]*\$|\\\([^\)]*\\\)|\\\[[^\]]*\\\]/g;
        let formulas = [];
        let index = 0;

        text = text.replace(mathRegex, (match) => {
            formulas.push(match);
            return `__FORMULA_${index++}__`;
        });

        formulas.forEach((formula, i) => {
            text = text.replace(`__FORMULA_${i}__`, formula);
        });

        return text;
    };

    const fixImageTags = (text) => {
        return text.replace(/<img([^>]+)>/g, (match, attributes) => {
            attributes = attributes.replace(/\s*alt=["'][^"']*["']/g, "");
            attributes = attributes.replace(/\s*style=["'][^"']*["']/g, "");
            return `<img ${attributes} />`;
        });
    };

    const fixImageUrl = (text) => {
        if (typeof text !== "string") return "";
        const baseUrl = "http://37.27.23.255:2222";
        return text.replace(
            /<img\s+([^>]*?)src=["'](\/media[^"']+)["']([^>]*)>/g,
            (match, before, path, after) => {
                const cleanedBefore = before
                    .replace(/\balt=["'][^"']*["']/g, "")
                    .replace(/\bstyle=["'][^"']*["']/g, "")
                    .trim();
                return `<img ${cleanedBefore} src="${baseUrl}${path}" ${after}>`;
            }
        );
    };

    const renderMath = (text) => {
        if (typeof text !== "string") return "";

        const imgPlaceholders = [];
        let imgIndex = 0;

        text = text.replace(/<img\s+[^>]*>/g, (match) => {
            imgPlaceholders.push(match);
            return `@@IMG${imgIndex++}@@`;
        });

        const mathRegex =
            /\\frac\{.*?\}\{.*?\}|\\sum|\\sqrt|\\left|\\right|\\times|\\div|a\d|⍟/g;

        text = text.replace(mathRegex, (match) => {
            try {
                if (match.startsWith('a')) {
                    return katex.renderToString(match.replace('a', 'a^'), { throwOnError: false });
                }
                if (match === '⍟') {
                    return katex.renderToString('\\star', { throwOnError: false });
                }
                return katex.renderToString(match, { throwOnError: false });
            } catch (error) {
                console.error("KaTeX render error:", error);
                return match;
            }
        });

        text = text.replace(/@@IMG(\d+)@@/g, (match, index) => {
            return imgPlaceholders[Number(index)];
        });

        return text;
    };

    return (
        <>
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
                                {parse(renderQuestionText(currentQuestion.text))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="question-container">
                <h3 className="question-text" onClick={toggleZoom}>
                    <button
                        className="zoom-button"
                        onClick={toggleZoom}
                        title="Zoom"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24">
                            <path d="M10 18a7.952 7.952 0 0 0 4.897-1.688l4.396 4.396 1.414-1.414-4.396-4.396A7.952 7.952 0 0 0 18 10c0-4.411-3.589-8-8-8s-8 3.589-8 8 3.589 8 8 8zm0-14c3.309 0 6 2.691 6 6s-2.691 6-6 6-6-2.691-6-6 2.691-6 6-6z" />
                        </svg>
                    </button>
                    {parse(renderQuestionText(currentQuestion.text))}
                </h3>

                <div className="options-container">
                    {currentQuestion.options.map((option, index) => (
                        <div
                            key={option.id}
                            className={`option ${selectedOption === option.id ? 'selected' : ''}`}
                            onClick={() => handleOptionSelect(option.id)}
                            dangerouslySetInnerHTML={{
                                __html: `<strong class="chart">${String.fromCharCode(
                                    65 + index
                                )}) </strong> ${fixImageTags(
                                    fixImageUrl(renderMath(cleanText(option.text)))
                                )}`,
                            }}
                        />
                    ))}
                </div>

                <div className="navigation-buttons">
                    <button
                        onClick={handlePrevQuestion}
                        disabled={currentQuestionIndex === 0}
                    >
                        Oldingi savol
                    </button>

                    {currentQuestionIndex < questions.length - 1 ? (
                        <button onClick={handleNextQuestion}>
                            Keyingi savol
                        </button>
                    ) : (
                        <button
                            onClick={finishTest}
                            className="finish-button"
                        >
                            Testni yakunlash
                        </button>
                    )}
                </div>
            </div>
        </>
    )
}

export default Questions