"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import "./layout.scss";

const ComplatedTests = ({ id }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [testsPerPage] = useState(5);
    const nav = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://37.27.23.255:8899/api/user-statistics/?user_id=${id}`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                console.log(data);
                
                setStats(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const indexOfLastTest = currentPage * testsPerPage;
    const indexOfFirstTest = indexOfLastTest - testsPerPage;
    const currentTests = stats?.statistics?.slice(indexOfFirstTest, indexOfLastTest) || [];
    const totalPages = Math.ceil((stats?.statistics?.length || 0) / testsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleViewDetails = (test) => {
        navigate(`/test-details/${test.id}`, { state: test });
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!stats || !stats.statistics || stats.statistics.length === 0) return <div>No data available</div>;

    return (
        <div id='complated'>
            <h2>So'ngi test natijalari</h2>
            <div className="complated-tests-container">
                {currentTests.map((test, index) => (
                    <div className="complated-tests-contents" key={index}>
                        <div className="icon">
                            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" className="tb-relative">
                                <path fillRule="evenodd" clipRule="evenodd" d="M6.99968 1.16797C7.644 1.16797 8.16634 1.69031 8.16634 2.33464V2.44165C7.84518 2.46852 7.54017 2.50213 7.25089 2.54418C6.74947 2.61706 6.27671 2.71755 5.83301 2.85829V2.33464C5.83301 1.69031 6.35535 1.16797 6.99968 1.16797ZM12.7997 2.33496H15.2003H15.2005C17.4734 2.33493 19.3067 2.3349 20.7488 2.54451C22.2538 2.76325 23.5004 3.23074 24.479 4.28866C25.3886 5.27215 25.8109 6.49001 26.0215 7.94894C26.2282 9.38164 26.2473 11.1822 26.2496 13.4171C26.2503 14.0614 25.7286 14.5843 25.0843 14.585C24.4399 14.5857 23.917 14.0638 23.9163 13.4195C23.9155 12.5435 23.9114 11.7641 23.8966 11.066C23.8899 10.7513 23.6318 10.5016 23.317 10.5016H4.6829C4.36815 10.5016 4.10997 10.7512 4.10332 11.0659C4.08382 11.9887 4.08333 13.0504 4.08333 14.2854V14.8846C4.08333 17.4568 4.08546 19.2774 4.25702 20.6569C4.42548 22.0115 4.73974 22.7626 5.23392 23.2968C5.67476 23.7734 6.26033 24.0802 7.26825 24.2643C8.31832 24.4561 9.70449 24.4945 11.6702 24.5005C12.3145 24.5024 12.8353 25.0263 12.8333 25.6706C12.8314 26.315 12.3074 26.8358 11.6631 26.8338C9.73155 26.8278 8.13714 26.7951 6.84895 26.5597C5.51859 26.3167 4.40823 25.8404 3.52102 24.8813C2.55441 23.8363 2.13826 22.5268 1.94152 20.9448C1.74997 19.4046 1.74998 17.4385 1.75 14.9654V14.2045C1.74998 11.7314 1.74997 9.76539 1.94152 8.22506C2.13826 6.64314 2.55441 5.33366 3.52102 4.28866C4.4996 3.23074 5.74624 2.76325 7.25122 2.54451C8.69327 2.3349 10.5266 2.33493 12.7995 2.33496H12.7997ZM22.1663 2.85829C21.7227 2.71755 21.2499 2.61706 20.7485 2.54418C20.4592 2.50213 20.1542 2.46852 19.833 2.44165V2.33464C19.833 1.69031 20.3553 1.16797 20.9997 1.16797C21.644 1.16797 22.1663 1.69031 22.1663 2.33464V2.85829ZM21.4436 16.3535C21.1475 15.7539 20.6128 15.168 19.8316 15.168C19.0516 15.168 18.5155 15.7527 18.217 16.3514L18.2162 16.353L17.3397 18.1207C17.3068 18.1563 17.2684 18.1875 17.224 18.2075L15.6462 18.4719C14.9886 18.5823 14.3014 18.9302 14.0712 19.657C13.8422 20.3804 14.199 21.0612 14.6676 21.5335L15.8993 22.7758C15.9275 22.822 15.9448 22.8814 15.9434 22.9358L15.5916 24.4699C15.435 25.1524 15.4357 26.048 16.1236 26.5541C16.8156 27.0633 17.6702 26.789 18.2706 26.4298L19.7519 25.5455C19.802 25.5293 19.8595 25.5329 19.91 25.5441L21.3945 26.4302C21.9932 26.7868 22.8496 27.0655 23.5425 26.5562C24.2319 26.0494 24.2286 25.1513 24.073 24.4706L23.721 22.9358C23.7199 22.8861 23.7393 22.8182 23.7651 22.7758L24.9949 21.5355L24.996 21.5345C25.4673 21.062 25.8257 20.3804 25.5947 19.6554C25.3632 18.9294 24.6754 18.5823 24.0188 18.472L22.4364 18.2068C22.3921 18.1881 22.3504 18.1576 22.3196 18.1206L21.4436 16.3535Z" fill="currentColor" fillOpacity="0.85"></path>
                            </svg>
                        </div>
                        <div className="test-title">
                            <p>{test.test_title}</p>
                            <p>{new Date(test.created_at).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })} | {new Date(test.created_at).toLocaleTimeString('en-GB', {
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</p>
                        </div>
                        <div className="test-count">
                            <p>{test.total_questions}</p>
                            <p>Savollar soni<span>:</span></p>
                        </div>
                        <div className="test-count mob-dn">
                            <p>{test.correct_answers}</p>
                            <p>To'g'ri javoblar<span>:</span></p>
                        </div>
                        <div className="test-count">
                            <p>{test.percentage_correct}%</p>
                            <p>Natija<span>:</span></p>
                        </div>
                        {/* <button 
              className="view-details-btn"
              onClick={() => handleViewDetails(test)}
            >
              Ko'rish
            </button> */}
                    </div>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                        disabled={currentPage === 1}
                    >
                        &laquo;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                        <button
                            key={number}
                            onClick={() => paginate(number)}
                            className={currentPage === number ? 'active' : ''}
                        >
                            {number}
                        </button>
                    ))}

                    <button
                        onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        disabled={currentPage === totalPages}
                    >
                        &raquo;
                    </button>
                </div>
            )}
        </div>
    )
}

export default ComplatedTests;