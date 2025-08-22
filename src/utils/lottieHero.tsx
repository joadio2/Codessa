import Lottie from "lottie-react";

type Props = {
  item: any;
  width: number;
  height: number;
  auto?: boolean;
};

export default function LottieHero({
  item,
  width,
  height,
  auto = true,
}: Props) {
  return (
    <Lottie
      animationData={item}
      loop={auto}
      autoplay
      style={{ width: width, height: height }}
    />
  );
}
