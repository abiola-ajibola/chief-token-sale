import React from "react";
import { Link } from "react-router-dom";

export default function NavBar({ isMinter }) {
  return (
    <nav>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        {isMinter ? (
          <li>
            <Link to="/admin">Admin</Link>{" "}
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
