import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  visible:{ opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

export default function LandingHero() {
  return (
    <motion.section
      className="hero"
      variants={container}
      initial="hidden"
      animate="visible"
    >
      <div className="hero-card">
        <motion.div className="hero-content" variants={item}>
          <h1>MicMates</h1>
          <p className="subtitle">MICS MATED, MOMENTS CREATED</p>
          <div className="cta-buttons">
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-outline">
              Log In
            </Link>
          </div>
        </motion.div>
        <motion.div className="hero-image" variants={item}>
          <img
            src="/landing-illustration.svg"
            alt="Two podcasters chatting"
          />
        </motion.div>
      </div>
    </motion.section>
  );
}
