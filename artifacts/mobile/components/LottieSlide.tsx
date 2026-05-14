import React from "react";
import { Dimensions, Image, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const SOURCES = [
  require("@/assets/images/onboarding1.png"),
  require("@/assets/images/onboarding2.png"),
  require("@/assets/images/onboarding3.png"),
];

export function LottieSlide({
  scrollX,
  index,
}: {
  scrollX: Animated.SharedValue<number>;
  index: number;
}) {
  const animStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          scrollX.value / width,
          [index - 1, index, index + 1],
          [0.85, 1, 0.85],
          "clamp"
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.wrapper, animStyle]}>
      <Image source={SOURCES[index]} style={styles.image} resizeMode="contain" />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: width * 0.72,
    height: width * 0.72,
    marginTop: 24,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  image: { width: "100%", height: "100%" },
});
