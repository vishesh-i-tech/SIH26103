import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { tokens } from "../styles/tokens";

export function Layout() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: tokens.paper,
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          background: tokens.paper,
        }}
      >
        <Header />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;
