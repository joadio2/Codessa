import Lottie from "lottie-react";
import heroAnimation from "../../assets/lottie/hero.json";

export default function LottieHero() {
  return (
    <Lottie
      animationData={heroAnimation}
      loop
      autoplay
      style={{ width: 400, height: 400 }}
    />
  );
}
