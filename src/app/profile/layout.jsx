'use client'
import React, { useContext, useEffect, useState } from "react";
import "./layout.scss";
import Logout from "@/components/logout/logout";
import { useRouter } from "next/navigation";
import { AccessContext } from "@/contexts/contexts";
import defaultImage from "@/assets/user.png";
import Link from "next/link";
import Rating from "@/components/rating/layout";
import StaticLayout from "@/components/profileStatistics/layout";
import arrow_image from "@/assets/arrow-image.png";
import ComplatedTests from "@/components/complated-tests/layout";
import Loading from "@/components/loading/layout";
import NotFound from "../not-found";


const Profile = () => {
  const {
    profileData,
    profileLoading,
    allUsers, setProfileData, setProfileLoading
  } = useContext(AccessContext);
  const [mod, setMod] = useState(false);
  const nav = useRouter()
  const [userRank, setUserRank] = useState(null);
  useEffect(() => {
    fetch(`http://37.27.23.255:8899/api/user_rank/${profileData?.id}/`)
      .then(response => response.json())
      .then(data => {
        setUserRank(data);
      })
      .catch(error => {
        console.log("");
      });
  }, [profileData?.id]);
  if (profileLoading) {
    return <Loading />;
  }
  if (!profileData) {
    return <NotFound />
  }
  const handleLogout = () => {
    localStorage.removeItem("accessEdu");
    localStorage.removeItem("refreshEdu");


    setProfileData(null);
    setProfileLoading(false);
    nav.push('/')
  };
  return (
    <section id="profile-section" >
      <div className={`profile-container `}>
        <div className={`profile-header`}>
          <div className={`profile-header-inner`}>
            <Link href="/" >Bosh sahifa</Link> / Shaxsiy kabinet
          </div>
        </div>
        <div className={`profile-content`}>
          <div className={`left`}>
            <Rating
              userId={userRank}
              user={profileData}
              allUsers={allUsers}
              balance={profileData.balance}
            />
            <div className={`left-inner-1 mob-ver`}>
              <StaticLayout />
            </div>
            <div className={`start-now mob-ver`}>
              <div className={`now-left`}>
                Darajani oshirish
                <img src={arrow_image.src} alt="" />
              </div>
              <Link href="#" >Boshlash</Link>
            </div>
            <ComplatedTests id={profileData.id} />
          </div>
          <div className={`right`}>
            <div className={`user-profile`}>
              <div>
                <div className={`inner`}>
                  {profileData.image ? (
                    <img
                      id="user-img"
                      src={profileData.image.src}
                      alt="Rasm yetib kelmadi"
                    />
                  ) : (
                    <img
                      id="user-img"
                      src={defaultImage.src}
                      alt="Rasm yetib kelmadi"
                    />
                  )}
                  <div className={`texts`}>
                    <h1 className={`first-last-name`}>
                      {profileData.name || "Yuklanmoqda..."} {profileData.surname}
                    </h1>
                    <p className={`phone`}>{profileData.phone_number || "Yuklanmoqda..."}</p>
                    <p className={`username`}>{profileData.username}</p>
                  </div>
                </div>
                <div className={`percent`}>
                  <div className={`count`}>{userRank?.percent || 0}%</div>
                  <div className={`line`}>
                    <div
                      className={`line-inner`}
                      style={{ width: `${userRank?.percent || 0}%` }}
                    ></div>
                  </div>
                </div>
                <div className={`logout-edit`}>
                  <Link href="/edit-profile" >Profilni taxrirlash</Link>
                  <button
                    id="logout"
                    onClick={() => { setMod(true); }}
                  >
                    Chiqish
                  </button>
                  {mod && <div className={`m-shape`}></div>}
                  {
                    mod && (
                      <div className={`opened-modal ${mod ? "active" : ""}`}>
                        <p >Haqiqatdan ham chiqmoqchimisiz?</p>
                        <div >
                          <button
                            type="button"
                            onClick={() => { setMod(false); }}
                          >
                            Bekor qilish
                          </button>
                          <button type="button" onClick={handleLogout}>
                            Chiqish
                          </button>
                        </div>
                      </div>
                    )
                  }
                </div>
              </div>
            </div>
            <div className={`start-now`}>
              <div className={`now-left`}>
                Darajani oshirish
                <img src={arrow_image.src} alt="" />
              </div>
              <Link href="#">Boshlash</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;