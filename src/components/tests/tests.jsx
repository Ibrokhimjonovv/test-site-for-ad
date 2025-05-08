import Link from 'next/link'
import React from 'react';
import "./tests.scss";

const tests = [
    {
        id: 1,
        testImage: "https://cdn.testbor.com/0/quiz-category/01JPMA7KTREH7RMB957PAQG926.png",
        isNew: true,
        testTitle: "Prezident Maktablari",
        testCount: "Cheksiz testlar",
    }
]

const Tests = () => {
    const formatCategoryLink = (title) => {
        return title.toLowerCase().replace(/\s+/g, '-');
    }
    return (
        <div className='tests-container'>
            <div className="tests-container-inner">
                <h1>Testlar <Link href="/tests/all">Barchasini ko'rish <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="48" d="M184 112l144 144-144 144" /></svg></Link></h1>

                <div className="tests-content">
                    {
                        tests.map((test, index) => (
                            <div className="test-card" key={index}>
                                <Link href={`tests/${formatCategoryLink(test.testTitle)}`}>
                                    <div className="card-top">
                                        <div className="card-top-top">
                                            <img src={test.testImage} alt="" />
                                            <div className={`new ${test.isNew ? "active" : ""}`}>Yangi</div>
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
                        ))
                    }
                </div>
            </div>
        </div>
    )
}

export default Tests