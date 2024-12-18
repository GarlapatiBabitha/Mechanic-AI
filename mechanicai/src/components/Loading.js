

import React, { useEffect, useState, useRef } from "react";
import "./Loading.css";

const Loading = () => {
  const rotateAnim = useRef(null);

  useEffect(() => {
    if (rotateAnim.current) {
      rotateAnim.current.style.animation = "spin 1.5s linear infinite";
    }
  }, []);

  return React.createElement(
    "div",
    { className: "loading-container" },
    React.createElement("div", { ref: rotateAnim, className: "loader-circle" }),
    React.createElement("div", { className: "spinner" }),
    React.createElement(
      "p",
      { className: "loading-text" },
      "Authenticating, please wait..."
    )
  );
};

export default Loading;
