import React from "react";
import { motion } from "framer-motion";
const Mask = () => (
  <motion.svg
    xmlns="http://www.w3.org/2000/svg"
    width="248"
    height="84"
    viewBox="0 0 248 84"
    fill="none"
    className="absolute z-[-1]"

  >
    <mask
      id="mask0_302_75"
      style={{ maskType: "alpha" }}
      maskUnits="userSpaceOnUse"
      x="0"
      y="0"
      width="248"
      height="84"
    >
      <motion.rect
        x="1.5"
        y="1.5"
        width="245"
        height="81"
        rx="26.5"
        fill="#E0E0E0"
        fillOpacity="0.1"
        stroke="#CB80FF"
        strokeWidth="3"
      />
    </mask>
    <g mask="url(#mask0_302_75)">
      <motion.rect
        x="308"
        y="-17"
        width="12.3673"
        height="118.861"
        transform="rotate(36.9706 308 -17)"
        fill="url(#paint0_linear_302_75)"
        fillOpacity="0.53"
      />
    </g>
    <defs>
      <linearGradient
        id="paint0_linear_302_75"
        x1="315.296"
        y1="-32.4628"
        x2="269.724"
        y2="-9.29171"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="white" />
        <stop offset="1" stopColor="white" stopOpacity="0.05" />
      </linearGradient>
    </defs>
  </motion.svg>
);

export default Mask;
