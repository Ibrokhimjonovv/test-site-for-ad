"use client"

import React, { useState, useEffect, useContext, useRef } from "react";
import "./layout.scss";
import { useRouter } from "next/navigation";
import { useMask } from '@react-input/mask';
import Link from "next/link";
import { AccessContext } from "@/contexts/contexts";
import { api } from "@/config";

const regionsURL =
    "https://raw.githubusercontent.com/MIMAXUZ/uzbekistan-regions-data/master/JSON/regions.json";
const districtsURL =
    "https://raw.githubusercontent.com/MIMAXUZ/uzbekistan-regions-data/master/JSON/districts.json";

const Signup = () => {
    const [step, setStep] = useState(1);
    const [smsErr, setSmsErr] = useState("");
    const [phone, setPhone] = useState("");
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        username: "",
        phone_number: phone,
        password: "",
    });

    const [countdown, setCountdown] = useState(180); // 3 minutes
    const [canResend, setCanResend] = useState(false);
    const { loginStat, setLoginStat, registerStat, setRegisterStat } = useContext(AccessContext)

    useEffect(() => {
        setFormData((prev) => ({ ...prev, phone_number: phone }));
    }, [phone]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        let newValue = value;

        if (name === "age") {
            newValue = value.replace(/[^0-9.]/g, '');
            if (newValue.length === 2 && formData.age.length === 1) {
                newValue += '.';
            } else if (newValue.length === 5 && formData.age.length === 4) {
                newValue += '.';
            }
            newValue = newValue.substring(0, 10);
        }

        setFormData({
            ...formData,
            [name]: newValue,
        });
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.first_name.trim()) errors.first_name = "Enter first name!";
        if (!formData.last_name.trim()) errors.last_name = "Enter last name!";
        if (!formData.username.trim()) errors.username = "Enter username!";
        if (formData.password.length < 6) {
            errors.password = "Password must be at least 6 characters!";
        }
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match!";
        }
        if (!validatePhone(phone)) {
            errors.phone = "Enter a valid phone number!";
        }
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const response = await fetch(`${api}/user/auth/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    username: formData.username,
                    phone_number: formData.phone_number,
                    password: formData.password,
                    action: 'signup',
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setLoginStat(!loginStat);
                setRegisterStat(!registerStat);
                setErrors({ login: "", password: "" });
                setSuccessM(true);
                setTimeout(() => {
                    setSuccessM(false);
                }, 5000);
            } else {
                const errorData = await response.json();
                alert("Error: " + (errorData.message || "Unknown error"));
            }
        } catch (error) {
            console.log("Network error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        let timer;
        if (step === 2 && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setCanResend(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [step, countdown]);

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            phone_number: phone.replace(/\D/g, '').slice(-9)
        }));
    }, [phone]);

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

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        setPhone(value);
        if (!validatePhone(value)) {
            setErrors(prev => ({ ...prev, phone: "Enter a valid phone number!" }));
        } else {
            setErrors(prev => ({ ...prev, phone: "" }));
        }
    };

    const validatePhone = (phoneNumber) => {
        const cleaned = phoneNumber.replace(/\D/g, '');
        return cleaned.length === 12; // +998XXXXXXXXX
    };

    const toggleAction = () => {
        setLoginStat(!loginStat);
        setRegisterStat(!registerStat)
        setErrors({ login: "", password: "" })
    };

    return (
        <>
            <div className={`register-shape ${registerStat ? "popped" : ""}`}></div>
            <section className={`register-popup ${registerStat ? "popped" : ""}`}>
                <div className={`register-container`}>
                    <div className="close" onClick={() => setRegisterStat(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="ionicon" viewBox="0 0 512 512">
                            <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="32" d="M256 112v288M400 256H112" />
                        </svg>
                    </div>
                    <h1 className="logo">TestWork<span>.</span></h1>
                    <h1 style={{ fontSize: "32px" }}>
                        <span>Sign</span> up
                    </h1>
                    <div className="register-type">
                        <div className="phone">
                            Phone number
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="last-form">
                        <div className={`content form last`}>
                            <div className={`input-row ${errors.first_name ? "err-border" : ""}`}>
                                <input
                                    type="text"
                                    placeholder="Enter first name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                                {errors.first_name && <span className={`error-text `}>{errors.first_name}</span>}
                            </div>
                            <div className={`input-row ${errors.last_name ? "err-border" : ""} `}>
                                <input
                                    type="text"
                                    placeholder="Enter last name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                                {errors.last_name && <span className={`error-text `}>{errors.last_name}</span>}
                            </div>
                            <div className={`input-row ${errors.username ? "err-border" : ""}`}>
                                <input
                                    type="text"
                                    placeholder="Enter username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                                {errors.username && <span className={`error-text`}>{errors.username}</span>}
                            </div>
                            <div className="input-row">
                                <input
                                    ref={inputRef}
                                    type="tel"
                                    value={phone}
                                    onChange={handlePhoneChange}
                                    onFocus={handleFocus}
                                    className="phone-input"
                                    placeholder='+998 (__) ___-__-__'
                                />
                                {errors.phone && <span className="error-text">{errors.phone}</span>}
                            </div>
                            <div className={`input-row ${errors.password ? "err-border" : ""} `}>
                                <input
                                    type="password"
                                    placeholder="Enter password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {errors.password && <span className={`error-text `}>{errors.password}</span>}
                            </div>
                            <div className={`input-row ${errors.confirmPassword ? "err-border" : ""} `}>
                                <input
                                    type="password"
                                    placeholder="Confirm password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                />
                                {errors.confirmPassword && (
                                    <span className={`error-text`}>{errors.confirmPassword}</span>
                                )}
                            </div>
                            <div className="toggle-action">
                                <button type="button" onClick={toggleAction}>
                                    {formData.action === 'signup'
                                        ? <>
                                            Already have an account? <span>Login</span>
                                        </>
                                        : <>
                                            Don't have an account? <span>Sign up</span>
                                        </>}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="n" disabled={loading}>
                            {loading ? "Signing up..." : "Sign up"}
                        </button>
                    </form>
                </div>
            </section>
        </>
    );
};

export default Signup;
