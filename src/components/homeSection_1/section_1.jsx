import React from 'react';
import backgroundGrid from "@/images/home_grid.webp";
import "./section_1.scss";
import Link from 'next/link';

const Section_1 = () => {
    return (
        <div className='home_section_1'>
            <img id='background_image' src={backgroundGrid.src} alt="" />
            <div className="texts">
                <h1>Prezident maktablari-2025</h1>
                <h1>Iqtidorli Bolalar Respublika Olimpiadasi
                    <svg width="100%" height="12" viewBox="0 0 278 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M246.864 12C247.65 12 248.323 11.4563 248.384 10.7337C248.453 9.97664 247.826 9.30908 246.986 9.24714C199.731 5.75101 151.942 3.88595 104.092 3.6726C126.077 3.24591 147.962 3.08073 169.565 2.90868C204.735 2.64028 241.104 2.35811 276.319 5.55831C277.167 5.63402 277.908 5.08344 277.992 4.3264C278.076 3.56937 277.465 2.89491 276.625 2.81921C241.241 -0.401635 204.788 -0.119464 169.535 0.155822C114.336 0.582515 57.2579 1.02297 1.38678 5.73724C0.561768 5.80606 -0.0569458 6.45987 0.00418091 7.20314C0.0652771 7.94642 0.783325 8.51075 1.60068 8.47633C83.3295 4.81503 165.807 5.99877 246.734 11.9862C246.78 11.9862 246.818 11.9862 246.864 11.9862V12Z" fill="none" stroke="#FCD34F" strokeWidth="1" className="tb-underline underline_1"></path></svg>
                </h1>

                <div className="cent">
                <Link href="/tests/all">Hoziroq boshlang!</Link>
                </div>
            </div>
        </div>
    )
}

export default Section_1