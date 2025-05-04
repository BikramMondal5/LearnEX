"use client"

import React from 'react';
import styled from 'styled-components';

interface CubeLoaderProps {
  className?: string;
  size?: "sm" | "default" | "lg";
  color?: "blue" | "purple" | "cyan";
}

const Loader: React.FC<CubeLoaderProps> = ({ 
  className = "", 
  size = "default", 
  color = "cyan" 
}) => {
  // Size mapping
  const getSize = () => {
    switch(size) {
      case "sm": return "32px";
      case "lg": return "64px";
      default: return "44px";
    }
  };

  const sizeValue = getSize();

  return (
    <StyledWrapper 
      className={className} 
      $size={sizeValue} 
      $color={color}
    >
      <div className="spinner">
        <div />
        <div />
        <div />
        <div />
        <div />
        <div />
      </div>
    </StyledWrapper>
  );
};

interface StyledWrapperProps {
  $size: string;
  $color: string;
}

const StyledWrapper = styled.div<StyledWrapperProps>`
  display: flex;
  align-items: center;
  justify-content: center;

  .spinner {
   width: ${props => props.$size};
   height: ${props => props.$size};
   animation: spinner-y0fdc1 2s infinite ease;
   transform-style: preserve-3d;
   position: relative;
  }

  .spinner > div {
   background-color: rgba(20, 20, 20, 0.2);
   height: 100%;
   position: absolute;
   width: 100%;
   border: 2px solid transparent;
   border-image: ${props => {
     if (props.$color === "purple") return "linear-gradient(to right, #a855f7, #f0f) 1";
     if (props.$color === "blue") return "linear-gradient(to right, #3b82f6, #06b6d4) 1";
     return "linear-gradient(to right, #0ff, #f0f) 1"; // default cyan
   }};
   box-shadow: ${props => {
     if (props.$color === "purple") return "0 0 10px rgba(168, 85, 247, 0.3)";
     if (props.$color === "blue") return "0 0 10px rgba(59, 130, 246, 0.3)";
     return "0 0 10px rgba(0, 255, 255, 0.3)"; // default cyan
   }};
  }

  .spinner div:nth-of-type(1) {
   transform: translateZ(-22px) rotateY(180deg);
  }

  .spinner div:nth-of-type(2) {
   transform: rotateY(-270deg) translateX(50%);
   transform-origin: top right;
  }

  .spinner div:nth-of-type(3) {
   transform: rotateY(270deg) translateX(-50%);
   transform-origin: center left;
  }

  .spinner div:nth-of-type(4) {
   transform: rotateX(90deg) translateY(-50%);
   transform-origin: top center;
  }

  .spinner div:nth-of-type(5) {
   transform: rotateX(-90deg) translateY(50%);
   transform-origin: bottom center;
  }

  .spinner div:nth-of-type(6) {
   transform: translateZ(22px);
  }

  @keyframes spinner-y0fdc1 {
   0% {
    transform: rotate(45deg) rotateX(-25deg) rotateY(25deg);
   }

   50% {
    transform: rotate(45deg) rotateX(-385deg) rotateY(25deg);
   }

   100% {
    transform: rotate(45deg) rotateX(-385deg) rotateY(385deg);
   }
  }
`;

export default Loader;
