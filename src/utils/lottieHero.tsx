import Lottie from "lottie-react";

type Props = {
  item: any;
  width: number;
  height: number;
};

export default function LottieHero({ item, width, height }: Props) {
  return (
    <Lottie
      animationData={item}
      loop
      autoplay
      style={{ width: width, height: height }}
    />
  );
}
