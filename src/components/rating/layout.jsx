'use client'

import React, { useEffect, useState } from 'react';
import crown from "@/assets/crown.png";
import "./layout.scss";
import BalanceTopUp from '../top-up-balance/layout';

const Rating = ({ userId, user, allUsers, balance }) => {
    
    const formattedNumber = new Intl.NumberFormat('de-DE').format(balance ? balance : 0);

    

    return (
        <div id='rating'>
            <div className={`ichi`}>
                <p>{allUsers?.user_count} ta foydalanuvchi ichidan</p>
                <p>
                    <img src={crown.src} alt="crown" />
                    <span>{userId?.rank || 0}</span>
                </p>
                <p>O'rindasiz</p>
            </div>
            <div className={`line`}></div>
            <div className={`ni`}>
                <p id='f-p'>Mening balansim</p>
                <div className={`results-cont`}>
                    <p>{formattedNumber} UZS</p>
                    <BalanceTopUp user={user}/>
                </div>
            </div>
        </div>
    );
};

export default Rating;