import React from 'react';
import Link from 'next/link';
import "@/styles/not-found.scss";

const NotFound = () => {
    return (
        <div className="not-found">
            <h1>404</h1>
            <p>This page was not found.</p>
            <Link href="/">Return to Home</Link>
        </div>
    );
};

export default NotFound;
