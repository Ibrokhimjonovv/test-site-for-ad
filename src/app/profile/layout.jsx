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
import { api } from "@/config";


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
    fetch(`${api}/api/user_rank/${profileData?.id}/`)
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
            <Link href="/" >Home</Link> / Personal Cabinet
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
                Increase Level
                <img src={arrow_image.src} alt="" />
              </div>
              <Link href="/tests/all">Start</Link>
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
                      alt="Image not loaded"
                    />
                  ) : (
                    <img
                      id="user-img"
                      src={defaultImage.src}
                      alt="Image not loaded"
                    />
                  )}
                  <div className={`texts`}>
                    <h1 className={`first-last-name`}>
                      {profileData.first_name || "Loading..."} {profileData.surname}
                    </h1>
                    <p className={`phone`}>{profileData.phone_number || "Loading..."}</p>
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
                  <Link href="/edit-profile" >Edit Profile</Link>
                  <button
                    id="logout"
                    onClick={() => { setMod(true); }}
                  >
                    Logout
                  </button>
                  {mod && <div className={`m-shape`}></div>}
                  {
                    mod && (
                      <div className={`opened-modal ${mod ? "active" : ""}`}>
                        <p >Are you sure you want to logout?</p>
                        <div >
                          <button
                            type="button"
                            onClick={() => { setMod(false); }}
                          >
                            Cancel
                          </button>
                          <button type="button" onClick={handleLogout}>
                            Logout
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
                Increase Level
                <img src={arrow_image.src} alt="" />
              </div>
              <Link href="#">Start</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
