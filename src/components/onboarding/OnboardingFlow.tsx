// src/components/onboarding/OnboardingFlow.tsx
import React, { useState } from "react";
import OnboardingScreen1 from "./OnboardingScreen1";
// import OnboardingScreen2 from "./OnboardingScreen2";
import OnboardingScreen3 from "./OnboardingScreen3";
import OnboardingScreen4 from "./OnboardingScreen4";
import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";

type Props = {
  onFinish: () => void;
};

export const OnboardingFlow: React.FC<Props> = ({ onFinish }) => {
  const [step, setStep] = useState(0);

  const screens = [
    <OnboardingScreen1 key="1" />,
    // <OnboardingScreen2 key="2" />,
    <OnboardingScreen3 key="3" />,
    <OnboardingScreen4 key="4" />,
  ];

  const stepLabels = ["Choose Theme", "Gallery", "Shortcuts", "API Key"];

  return (
    <div className="relative">
      {screens[step]}

      {/* Step Indicator */}
      <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/20">
          {stepLabels.map((label, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === step
                    ? "bg-white"
                    : index < step
                      ? "bg-white/70"
                      : "bg-white/30"
                }`}
              />
              {index === step && (
                <span className="text-white text-sm font-medium">{label}</span>
              )}
              {index < stepLabels.length - 1 && index !== step && (
                <div className="w-4 h-px bg-white/20" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 sm:gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20">
          {/* Back Button */}
          <button
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className={`px-4 sm:px-6 py-2 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base ${
              step === 0
                ? "bg-white/10 text-white/50 cursor-not-allowed"
                : "bg-white/20 hover:bg-white/30 text-white"
            }`}
          >
            <ArrowLeftIcon />
          </button>

          {/* Step Counter */}
          <div className="text-white/70 text-sm px-2">
            {step + 1} of {screens.length}
          </div>

          {/* Next/Finish Button */}
          {step < screens.length - 1 ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              className="px-4 sm:px-6 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
            >
              <ArrowRightIcon />
            </button>
          ) : (
            <button
              onClick={onFinish}
              className="px-4 sm:px-6 py-2 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base"
            >
              Get Started
            </button>
          )}
        </div>
      </div>

      {/* Skip Option (optional) */}
      <button
        onClick={onFinish}
        className="fixed top-6 right-6 text-white/70 hover:text-white transition-colors duration-200 text-sm font-medium z-50"
      >
        Skip
      </button>
    </div>
  );
};
