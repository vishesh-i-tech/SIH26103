import React from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { tokens } from "../styles/tokens";

export function Layout() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        background: tokens.paper,
        position: "relative",
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
  );
}

export default Layout;
