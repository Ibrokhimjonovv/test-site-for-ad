'use client'
import React, { useContext, useEffect, useState } from "react";
import "./layout.scss";
import click from "@/assets/click.jpg";
import payme from "@/assets/payme.jpg";
import { AccessContext } from "@/contexts/contexts";
import NotFound from "../not-found";

const BalanceTopUp = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("payme");
  const [error, setError] = useState(null);
  const [regions, setRegions] = useState();
  const [shaxLoading, setShaxloading] = useState(false);
  const { profileData } = useContext(AccessContext);

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
            (e) => Number(e.id) === Number(profileData?.province)
          );
          setRegions(fdata);
        } else {
          console.error("Viloyatlar ma'lumotini olishda xatolik yuz berdi.");
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setShaxloading(false);
      }
    };

    fetchRegions();
  }, [profileData?.province]);

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
      const userId = profileData.id;
      const orderRes = await fetch(`https://test.smartcoders.uz/api/get_order_id/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });
      const orderData = await orderRes.json();
      const orderId = orderData.order_id;
      console.log(
        parseInt(amount),
        paymentMethod,
        orderId,
        profileData.name,
        regions[0].name_uz
      );

      const orderCreateRes = await fetch(
        `https://test.smartcoders.uz/api/order/create/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: profileData.name,
            address: regions[0]?.name_uz || "",
            total_cost: parseInt(amount),
            payment_method: paymentMethod,
            customer: userId,
            order_id: orderId,

          }),
        }
      );
      const orderCreateData = await orderCreateRes.json();
      if (orderCreateData.payment_link) {
        window.location.href = orderCreateData.payment_link;
        // window.open(orderCreateData.payment_link, "_blank");
      } else {
        setError("To'lov linkini olishda xatolik yuz berdi!");
      }
    } catch (error) {
      setError("Xatolik yuz berdi, qayta urinib ko'ring!");
    } finally {
      setShaxloading(false);
    }
  };

  if (!profileData) {
    return <NotFound />
  }


  return (
    <div>
      <div className={`up-form`}>
        <h2><span>Hisobni</span> to'ldirish</h2>
        <div className={`modal-content`}>
          {/* <h3>
            To'lov usulini tanlang: <span>{paymentMethod === "payme" ? "Payme" : "Click"}</span> orqali
          </h3> */}
          <div className={`payment-method`}>
            <button
              onClick={() => setPaymentMethod("payme")}
              className={`${paymentMethod === "payme" ? "active" : ""}`}
              style={{ backgroundImage: `url(${payme.src})` }}
              aria-label="Payme"
            ></button>
            <button
              onClick={() => setPaymentMethod("click")}
              className={`${paymentMethod === "click" ? "active" : ""}`}
              style={{ backgroundImage: `url(${click.src})` }}
              aria-label="Click"
            ></button>
          </div>
          <div className={`top-up-modal`}>

            {
              paymentMethod === 'click' ? (
                <div>Ayni paytda <span style={{ color: "#ff8a00" }}>click</span> orqali to‘lovni amalga oshirish imkoni mavjud emas. Noqulaylik uchun uzr so‘raymiz.</div>
              ) : (
                <>
                  <p>
                    <span className="st">{profileData.surname} {profileData.name}</span> ning balansini oshirish!
                  </p>
                  <p>Hozirgi balans: <span className="s">{profileData.balance}</span> so'm</p>
                  <div id="inp-w-s">
                    <input
                      type="text"
                      placeholder="Summani kiriting (so'm)"
                      name="total_cost"
                      value={formatAmount(amount)}
                      onChange={handleChange}
                      required
                    />
                    <span>UZS</span>
                  </div>
                  {error && (
                    <p style={{
                      fontSize: "15px",
                      color: "red",
                      margin: "3px 0 0 0",
                      textAlign: "left",
                    }}>
                      {error}
                    </p>
                  )}
                  <div className={`modal-btn`}>
                    <button
                      onClick={handlePayment}
                      disabled={shaxLoading}
                      className={`${shaxLoading ? "ac" : ""}`}
                    >
                      {shaxLoading ? "To'lov qilinmoqda..." : "To'lov qilish"}
                    </button>
                  </div>
                </>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceTopUp;
