'use client'
import React, { useContext } from "react";
import "./admin-header.scss";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Logout from "@/components/logout/logout";
import { AccessContext } from "@/contexts/contexts";
import NotFound from "@/app/not-found";
import Header from "@/components/publicHeader/header";
// import logo from "../../../components/header/Logo.png";
// import { NavLink, useNavigate } from "react-router-dom";
// import { AccessContext } from "../../../AccessContext";

const AdminHeader = () => {
  // const { logout } = useContext(AccessContext);
  // const navigate = useRouter();
  // const handleLogout = () => {
  //   logout();
  //   navigate("/");
  // };
  const pathName = usePathname();
  const { profileData } = useContext(AccessContext);

  if(!profileData || !profileData.is_superuser) {
    return <Header />
  }

  return (
    <>
      {/* <marquee behavior="" direction="">
        Platforma sinov tariqasia ishga tushurilgan!
      </marquee> */}
      <div id="admin-header">
        <div className="admin-header-inner">
          <div className="logo">
            <div className="logo">
              <Link href="/">TestIshla<span>.</span></Link>
            </div>
          </div>
          <div className="menus">
            <Link
              className={pathName === "adminPanel/sciences" ? "act" : ""}
              href="/adminPanel/admin-sciences"
            >
              Fanlar
            </Link>
            <Link
              className={pathName === "adminPanel/departments" ? "act" : ""}
              href="/adminPanel/admin-departments"
            >
              Bo'limlar
            </Link>
            {/* <NavLink
              className={({ isActive }) =>
                isActive ? "active-admin-link" : ""
              }
              to="/admin/tests"
            >
              Testlar
            </NavLink> */}
            <Link
              className={pathName === "adminPanel/admin-create-test" ? "act" : ""}
              href="/adminPanel/admin-create-test"
            >
              Testlar yaratish
            </Link>
            {/* <NavLink
              className={({ isActive }) =>
                isActive ? "active-admin-link" : ""
              }
              to="/admin/statics"
            >
              Statistikalar
            </NavLink> */}
            <Link
              className={pathName === "adminPanel/add-word" ? "act" : ""}
              href="/adminPanel/add-word"
            >
              Word qo'shish
            </Link>
            {/* <NavLink
              className={({ isActive }) =>
                isActive ? "active-admin-link" : ""
              }
              to="/admin/schools"
            >
              Maktablar qo'shish
            </NavLink> */}
          </div>
          <div className="admin-name">
            <Logout />
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminHeader;
