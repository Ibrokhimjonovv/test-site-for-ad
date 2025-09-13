// YandexAd.jsx
import React, { useEffect, useRef } from "react";

export default function YandexAd({ blockId = "R-A-17225177-1", className = "" }) {
  const idRef = useRef(`yandex_rtb_${Math.random().toString(36).slice(2, 9)}`);

  useEffect(() => {
    // agar window mavjud bo'lmasa (SSR), hech nima qilmang
    if (typeof window === "undefined") return;

    // yaContextCb callback queue mavjud bo'lishi kerak — agar yo'q bo'lsa yaratamiz
    window.yaContextCb = window.yaContextCb || [];

    // Push qilamiz — Yandex script yuklanganda bu funksiya chaqiriladi
    window.yaContextCb.push(() => {
      try {
        if (window.Ya && Ya.Context && Ya.Context.AdvManager) {
          Ya.Context.AdvManager.render({
            blockId: blockId,
            renderTo: idRef.current,
          });
        } else {
          // agar Ya mavjud bo'lmasa — hech nima qilmaslik kerak
          // (script hali yuklanmagan bo'lishi mumkin)
        }
      } catch (e) {
        // xatolikni console ga chiqarish (xohlasangiz olib tashlang)
        console.error("Yandex RTB render error:", e);
      }
    });

    // tozalash: komponent unmount bo'lganda container ichini tozalaymiz
    return () => {
      const el = document.getElementById(idRef.current);
      if (el) el.innerHTML = "";
    };
  }, [blockId]);

  return <div id={idRef.current} className={className} />;
}
