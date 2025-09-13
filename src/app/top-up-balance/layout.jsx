'use client'
import React, { useContext, useEffect, useState } from "react";
import "./layout.scss";
import click from "@/assets/click.jpg";
import payme from "@/assets/payme.jpg";
import { AccessContext } from "@/contexts/contexts";
import NotFound from "../not-found";
import { api } from "@/config";

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
          console.error("Error occurred while fetching regions data.");
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
      setError("Please enter a valid amount!");
      return;
    } else if (amount < 1000) {
      setError("Minimum amount is 1000 UZS!");
      return;
    }
    setShaxloading(true);

    try {
      const userId = profileData.id;

      const orderCreateRes = await fetch(
        `${api}/order/create/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customer_name: profileData.first_name,
            address: regions[0]?.name_uz || "",
            total_cost: parseInt(amount),
            payment_method: paymentMethod,
            customer: userId,
            order_id: profileData.order_id,
          }),
        }
      );
      const orderCreateData = await orderCreateRes.json();
      if (orderCreateData.payment_link) {
        window.location.href = orderCreateData.payment_link;
      } else {
        setError("Error occurred while generating payment link!");
      }
    } catch (error) {
      setError("An error occurred, please try again!");
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
        <h2><span>Top up</span> balance</h2>
        <div className={`modal-content`}>
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
                <div>At the moment, payment via <span style={{ color: "#ff8a00" }}>Click</span> is not available. We apologize for the inconvenience.</div>
              ) : (
                <>
                  <p>
                    Increase balance of <span className="st">{profileData.surname} {profileData.name}</span>!
                  </p>
                  <p>Current balance: <span className="s">{profileData.balance}</span> UZS</p>
                  <div id="inp-w-s">
                    <input
                      type="text"
                      placeholder="Enter amount (UZS)"
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
                      {shaxLoading ? "Processing payment..." : "Make Payment"}
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
