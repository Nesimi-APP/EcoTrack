import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
  fontSize?: number;
}

export function CircularProgress({
  value,
  max,
  size = 160,
  strokeWidth = 12,
  color = "#2D7A4F",
  bgColor = "#C8E6C9",
  label,
  sublabel,
  fontSize = 28,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(0);

  useEffect(() => {
    const ratio = Math.min(value / Math.max(max, 1), 1);
    progress.value = withTiming(ratio, { duration: 1000 });
  }, [value, max]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        {label !== undefined && (
          <Text style={[styles.label, { fontSize, color }]}>{label}</Text>
        )}
        {sublabel !== undefined && (
          <Text style={[styles.sublabel, { color: bgColor }]}>{sublabel}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
  svg: { position: "absolute" },
  labelContainer: { alignItems: "center" },
  label: { fontWeight: "700", textAlign: "center" },
  sublabel: { fontSize: 12, textAlign: "center", marginTop: 2 },
});
