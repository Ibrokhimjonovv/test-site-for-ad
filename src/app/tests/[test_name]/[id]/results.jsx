import React from 'react';
import { useRouter } from 'next/navigation';
import "./results.scss";
import parse from "html-react-parser";
import katex from "katex";
import "katex/dist/katex.min.css";

const Results = ({ 
  testStatus, 
  questions, 
  score, 
  selectedAnswers 
}) => {
    const router = useRouter();

    // Calculate correct answers based on selectedAnswers
    const calculateScore = () => {
        let correctAnswers = 0;
        questions.forEach((question, index) => {
            const userAnswerId = selectedAnswers?.[index];
            const correctOption = question.options.find(opt => opt.is_staff);
            if (userAnswerId && correctOption && userAnswerId === correctOption.id) {
                correctAnswers++;
            }
        });
        return correctAnswers;
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

    const actualScore = calculateScore();
    const percentage = Math.round((actualScore / questions.length) * 100);

    return (
        <div className="results">
            <div className="results-box">
                <h2>{testStatus === 'timeout' ? "Vaqt tugadi!" : "Test yakunlandi!"}</h2>
                <p>Siz {questions.length} ta savoldan {actualScore} tasiga to'g'ri javob berdingiz</p>
                <p>To'g'ri javoblar foizi: {percentage}%</p>

                <div className="answers-review">
                    <h3>Javoblaringizni ko'rib chiqing:</h3>
                    {questions.map((question, index) => {
                        const userAnswerId = selectedAnswers?.[index];
                        const correctOption = question.options.find(opt => opt.is_staff);
                        const userOption = question.options.find(opt => opt.id === userAnswerId);
                        const isCorrect = correctOption?.id === userAnswerId;
                        const hasAnswer = userAnswerId !== undefined && userAnswerId !== null;

                        return (
                            <div key={question.id} className="question-review">
                                <p className="question-text">
                                    <strong>Savol {index + 1}:</strong> {parse(renderQuestionText(question.text))}
                                </p>

                                <div className="options-review">
                                    {question.options.map((option) => {
                                        let optionClass = '';
                                        const isCorrectOption = option.is_staff;
                                        const isUserAnswer = option.id === userAnswerId;

                                        if (hasAnswer) {
                                            if (isUserAnswer) {
                                                optionClass = isCorrectOption ? 'correct' : 'incorrect';
                                            } else if (isCorrectOption) {
                                                optionClass = 'blue';
                                            }
                                        } else {
                                            if (isCorrectOption) {
                                                optionClass = 'blue';
                                            }
                                        }

                                        return (
                                            <div
                                                key={option.id}
                                                className={`option ${optionClass}`}
                                            >
                                                <strong>{String.fromCharCode(65 + question.options.indexOf(option))}) </strong>
                                                <div
                                                    dangerouslySetInnerHTML={{
                                                        __html: `${fixImageTags(
                                                            fixImageUrl(renderMath(cleanText(option.text)))
                                                        )}`,
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="answer-status">
                                    {hasAnswer ? (
                                        isCorrect ? (
                                            <span className="correct-message">✅ To'g'ri javob berdingiz</span>
                                        ) : (
                                            <span className="incorrect-message">
                                                ❌ Noto'g'ri javob berdingiz ({userOption?.text})
                                            </span>
                                        )
                                    ) : (
                                        <span className="no-answer-message">⚠️ Javob bermagansiz</span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    className="return-button"
                    onClick={() => router.push('/tests/all')}
                >
                    Testlar ro'yxatiga qaytish
                </button>
            </div>
        </div>
    );
};

export default Results;
