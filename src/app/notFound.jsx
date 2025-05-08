import React from 'react';
import Link from 'next/link';

const NotFound = () => {
    return (
        <div className="not-found">
            <h1>404</h1>
            <p>Ushbu sahifa topilmadi.</p>
            <Link href="/">Bosh sahifaga qaytish</Link>
        </div>
    );
};

export default NotFound;
