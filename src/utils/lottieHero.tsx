import Lottie from "lottie-react";

type Props = {
  item: any;
};

export default function LottieHero({ item }: Props) {
  return (
    <Lottie
      animationData={item}
      loop
      autoplay
      style={{ width: 400, height: 400 }}
    />
  );
}
