'use client'

import React, { useEffect, useState } from "react";
import "./layout.scss";
import click from "./click.jpg";
import payme from "./payme.jpg";

const BalanceTopUp = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("payme");
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState();
  const [shaxLoading, setShaxloading] = useState(false);
  const regionsURL =
    "https://raw.githubusercontent.com/MIMAXUZ/uzbekistan-regions-data/master/JSON/regions.json";

  const formatAmount = (value) => {
    return value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleChange = (e) => {
    setAmount(e.target.value.replace(/\D/g, ""));
  };

  useEffect(() => {
    const fetchRegions = async () => {
      setShaxloading(true);

      try {
        const response = await fetch(regionsURL);
        if (response.ok) {
          const data = await response.json();
          const fdata = data.filter(
            (e) => Number(e.id) === Number(user.province)
          );
          setRegions(fdata);
        } else {
          console.error("Error fetching regions data");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setShaxloading(false);
      }
    };

    fetchRegions();
  }, [user.province]);

  const handlePayment = async () => {
    if (!amount || isNaN(amount) || amount <= 0) {
      setError("Iltimos, to'g'ri summa kiriting!");
      return;
    } else if (amount < 1000) {
      setError("Minimal 1000 so'm kiriting!");
      return;
    }
    setShaxloading(true);

    try {
      const userId = user.id;
      const orderRes = await fetch(`http://37.27.23.255:8888/api/get_order_id/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const orderData = await orderRes.json();
      const orderId = orderData.order_id;

      const paymentAPI =
        paymentMethod === "payme"
          ? `http://37.27.23.255:8888/api/order/create/`
          : "http://37.27.23.255:8888/pyclick/process/click/transaction/create/";

      const requestBody =
        paymentMethod === "payme"
          ? {
              customer_name: user.name,
              address: regions[0].name_uz,
              total_cost: parseInt(amount),
              payment_method: paymentMethod,
              customer: userId,
              order_id: orderId,
            }
          : {
              click_trans_id: 1,
              service_id: 1,
              merchant_trans_id: 1,
              merchant_prepare_id: 1,
              amount: parseInt(amount),
              action: 1,
              error: 1,
              error_note: 1,
              sign_time: 1,
              sign_string: 1,
              click_pydoc_id: 1,
              user: userId,
            };

      const orderCreateRes = await fetch(paymentAPI, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const orderCreateData = await orderCreateRes.json();
      if (orderCreateData.payment_link) {
        window.location.href = orderCreateData.payment_link;
      } else {
        setError("To'lov linkini olishda xatolik yuz berdi!");
      }
    } catch (error) {
      setError("Xatolik yuz berdi, qayta urinib ko'ring!");
      console.error("Payment error:", error);
    } finally {
      setShaxloading(false);
    }
  };

  return (
    <div >
      <button onClick={() => setIsOpen(true)} >
        Balansni oshirish
      </button>
      <div className={`modal ${isOpen ? "active" : ""} `}>
        <div className={`modal-content `}>
          <h3 >
            To'lov usulini tanlang: <span>{paymentMethod === "payme" ? "Payme" : "Click"}</span> orqali
          </h3>
          <div className={`payment-method `}>
            <button
              onClick={() => setPaymentMethod("payme")}
              className={`${paymentMethod === "payme" ? "active" : ""} `}
              style={{ backgroundImage: `url(${payme.src})` }}
            ></button>
          </div>
          <div className={`top-up-modal `}>
            <div id="inp-w-s" >
              <input
                type="text"
                placeholder="Summani kiriting (so'm)"
                name="total_cost"
                value={formatAmount(amount)}
                onChange={handleChange}
                
              />
              <span>so'm</span>
            </div>
            <p
              style={{
                fontSize: "15px",
                color: "red",
                margin: 0,
                textAlign: "left",
              }}
              
            >
              {error}
            </p>
            <div className={`modal-btn `}>
              <button onClick={() => setIsOpen(false)} >
                Bekor qilish
              </button>
              <button onClick={handlePayment} disabled={shaxLoading} >
                {shaxLoading ? "To'lov qilinmoqda..." : "To'lov qilish"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceTopUp;