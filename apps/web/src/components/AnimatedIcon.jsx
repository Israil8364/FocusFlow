import React, { useRef } from 'react';
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

const AnimatedIcon = ({ icon: Icon, size = 20, className = "", color = "currentColor", strokeWidth = 2, animation = "bounce" }) => {
  const iconRef = useRef(null);

  const { contextSafe } = useGSAP({ scope: iconRef });

  const handleMouseEnter = contextSafe(() => {
    if (animation === "bounce") {
      gsap.to(iconRef.current, {
        y: -4,
        duration: 0.3,
        ease: "power2.out",
        yoyo: true,
        repeat: 1
      });
    } else if (animation === "rotate") {
      gsap.to(iconRef.current, {
        rotate: 15,
        duration: 0.2,
        ease: "power1.inOut",
        yoyo: true,
        repeat: 3
      });
    } else if (animation === "scale") {
      gsap.to(iconRef.current, {
        scale: 1.2,
        duration: 0.3,
        ease: "back.out(1.7)"
      });
    }
  });

  const handleMouseLeave = contextSafe(() => {
    gsap.to(iconRef.current, {
      y: 0,
      rotate: 0,
      scale: 1,
      duration: 0.3,
      ease: "power2.in"
    });
  });

  return (
    <div 
      ref={iconRef} 
      className={`inline-flex items-center justify-center ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Icon size={size} color={color} strokeWidth={strokeWidth} />
    </div>
  );
};

export default AnimatedIcon;
