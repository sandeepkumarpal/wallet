"use client";

import { useAuth } from "@/context/AuthContext";
import LandingNav from "./LandingNav";
import LandingHero from "./LandingHero";
import LandingClarity from "./LandingClarity";
import LandingPlan from "./LandingPlan";
import LandingSteps from "./LandingSteps";
import LandingApps from "./LandingApps";
import LandingFinale from "./LandingFinale";
import LandingFooter from "./LandingFooter";
import "./Landing.scss";

const LandingPage = () => {
  const { user, loading } = useAuth();
  const signedIn = !loading && Boolean(user);

  return (
    <div className="landing">
      <LandingNav signedIn={signedIn} />
      <LandingHero signedIn={signedIn} />
      <LandingClarity />
      <LandingPlan />
      <LandingSteps />
      <LandingApps />
      <LandingFinale signedIn={signedIn} />
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
