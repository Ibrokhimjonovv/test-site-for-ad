'use client'

import React from 'react';
import crown from "@/assets/crown.png";
import "./layout.scss";
import BalanceTopUp from '../top-up-balance/layout';
import Link from 'next/link';

const Rating = ({ userId, user, allUsers, balance }) => {

    const formattedNumber = new Intl.NumberFormat('de-DE').format(balance ? balance : 0);

    return (
        <div id='rating'>
            <div className={`ichi`}>
                <p>Out of {allUsers?.user_count} users</p>
                <p>
                    <img src={crown.src} alt="crown" />
                    <span>{userId?.rank || 0}</span>
                </p>
                <p>Your Rank</p>
            </div>
            <div className={`line`}></div>
            <div className={`ni`}>
                <p id='f-p'>My Balance</p>
                <div className={`results-cont`}>
                    <p>{formattedNumber} UZS</p>
                    {/* <BalanceTopUp user={user}/> */}
                    <Link href="/top-up-balance">
                        Top Up Balance
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Rating;
