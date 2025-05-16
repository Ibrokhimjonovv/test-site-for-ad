// components/HeaderSwitcher.js
"use client";

import AdminHeader from "@/app/adminPanel/admin-header/admin-header";
import { usePathname } from "next/navigation";
import Header from "../publicHeader/header";
export default function HeaderSwitcher() {
    const pathname = usePathname();

    if (pathname?.startsWith('/adminPanel')) {
        return <AdminHeader />;
    }

    return <Header />;
}