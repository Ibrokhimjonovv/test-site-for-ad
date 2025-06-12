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
        // email: "",
        password: "",
        // confirmPassword: '',
        // age: "",
        // gender: "male",
    });

    // const [code, setCode] = useState(Array(4).fill(""));
    const [countdown, setCountdown] = useState(180); // 3 minutes in seconds
    const [canResend, setCanResend] = useState(false);
    // const inputRefs = useRef([]);
    // const router = useRouter();
    const { loginStat, setLoginStat, registerStat, setRegisterStat } = useContext(AccessContext)

    // const formatTime = (seconds) => {
    //     const mins = Math.floor(seconds / 60);
    //     const secs = seconds % 60;
    //     return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    // };

    useEffect(() => {
        setFormData((prev) => ({ ...prev, phone_number: phone }));
    }, [phone]);

    // useEffect(() => {
    //     const fetchRegions = async () => {
    //         try {
    //             const response = await fetch(regionsURL);
    //             if (response.ok) {
    //                 const data = await response.json();
    //                 setRegions(data);
    //             } else {
    //                 console.error("Viloyatlarni olishda xatolik");
    //             }
    //         } catch (error) {
    //             console.error("Error:", error);
    //         }
    //     };
    //     fetchRegions();
    // }, []);

    // const handleRegionChange = async (event) => {
    //     const selectedRegionId = event.target.value;
    //     setSelectedRegion(selectedRegionId);
    //     try {
    //         const response = await fetch(districtsURL);
    //         if (response.ok) {
    //             const data = await response.json();
    //             const regionDistricts = data.filter(
    //                 (district) => district.region_id === Number(selectedRegionId)
    //             );
    //             setDistricts(regionDistricts);
    //         } else {
    //             console.error("Tumanlarni olishda xatolik");
    //         }
    //     } catch (error) {
    //         console.error("Error:", error);
    //     }
    //     setSelectedDistrict("");
    // };

    // const handleDistrictChange = (event) => {
    //     setSelectedDistrict(event.target.value);
    // };

    const handleChange = (event) => {
        const { name, value } = event.target;
        let newValue = value;

        if (name === "age") {
            // Faqat raqam va nuqtalarga ruxsat beramiz
            newValue = value.replace(/[^0-9.]/g, '');

            // Avtomatik nuqta qo'yish
            if (newValue.length === 2 && formData.age.length === 1) {
                newValue += '.';
            } else if (newValue.length === 5 && formData.age.length === 4) {
                newValue += '.';
            }

            // Maksimal 10 ta belgi (DD.MM.YYYY)
            newValue = newValue.substring(0, 10);
        }

        setFormData({
            ...formData,
            [name]: newValue,
        });
    };

    // const validateDate = (date) => {
    //     // Formatni tekshirish (DD.MM.YYYY)
    //     const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    //     if (!regex.test(date)) return "Iltimos, DD.MM.YYYY formatida kiriting";

    //     const [day, month, year] = date.split('.').map(Number);
    //     const currentYear = new Date().getFullYear();

    //     // Kunni tekshirish
    //     if (day < 1 || day > 31) return "Kun noto'g'ri (1-31 oralig'ida bo'lishi kerak)";

    //     // Oyni tekshirish
    //     if (month < 1 || month > 12) return "Oy noto'g'ri (1-12 oralig'ida bo'lishi kerak)";

    //     // Yilni tekshirish
    //     if (year < 1900 || year > currentYear) {
    //         return `Yil noto'g'ri (1900-${currentYear} oralig'ida bo'lishi kerak)`;
    //     }

    //     return ""; // Xato yo'q
    // };

    const validateForm = () => {
        let errors = {};
        if (!formData.first_name.trim()) errors.first_name = "Ism kiriting!";
        if (!formData.last_name.trim()) errors.last_name = "Familiya kiriting!";
        if (!formData.username.trim()) errors.username = "Foydalanuvchi nomini kiriting!";
        // if (!formData.age.trim()) {
        //     errors.age = "Tug'ilgan sanani kiriting!";
        // } else {
        //     const ageError = validateDate(formData.age);
        //     if (ageError) errors.age = ageError;
        // }
        if (formData.password.length < 6) {
            errors.password = "Parol kamida 6 ta belgidan tashkil topishi kerak!";
        }

        // Parollarni solishtirish tekshiruvi
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Parollar mos emas!";
        }
        if (!validatePhone(phone)) {
            errors.phone = "To'liq telefon raqam kiriting!";
        }
        // if (!selectedRegion) errors.region = "Viloyat kiriting!";
        // if (!selectedDistrict) errors.district = "Tuman kiriting!";
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
                alert("Error: " + (errorData.message || "Noma'lum xato"));
            }
        } catch (error) {
            console.log("Tarmoq xatosi");
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

    // const [smsLimitError, setSmsLimitError] = useState("");

    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            phone_number: phone.replace(/\D/g, '').slice(-9)
        }));
    }, [phone]);

    // const sendSMS = async () => {

    //     if (!validatePhone(phone)) {
    //         setErrors(prev => ({ ...prev, phone: "To'liq telefon raqam kiriting!" }));
    //         return;
    //     }

    //     // Telefon raqamni tozalash
    //     const cleanedPhone = phone.replace(/\D/g, '');

    //     // Formatni tekshirish (998XXXXXXXXX)
    //     if (!/^998\d{9}$/.test(cleanedPhone)) {
    //         setErrors(prev => ({ ...prev, phone: "Iltimos, to'g'ri telefon raqamni kiriting!" }));
    //         return;
    //     }
    //     setLoading(true);
    //     setSmsLimitError(""); // Xatoliklarni tozalash
    //     try {
    //         const res = await fetch(`/site/send-sms/`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ phone: cleanedPhone }),
    //         });

    //         const data = await res.json(); // Javobni JSON formatida olish

    //         if (res.ok) {
    //             setStep(2);
    //             setCountdown(180);
    //             setCanResend(false);
    //         } else {
    //             // Agar API dan xato kelsa
    //             setSmsLimitError(data.error || "Sms kodi xato");
    //         }
    //     } catch (error) {
    //         setSmsLimitError("Tarmoq xatosi!");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const [resLoading, setResLoading] = useState(false);

    // const handleResendCode = async () => {
    //     if (!canResend) return;
    //     if (!validatePhone(phone)) {
    //         setErrors(prev => ({ ...prev, phone: "To'liq telefon raqam kiriting!" }));
    //         return;
    //     }

    //     // Telefon raqamni tozalash
    //     const cleanedPhone = phone.replace(/\D/g, '');

    //     // Formatni tekshirish (998XXXXXXXXX)
    //     if (!/^998\d{9}$/.test(cleanedPhone)) {
    //         setErrors(prev => ({ ...prev, phone: "Iltimos, to'g'ri telefon raqamni kiriting!" }));
    //         return;
    //     }
    //     setResLoading(true);
    //     setSmsLimitError(""); // Xatoliklarni tozalash
    //     try {
    //         const res = await fetch(`/site/send-sms/`, {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({ phone: cleanedPhone }),
    //         });

    //         const data = await res.json(); // Javobni JSON formatida olish

    //         if (res.ok) {
    //             setStep(2);
    //             setCountdown(180);
    //             setCanResend(false);
    //         } else {
    //             // Agar API dan xato kelsa
    //             setSmsLimitError(data.error || "Sms kodi xato");
    //         }
    //     } catch (error) {
    //         setSmsLimitError("Tarmoq xatosi!");
    //     } finally {
    //         setResLoading(false);
    //     }
    // };

    // const verifyCode = async () => {
    //     setLoading(true);
    //     setSmsErr("");

    //     try {
    //         const res = await fetch('/site/verify-sms', {
    //             method: "POST",
    //             headers: { "Content-Type": "application/json" },
    //             body: JSON.stringify({
    //                 phone: phone.replace(/\D/g, ''), // Faqat raqamlarni yuborish
    //                 code: code.join("")
    //             }),
    //         });

    //         const data = await res.json();

    //         if (!res.ok) {
    //             throw new Error(data.error || "Tasdiqlash muvaffaqiyatsiz");
    //         }

    //         // Agar muvaffaqiyatli bo'lsa
    //         setStep(3);

    //         // Token ni saqlash (agar kerak bo'lsa)
    //         if (data.token) {
    //             localStorage.setItem('authToken', data.token);
    //         }

    //     } catch (error) {
    //         setSmsErr(error.message || "Tasdiqlashda xatolik yuz berdi");
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // const handleInputChange = (e, index) => {
    //     const value = e.target.value;
    //     if (/^[0-9]$/.test(value) || value === "") {
    //         const newCode = [...code];
    //         newCode[index] = value;
    //         setCode(newCode);
    //         if (value && index < 3) {
    //             inputRefs.current[index + 1].focus();
    //         }
    //     }
    // };

    // const handleKeyDown = (e, index) => {
    //     if (e.key === "Backspace" && !code[index] && index > 0) {
    //         inputRefs.current[index - 1].focus();
    //     }
    // };

    const inputRef = useMask({
        mask: '+998 (__) ___-__-__',
        replacement: { _: /\d/ },
        showMask: true,
        separate: true,
    });

    // const inputRefAge = useMask({
    //     mask: 'MM.DD.YYYY',
    //     replacement: { _: /\d/ },
    //     showMask: true,
    //     separate: true,
    // });

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

        // Validate immediately
        if (!validatePhone(value)) {
            setErrors(prev => ({ ...prev, phone: "To'liq telefon raqam kiriting!" }));
        } else {
            setErrors(prev => ({ ...prev, phone: "" }));
        }
    };

    const validatePhone = (phoneNumber) => {
        const cleaned = phoneNumber.replace(/\D/g, '');
        return cleaned.length === 12; // +998 followed by 9 digits
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
                    <h1 className="logo">TestIshla<span>.</span></h1>
                    <h1 style={{ fontSize: "32px" }}>
                        <span>Ro'yxatdan</span> o'ting
                    </h1>
                    <div className="register-type">
                        <div className="phone">
                            Telefon raqam
                        </div>
                    </div>

                    {/* {step === 1 && ( */}
                    <div className={`steps form`}>



                        {/* <div className={`input-row`}>
                            <button
                                className="n"
                                disabled={loading}
                                onClick={sendSMS}
                            >
                                {loading ? "Kod yuborilmoqda..." : "Kod yuborish"}
                            </button>
                        </div> */}
                    </div>
                    {/* )} */}

                    {/* {step === 2 && (
                        <div className={`steps form`}>
                            <h2 style={{ margin: "10px 0", textAlign: "center" }}>Kodni tasdiqlash</h2>
                            <div className={`code-field `}>
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        type="text"
                                        maxLength="1"
                                        value={digit}
                                        placeholder="*"
                                        onChange={(e) => handleInputChange(e, index)}
                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                        ref={(el) => (inputRefs.current[index] = el)}
                                    />
                                ))}
                            </div>

                            {smsErr && <span className="error-text al">{smsErr}</span>}
                            <div className={`resend-section `}>
                                <p className={`countdown-text`}>
                                    {countdown > 0
                                        ? `Qayta kod yuborish uchun ${formatTime(countdown)} d`
                                        : ""}
                                </p>

                                {countdown === 0 && (
                                    <button
                                        type="button"
                                        onClick={handleResendCode}
                                        disabled={loading}
                                        className={`resend-btn n`}
                                    >
                                        {resLoading ? "Kod yuborilmoqda..." : "Kodni qayta yuborish"}
                                    </button>
                                )}
                            </div>

                            <div className={`input-row`} style={{ flexDirection: "row" }}>
                                <button className="n fons-sm" type="button" id="back" onClick={() => setStep(1)} >
                                    Ortga
                                </button>
                                <button
                                    className="n fons-sm"
                                    disabled={loading}
                                    onClick={verifyCode}
                                >
                                    {loading ? "Tasdiqlanmoqda..." : "Tasdiqlash"}
                                </button>
                            </div>
                        </div>
                    )} */}

                    {/* {step === 3 && ( */}
                    <form onSubmit={handleSubmit} className="last-form">
                        <div className={`content form last`}>
                            <div className={`input-row ${errors.first_name ? "err-border" : ""}`}>
                                <input
                                    type="text"
                                    placeholder="Ism kiriting"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                                {errors.first_name && <span className={`error-text `}>{errors.first_name}</span>}
                            </div>
                            <div className={`input-row ${errors.last_name ? "err-border" : ""} `}>
                                <input
                                    type="text"
                                    placeholder="Familiya kiriting"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                                {errors.last_name && <span className={`error-text `}>{errors.last_name}</span>}
                            </div>
                            <div className={`input-row ${errors.username ? "err-border" : ""}`}>
                                <input
                                    type="text"
                                    placeholder="Foydalanuvchi nomini kiriting"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                />
                                {errors.username && <span className={`error-text`}>{errors.username}</span>}
                            </div>
                            {/* <div className={`input-row ${errors.age ? "err-border" : ""}`}>
                                <InputMask
                                    mask="99.99.9999"
                                    placeholder="DD.MM.YYYY"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                >
                                    {(inputProps) => <input {...inputProps} type="text" />}
                                </InputMask>
                                {errors.age && <span className={`error-text `}>{errors.age}</span>}
                            </div> */}
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

                            {/* {smsLimitError && <p className={`sms-limit-error `}>{smsLimitError}</p>} */}
                            {/* <div className={`input-row ${errors.age ? "err-border" : ""}`}>
                                <input
                                    type="text"
                                    placeholder="DD.MM.YYYY"
                                    name="age"
                                    value={formData.age}
                                    onChange={handleChange}
                                    maxLength={10}
                                />
                                {errors.age && <span className="error-text">{errors.age}</span>}
                            </div>
                            <div className={`input-row `}>
                                <input
                                    type="email"
                                    placeholder="Email kiriting"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className={`input-row `}>
                                <select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                >
                                    <option value="male" >Erkak</option>
                                    <option value="female" >Ayol</option>
                                </select>
                            </div>
                            <div className={`input-row ${errors.region ? "err-border" : ""} `}>
                                <select
                                    id="regionSelect"
                                    value={selectedRegion}
                                    onChange={handleRegionChange}
                                >
                                    <option value="" disabled >
                                        Viloyat tanlang
                                    </option>
                                    {regions.map((region) => (
                                        <option key={region.id} value={region.id} >
                                            {region.name_uz.replace(/�/g, "'")}
                                        </option>
                                    ))}
                                </select>
                                {errors.region && <span className={`error-text `}>{errors.region}</span>}
                            </div>
                            <div className={`input-row ${errors.district ? "err-border" : ""} `}>
                                <select
                                    id="districtSelect"
                                    value={selectedDistrict}
                                    onChange={handleDistrictChange}
                                >
                                    <option value="" disabled >
                                        Tuman tanlang
                                    </option>
                                    {districts.map((district) => (
                                        <option key={district.id} value={district.name_uz} >
                                            {district.name_uz.replace(/�/g, "'")}
                                        </option>
                                    ))}
                                </select>
                                {errors.district && <span className={`error-text`}>{errors.district}</span>}
                            </div> */}
                            <div className={`input-row ${errors.password ? "err-border" : ""} `}>
                                <input
                                    type="password"
                                    placeholder="Parol kiriting"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                                {errors.password && <span className={`error-text `}>{errors.password}</span>}
                            </div>
                            <div className={`input-row ${errors.confirmPassword ? "err-border" : ""} `}>
                                <input
                                    type="password"
                                    placeholder="Parolni takrorlang"
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
                                            Allaqachon akkauntingiz bormi? <span>Kirish</span>
                                        </>
                                        : <>
                                            Akkountingiz yo'qmi? <span>Ro'yxatdan o'tish</span>
                                        </>}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="n" disabled={loading}>
                            {loading ? "Ro'yxatdan o'tilmoqda..." : "Ro'yxatdan o'tish"}
                        </button>
                    </form>
                    {/* )} */}
                </div>
            </section>
        </>
    );
};

export default Signup;