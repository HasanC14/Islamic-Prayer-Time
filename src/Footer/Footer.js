import React from "react";
import { FaGithub, FaFacebook, FaLinkedinIn } from "react-icons/fa";
const Footer = () => {
  return (
    <div className="footer">
      <a
        href="https://github.com/HasanC14/Islamic-Prayer-Time"
        target="_blank"
        rel="noreferrer"
      >
        <FaGithub></FaGithub>
      </a>
      <a
        href="https://www.facebook.com/hasan.chowdhuryD/"
        target="_blank"
        rel="noreferrer"
      >
        <FaFacebook></FaFacebook>
      </a>
      <a
        href="https://www.linkedin.com/in/hasanchowdhuryd/"
        target="_blank"
        rel="noreferrer"
      >
        <FaLinkedinIn></FaLinkedinIn>
      </a>
    </div>
  );
};

export default Footer;
