"use client"

import React, { useContext, useEffect, useState } from "react";
import "./layout.scss";
import { useRouter } from "next/navigation";
import { AccessContext } from "@/contexts/contexts";
import { useMask } from '@react-input/mask';

const regionsURL =
    "https://raw.githubusercontent.com/MIMAXUZ/uzbekistan-regions-data/master/JSON/regions.json";
const districtsURL =
    "https://raw.githubusercontent.com/MIMAXUZ/uzbekistan-regions-data/master/JSON/districts.json";

const Layout = () => {
    const { access } = useContext(AccessContext);
    const navigate = useRouter();
    const [regions, setRegions] = useState([]);
    const [selectedRegion, setSelectedRegion] = useState("");
    const [districts, setDistricts] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [profileData, setProfileData] = useState({});
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        name: "",
        username: "",
        phone_number: "",
        surname: "",
        email: "",
        password: "",
        age: "",
    });
    const [success, setSuccess] = useState(false);
    const [token, setToken] = useState("");

    useEffect(() => {
        const access = localStorage.getItem("accessEdu");
        if (access) {
            setToken(access);
        }
    }, []);

    useEffect(() => {
        const fetchRegions = async () => {
            try {
                const response = await fetch(regionsURL);
                if (!response.ok)
                    throw new Error("Error fetching regions data");
                const data = await response.json();
                setRegions(data);
            } catch (error) {
                console.error("Error:", error);
            }
        };
        fetchRegions();
    }, []);

    useEffect(() => {
        const userProfile = async () => {
            try {
                const response = await fetch(`https://test.smartcoders.uz/api/user-profile/`, {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });
                if (!response.ok)
                    throw new Error("Error fetching user data");
                const data = await response.json();
                setFormData({
                    name: data.name || "",
                    username: data.username || "",
                    phone_number: data.phone_number || "",
                    surname: data.surname || "",
                    email: data.email || "",
                    password: "",
                    age: data.age || "",
                    gender: data.gender || "",
                });
                setSelectedRegion(data.province || "");
                setSelectedDistrict(data.district || "");
                if (data.province) {
                    fetchDistricts(data.province);
                }
            } catch (error) {
                console.error("Failed to fetch profile data:", error.message);
            }
        };
        userProfile();
    }, []);

    const fetchDistricts = async (regionId) => {
        try {
            const response = await fetch(districtsURL);
            if (!response.ok)
                throw new Error("Error fetching districts data");
            const data = await response.json();
            const regionDistricts = data.filter(
                (district) => district.region_id === Number(regionId)
            );
            setDistricts(regionDistricts);
        } catch (error) {
            console.error("Error:", error);
        }
    };

    const handleRegionChange = (event) => {
        const selectedRegionId = event.target.value;
        setSelectedRegion(selectedRegionId);
        fetchDistricts(selectedRegionId);
        setSelectedDistrict("");
    };

    const handleDistrictChange = (event) => {
        setSelectedDistrict(event.target.value);
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateDate = (date) => {
        const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
        const match = date.match(regex);
        if (!match) return "Tug'ilgan sana (DD.MM.YYYY)";
        let [_, day, month, year] = match;
        day = parseInt(day, 10);
        month = parseInt(month, 10);
        year = parseInt(year, 10);
        const currentYear = new Date().getFullYear();
        if (day < 1 || day > 31) return "Kun faqat 01-31 oralig'ida bo'lishi kerak!";
        if (month < 1 || month > 12) return "Oy faqat 01-12 oralig'ida bo'lishi kerak!";
        if (year < 1900 || year > currentYear) return (currentYear) => `Yil 1900 va ${currentYear} oralig'ida bo'lishi kerak!`;
        return "";
    };

    const validateForm = () => {
        let errors = {};
        if (!formData.name.trim()) errors.name = "Ism maydonini to'ldirish shart!";
        if (!formData.surname.trim()) errors.surname = "Familiya maydonini to'ldirish shart!";
        if (!formData.username.trim()) errors.username = "Foydalanuvchi nomi maydonini to'ldirish shart!";
        if (!formData.phone_number.trim() || formData.phone_number.includes("_"))
            errors.phone_number = "Telefon raqami";
        if (!formData.age.trim() || formData.age.includes("_")) {
            errors.age = "Tug'ilgan sana (DD.MM.YYYY) maydonini to'ldirish shart!";
        } else {
            let ageError = validateDate(formData.age);
            if (ageError) errors.age = ageError;
        }
        if (!selectedRegion) errors.region = "Viloyat maydonini to'ldirish shart!";
        if (!selectedDistrict) errors.district = "Tuman maydonini to'ldirish shart!";
        if (formData.password && formData.password.length < 6)
            errors.password = "Parol kamida 6 ta belgi bo'lishi kerak!";
        setErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;
        if (!token) {
            navigate.push("/login");
            return;
        }
        try {
            let updatedData = {
                ...formData,
                province: selectedRegion,
                district: selectedDistrict,
            };
            if (!updatedData.password) {
                delete updatedData.password;
            }
            const response = await fetch(`https://test.smartcoders.uz/api/user-update/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updatedData),
            });

            if (response.ok) {
                const data = await response.json();
                setProfileData(data);
                setSuccess(true);
                navigate.push("/profile")
                setTimeout(() => {
                    setSuccess(false);
                }, 5000);
            } else {
                const errorData = await response.json();
                console.error("Error:", errorData);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    };


    const inputRef = useMask({
        mask: '+998 (__) ___-__-__',
        replacement: { _: /\d/ },
        showMask: true,
        separate: true,
    });

    const inputRefAge = useMask({
        mask: 'MM.DD.YYYY',
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

    return (
        <section id="profile-section" >
            {profileData !== null ? (
                <div className={`profile-container`}>
                    {/* {success && <Success text={t.successMessage} />} */}
                    <h1 id="edit-profile-heading">Profilni taxrirlash</h1>
                    <div className={`edit-profile-content`}>
                        <div className={`left`}>
                            <div className={`edit-profile-container`}>
                                <form onSubmit={handleSubmit} >
                                    <div className={`edit-content`}>
                                        <div className={`input-row ${errors.name ? "err-border" : ""}`}>
                                            <input
                                                type="text"
                                                placeholder="Ism"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                            {errors.name && (
                                                <span className={`error`}>{errors.name}</span>
                                            )}
                                        </div>
                                        <div className={`input-row ${errors.surname ? "err-border" : ""}`}>
                                            <input
                                                type="text"
                                                placeholder="Familiya"
                                                name="surname"
                                                value={formData.surname}
                                                onChange={handleChange}
                                            />
                                            {errors.surname && (
                                                <span className={`error`}>{errors.surname}</span>
                                            )}
                                        </div>
                                        <div className={`input-row ${errors.username ? "err-border" : ""}`}>
                                            <input
                                                type="text"
                                                placeholder="Foydalanuvchi nomi"
                                                name="username"
                                                value={formData.username}
                                                onChange={handleChange}

                                            />
                                            {errors.username && (
                                                <span className={`error`}>{errors.username}</span>
                                            )}
                                        </div>
                                        <div className={`input-row ${errors.phone_number ? "err-border" : ""}`}>
                                            <input
                                                ref={inputRef}
                                                type="tel"
                                                value={formData.phone_number}
                                                onChange={handlePhoneChange}
                                                onFocus={handleFocus}
                                                className="phone-input"
                                                placeholder='+998 (__) ___-__-__'
                                            />
                                            {errors.phone_number && (
                                                <span className={`error`}>{errors.phone_number}</span>
                                            )}
                                        </div>
                                        <div className={`input-row ${errors.age ? "err-border" : ""}`}>
                                            <input
                                                type="text"
                                                placeholder="DD.MM.YYYY"
                                                name="age"
                                                value={formData.age}
                                                onChange={handleChange}
                                                maxLength={10}
                                            />
                                            {errors.age && (
                                                <span className={`error`}>{errors.age}</span>
                                            )}
                                        </div>
                                        <div className={`input-row ${errors.email ? "err-border" : ""}`}>
                                            <input
                                                type="email"
                                                placeholder="Email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}

                                            />
                                            {errors.email && (
                                                <span className={`error`}>{errors.email}</span>
                                            )}
                                        </div>
                                        <div className={`input-row ${errors.password ? "err-border" : ""}`}>
                                            <input
                                                type="password"
                                                placeholder="Parol kiriting"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}

                                            />
                                            {errors.password && (
                                                <span className={`error`}>{errors.password}</span>
                                            )}
                                        </div>
                                        <div className={`input-row`}>
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
                                        <div className={`input-row ${errors.region ? "err-border" : ""}`}>
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
                                            {errors.region && (
                                                <span className={`error`}>{errors.region}</span>
                                            )}
                                        </div>
                                        <div className={`input-row ${errors.district ? "err-border" : ""}`}>
                                            <select
                                                id="districtSelect"
                                                value={selectedDistrict}
                                                onChange={handleDistrictChange}
                                            >
                                                <option value="" disabled>
                                                    Tuman tanlang
                                                </option>
                                                {districts.map((district) => (
                                                    <option key={district.id} value={district.name_uz} >
                                                        {district.name_uz.replace(/�/g, "'")}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.district && (
                                                <span className={`error`}>{errors.district}</span>
                                            )}
                                        </div>
                                    </div>
                                    <button type="submit">Saqlash</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <h1>Ba shou na xoii</h1>
            )}
        </section>
    );
};

export default Layout;