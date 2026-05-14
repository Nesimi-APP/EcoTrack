import LottieView from "lottie-react-native";
import React from "react";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");

const SOURCES = [
  require("@/assets/lottie/eco_friendly.json"),
  require("@/assets/lottie/earth_animation.json"),
  require("@/assets/lottie/plant_palm.json"),
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
      <LottieView
        source={SOURCES[index]}
        autoPlay
        loop
        style={styles.lottie}
      />
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
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: { width: "100%", height: "100%" },
});
