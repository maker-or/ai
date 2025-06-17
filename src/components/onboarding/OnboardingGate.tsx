// src/components/onboarding/OnboardingGate.tsx
import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { OnboardingFlow } from "./OnboardingFlow";

export const OnboardingGate: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const user = useQuery(api.auth.loggedInUser);
  const setOnboardingComplete = useMutation(api.users.setOnboardingComplete);
  const [localComplete, setLocalComplete] = useState(false);

  if (user === undefined) return null; // loading spinner

  if (user && !user.onboardingComplete && !localComplete) {
    // Wrap async in a void function to avoid eslint error
    const handleFinish = () => {
      void (async () => {
        await setOnboardingComplete({});
        setLocalComplete(true);
      })();
    };

    return <OnboardingFlow onFinish={handleFinish} />;
  }

  return <>{children}</>;
};
