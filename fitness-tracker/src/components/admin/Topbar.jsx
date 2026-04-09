import React from "react";

const Topbar = () => {
  return (
    <header className="topbar">
      <h1>Admin Panel</h1>
      <button onClick={() => {
        localStorage.removeItem("adminToken");
        window.location.href = "/";
      }}>
        Logout
      </button>
    </header>
  );
};

export default Topbar;
