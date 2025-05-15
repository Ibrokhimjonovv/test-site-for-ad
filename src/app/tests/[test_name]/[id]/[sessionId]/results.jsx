import React from 'react';
import { useRouter } from 'next/navigation';
import "./results.scss";
import parse from "html-react-parser";

const Results = ({ testStatus, session, questions, score, sessionId, sessionManager }) => {
    const router = useRouter();

    // To'g'ri javoblarni hisoblash
    const calculateScore = () => {
        let correctAnswers = 0;
        questions.forEach((question, index) => {
            const userAnswerId = session?.answers?.[index];
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

    // Timeout handler

    const renderQuestionText = (text) => {
        if (typeof text !== "string") return "";

        const baseUrl = "https://edumark.uz";

        // <img> teglarini vaqtincha saqlash uchun joy
        const imgPlaceholders = [];
        let imgIndex = 0;

        // <img> teglarini vaqtincha almashtirish
        text = text.replace(/<img\s+[^>]*>/g, (match) => {
            imgPlaceholders.push(match); // Tegni saqlash
            return `@@IMG${imgIndex++}@@`; // Tegni vaqtincha almashtirish
        });

        // Matematik formulalarni aniqlash va to'g'ri ko'rsatish
        const mathRegex =
            /\\frac\{.*?\}\{.*?\}|\\sum|\\sqrt|\\left|\\right|\\times|\\div|a\d|⍟/g;
        text = text.replace(mathRegex, (match) => {
            try {
                // a2, a3 kabi ifodalarni a^2, a^3 ga o'zgartirish
                if (match.startsWith("a")) {
                    return katex.renderToString(match.replace("a", "a^"), {
                        throwOnError: false,
                    });
                }
                // ⍟ belgisini KaTeXda to'g'ri ko'rsatish
                // if (match === '⍟') {
                //   return katex.renderToString('\\star', { throwOnError: false });
                // }
                return katex.renderToString(match, { throwOnError: false });
            } catch (error) {
                console.error("KaTeX render error:", error);
                return match;
            }
        });

        // <img> teglarini qayta joylashtirish
        text = text.replace(/@@IMG(\d+)@@/g, (match, index) => {
            const imgTag = imgPlaceholders[Number(index)]; // Tegni olish
            // Rasm manzilini to'g'rilash
            return imgTag.replace(
                /<img\s+src=["'](\/media[^"']+)["']/g,
                (match, path) => `<img src="${baseUrl}${path}" />`
            );
        });

        // Noto'g'ri img taglarini to'g'rilash
        text = fixBrokenImageTags(text);

        return text;
    };

    const cleanText = (text) => {
        if (typeof text !== "string") return "";

        // Matematik formulalarni aniqlash
        const mathRegex = /\$[^$]*\$|\\\([^\)]*\\\)|\\\[[^\]]*\\\]/g;
        let formulas = [];
        let index = 0;

        // Formulalarni vaqtincha almashtirish
        text = text.replace(mathRegex, (match) => {
            formulas.push(match);
            return `__FORMULA_${index++}__`;
        });

        // Formulalarni qayta joylashtirish
        formulas.forEach((formula, i) => {
            text = text.replace(`__FORMULA_${i}__`, formula);
        });

        return text;
    };
    const fixImageTags = (text) => {
        return text.replace(/<img([^>]+)>/g, (match, attributes) => {
            // 'alt' va 'style' atributlarini olib tashlash
            attributes = attributes.replace(/\s*alt=["'][^"']*["']/g, "");
            attributes = attributes.replace(/\s*style=["'][^"']*["']/g, "");
            return `<img ${attributes} />`;
        });
    };
    const fixImageUrl = (text) => {
        if (typeof text !== "string") return "";
        const baseUrl = "https://edumark.uz";
        return text.replace(
            /<img\s+([^>]*?)src=["'](\/media[^"']+)["']([^>]*)>/g,
            (match, before, path, after) => {
                // `alt="QuestionImage"` va `style="..."` atributlarini olib tashlash
                const cleanedBefore = before
                    .replace(/\balt=["'][^"']*["']/g, "") // alt atributini olib tashlash
                    .replace(/\bstyle=["'][^"']*["']/g, "") // style atributini olib tashlash
                    .trim(); // Bo‘sh joylarni tozalash

                return `<img ${cleanedBefore} src="${baseUrl}${path}" ${after}>`;
            }
        );
    };

    const renderMath = (text) => {
        if (typeof text !== "string") return "";

        // <img> teglarini vaqtincha saqlash uchun joy
        const imgPlaceholders = [];
        let imgIndex = 0;

        // <img> teglarini vaqtincha almashtirish
        text = text.replace(/<img\s+[^>]*>/g, (match) => {
            imgPlaceholders.push(match); // Tegni saqlash
            return `@@IMG${imgIndex++}@@`; // Tegni vaqtincha almashtirish
        });

        // Matematik formulalarni aniqlash
        const mathRegex =
            /\\frac\{.*?\}\{.*?\}|\\sum|\\sqrt|\\left|\\right|\\times|\\div|a\d|⍟/g;

        // Formulalarni ajratib, ularni KaTeX orqali ko'rsatish
        text = text.replace(mathRegex, (match) => {
            try {
                // a2, a3 kabi ifodalarni a^2, a^3 ga o'zgartirish
                if (match.startsWith('a')) {
                    return katex.renderToString(match.replace('a', 'a^'), { throwOnError: false });
                }
                // ⍟ belgisini KaTeXda to'g'ri ko'rsatish
                if (match === '⍟') {
                    return katex.renderToString('\\star', { throwOnError: false });
                }
                // Boshqa matematik formulalarni render qilish
                return katex.renderToString(match, { throwOnError: false });
            } catch (error) {
                console.error("KaTeX render error:", error);
                return match;
            }
        });

        // <img> teglarini qayta joylashtirish
        text = text.replace(/@@IMG(\d+)@@/g, (match, index) => {
            return imgPlaceholders[Number(index)]; // Tegni qaytarish
        });

        return text;
    };

    const actualScore = calculateScore();
    const percentage = Math.round((actualScore / questions.length) * 100);

    return (
        <div className="test-container">
            <div className="test-result">
                <h2>{testStatus === 'timeout' ? "Vaqt tugadi!" : "Test yakunlandi!"}</h2>
                <p>Siz {questions.length} ta savoldan {actualScore} tasiga to'g'ri javob berdingiz</p>
                <p>To'g'ri javoblar foizi: {percentage}%</p>

                <div className="answers-review">
                    <h3>Javoblaringizni ko'rib chiqing:</h3>
                    {questions.map((question, index) => {
                        const userAnswerId = session?.answers?.[index];
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
                                        console.log(option);
                                        
                                        console.log(isCorrectOption);
                                        
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
                    onClick={() => {
                        sessionManager.deleteSession(sessionId);
                        router.push('/tests/all');
                    }}
                >
                    Testlar ro'yxatiga qaytish
                </button>
            </div>
        </div>
    );
};

export default Results;