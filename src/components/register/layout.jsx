"use client";
import React, { useContext, useState } from 'react';
import "./layout.scss";
import { useMask } from '@react-input/mask';
import { AccessContext } from '@/contexts/contexts';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const Layout = () => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        username: '',
        phone_number: '',
        password: '',
        confirm_password: '',
        action: 'signup'
    });
    const [show, setShow] = useState({
        password: true,
        confirm_password: true
    });
    const [errors, setErrors] = useState({
        first_name: '',
        last_name: '',
        username: '',
        phone_number: '',
        password: '',
        confirm_password: ''
    });
    const [loading, setLoading] = useState(false);
    const { registerStat, setRegisterStat, setLoginStat, loginStat } = useContext(AccessContext);
    const router = useRouter();

    const inputRef = useMask({
        mask: '+998 (__) ___-__-__',
        replacement: { _: /\d/ },
        showMask: true,
        separate: true,
    });

    const handleFocus = (e) => {
        if (!formData.phone_number) {
            setTimeout(() => {
                e.target.setSelectionRange(6, 6);
            }, 0);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'phone_number') {
            validatePhoneNumber(value);
        } else if (name === 'password') {
            validatePassword(value);
        } else if (name === 'confirm_password') {
            validateConfirmPassword(value);
        }
    };

    const validatePhoneNumber = (phone) => {
        const cleanedPhone = phone.replace(/\D/g, '').slice(-9);
        if (cleanedPhone.length !== 9) {
            setErrors(prev => ({ ...prev, phone_number: "Telefon raqami noto'g'ri formatda" }));
            return false;
        }
        setErrors(prev => ({ ...prev, phone_number: '' }));
        return true;
    };

    const validatePassword = (password) => {
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,32}$/;
        if (!passwordRegex.test(password)) {
            setErrors(prev => ({
                ...prev,
                password: "Parol kamida bitta raqam, bitta kichik harf, bitta bosh harf, hamda 6-32 oraliqdagi uzunlikda bo'lishi kerak"
            }));
            return false;
        }
        setErrors(prev => ({ ...prev, password: '' }));

        if (formData.confirm_password) {
            validateConfirmPassword(formData.confirm_password);
        }

        return true;
    };

    const validateConfirmPassword = (confirmPassword) => {
        if (confirmPassword !== formData.password) {
            setErrors(prev => ({ ...prev, confirm_password: "Parollar mos kelmadi" }));
            return false;
        }
        setErrors(prev => ({ ...prev, confirm_password: '' }));
        return true;
    };

    const validateForm = () => {
        let isValid = true;
        const newErrors = { ...errors };

        if (!formData.first_name.trim()) {
            newErrors.first_name = "Ism kiritilishi shart";
            isValid = false;
        }
        if (!formData.last_name.trim()) {
            newErrors.last_name = "Familiya kiritilishi shart";
            isValid = false;
        }
        if (!formData.username.trim()) {
            newErrors.username = "Foydalanuvchi nomi kiritilishi shart";
            isValid = false;
        }

        if (!validatePhoneNumber(formData.phone_number)) {
            isValid = false;
        }

        if (!validatePassword(formData.password)) {
            isValid = false;
        }

        if (!validateConfirmPassword(formData.confirm_password)) {
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            const response = await fetch('/site/user/register/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    username: formData.username,
                    phone_number: formData.phone_number,
                    password: formData.password,
                    action: 'signup'
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Registration failed');
            }

            // Muvaffaqiyatli ro'yxatdan o'tish
            alert("Ro'yxatdan muvaffaqiyatli o'tdingiz!");
            setRegisterStat(false);

        } catch (error) {
            setErrors(prev => ({
                ...prev,
                form: error.message || 'Xatolik yuz berdi'
            }));
        } finally {
            setLoading(false);
        }
    };

    const toggleAction = () => {
        setLoginStat(!loginStat);
        setRegisterStat(!registerStat)
        setErrors({ login: "", password: "" })
    };
    return (
        <>
            <div className={`register-shape ${registerStat ? "popped" : ""}`}></div>
            <div className={`register-popup ${registerStat ? "popped" : ""}`}>
                <div className="register-container">
                    <div className="close" onClick={() => setRegisterStat(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M256 112v288M400 256H112" />
                        </svg>
                    </div>
                    <div className="logo">
                        TestIshla<span>.</span>
                    </div>
                    <h1>
                        <span>Akkount</span> yaratish
                    </h1>

                    <div className="register-type">
                        <div className="phone">
                            Telefon raqam
                        </div>
                    </div>

                    {errors.form && <div className="error-message">{errors.form}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="input-row">
                            <input
                                type="text"
                                name="first_name"
                                placeholder='Ism'
                                value={formData.first_name}
                                onChange={handleChange}
                            />
                            {errors.first_name && <span className="error-text">{errors.first_name}</span>}
                        </div>
                        <div className="input-row">
                            <input
                                type="text"
                                name="last_name"
                                placeholder='Familiya'
                                value={formData.last_name}
                                onChange={handleChange}
                            />
                            {errors.last_name && <span className="error-text">{errors.last_name}</span>}
                        </div>

                        <div className="input-row">
                            <input
                                type="text"
                                name="username"
                                placeholder='Foydalanuvchi nomi'
                                value={formData.username}
                                onChange={handleChange}
                            />
                            {errors.username && <span className="error-text">{errors.username}</span>}
                        </div>

                        <div className="input-row">
                            <input
                                ref={inputRef}
                                type="tel"
                                name="phone_number"
                                placeholder='+998 (__) ___-__-__'
                                value={formData.phone_number}
                                onChange={handleChange}
                                onFocus={handleFocus}
                                className="phone-input"
                            />
                            {errors.phone_number && <span className="error-text">{errors.phone_number}</span>}
                        </div>

                        <div className="input-row">
                            <input
                                type={show.password ? "password" : "text"}
                                name="password"
                                placeholder="Parol"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <button type='button' onClick={() => setShow({ ...show, password: !show.password })}>
                                {show.password ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                                        <path d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
                                        <circle cx="256" cy="256" r="80" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                                        <path d="M432 448a15.92 15.92 0 01-11.31-4.69l-352-352a16 16 0 0122.62-22.62l352 352A16 16 0 01432 448zM255.66 384c-41.49 0-81.5-12.28-118.92-36.5-34.07-22-64.74-53.51-88.7-91v-.08c19.94-28.57 41.78-52.73 65.24-72.21a2 2 0 00.14-2.94L93.5 161.38a2 2 0 00-2.71-.12c-24.92 21-48.05 46.76-69.08 76.92a31.92 31.92 0 00-.64 35.54c26.41 41.33 60.4 76.14 98.28 100.65C162 402 207.9 416 255.66 416a239.13 239.13 0 0075.8-12.58 2 2 0 00.77-3.31l-21.58-21.58a4 4 0 00-3.83-1 204.8 204.8 0 01-51.16 6.47zM490.84 238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.66 96a227.34 227.34 0 00-74.89 12.83 2 2 0 00-.75 3.31l21.55 21.55a4 4 0 003.88 1 192.82 192.82 0 0150.21-6.69c40.69 0 80.58 12.43 118.55 37 34.71 22.4 65.74 53.88 89.76 91a.13.13 0 010 .16 310.72 310.72 0 01-64.12 72.73 2 2 0 00-.15 2.95l19.9 19.89a2 2 0 002.7.13 343.49 343.49 0 0068.64-78.48 32.2 32.2 0 00-.1-34.78z" />
                                        <path d="M256 160a95.88 95.88 0 00-21.37 2.4 2 2 0 00-1 3.38l112.59 112.56a2 2 0 003.38-1A96 96 0 00256 160zM165.78 233.66a2 2 0 00-3.38 1 96 96 0 00115 115 2 2 0 001-3.38z" />
                                    </svg>
                                )}
                            </button>
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        <div className="input-row">
                            <input
                                type={show.confirm_password ? "password" : "text"}
                                name="confirm_password"
                                placeholder="Parolni takrorlang"
                                value={formData.confirm_password}
                                onChange={handleChange}
                            />
                            <button type='button' onClick={() => setShow({ ...show, confirm_password: !show.confirm_password })}>
                                {show.confirm_password ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                                        <path d="M255.66 112c-77.94 0-157.89 45.11-220.83 135.33a16 16 0 00-.27 17.77C82.92 340.8 161.8 400 255.66 400c92.84 0 173.34-59.38 221.79-135.25a16.14 16.14 0 000-17.47C428.89 172.28 347.8 112 255.66 112z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" />
                                        <circle cx="256" cy="256" r="80" fill="none" stroke="currentColor" strokeMiterlimit="10" strokeWidth="32" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                                        <path d="M432 448a15.92 15.92 0 01-11.31-4.69l-352-352a16 16 0 0122.62-22.62l352 352A16 16 0 01432 448zM255.66 384c-41.49 0-81.5-12.28-118.92-36.5-34.07-22-64.74-53.51-88.7-91v-.08c19.94-28.57 41.78-52.73 65.24-72.21a2 2 0 00.14-2.94L93.5 161.38a2 2 0 00-2.71-.12c-24.92 21-48.05 46.76-69.08 76.92a31.92 31.92 0 00-.64 35.54c26.41 41.33 60.4 76.14 98.28 100.65C162 402 207.9 416 255.66 416a239.13 239.13 0 0075.8-12.58 2 2 0 00.77-3.31l-21.58-21.58a4 4 0 00-3.83-1 204.8 204.8 0 01-51.16 6.47zM490.84 238.6c-26.46-40.92-60.79-75.68-99.27-100.53C349 110.55 302 96 255.66 96a227.34 227.34 0 00-74.89 12.83 2 2 0 00-.75 3.31l21.55 21.55a4 4 0 003.88 1 192.82 192.82 0 0150.21-6.69c40.69 0 80.58 12.43 118.55 37 34.71 22.4 65.74 53.88 89.76 91a.13.13 0 010 .16 310.72 310.72 0 01-64.12 72.73 2 2 0 00-.15 2.95l19.9 19.89a2 2 0 002.7.13 343.49 343.49 0 0068.64-78.48 32.2 32.2 0 00-.1-34.78z" />
                                        <path d="M256 160a95.88 95.88 0 00-21.37 2.4 2 2 0 00-1 3.38l112.59 112.56a2 2 0 003.38-1A96 96 0 00256 160zM165.78 233.66a2 2 0 00-3.38 1 96 96 0 00115 115 2 2 0 001-3.38z" />
                                    </svg>
                                )}
                            </button>
                            {errors.confirm_password && <span className="error-text">{errors.confirm_password}</span>}
                        </div>

                        <div className="toggle-action">
                            <button type="button" onClick={toggleAction}>
                                {formData.action === 'signup'
                                    ? <>Allaqachon akkauntingiz bormi? <span>Kirish</span></>
                                    : <>Akkountingiz yo'qmi? <span>Ro'yxatdan o'tish</span></>}
                            </button>
                        </div>

                        <div className="input-row">
                            <button type="submit" disabled={loading}>
                                {loading ? 'Yuklanmoqda...' : "Ro'yxatdan o'tish"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}

export default Layout;