import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    title: "İzinizi Görün",
    subtitle:
      "Gündəlik hərəkətlərinizin karbon ekosistemine necə təsir etdiyini real vaxtda izləyin.",
    image: require("@/assets/images/onboarding1.png"),
    bg: "#1B5E20",
    bg2: "#2D7A4F",
  },
  {
    title: "Hərəkətə Keçin",
    subtitle:
      "Gündəlik vərdişlərinizi dəyişdirin. Küçük qərarlar böyük fərq yaradır.",
    image: require("@/assets/images/onboarding2.png"),
    bg: "#1A3726",
    bg2: "#4CAF50",
  },
  {
    title: "Tullantıları İdarə Edin",
    subtitle:
      "Yaxınlığınızdakı e-tullantı toplama məntəqələrini tapın. Geri dönüşüm planetimizi xilas edir.",
    image: require("@/assets/images/onboarding3.png"),
    bg: "#0D3B1B",
    bg2: "#388E3C",
  },
];

function Dot({ active }: { active: boolean }) {
  const style = useAnimatedStyle(() => ({
    width: withSpring(active ? 24 : 8),
    opacity: withSpring(active ? 1 : 0.4),
  }));
  return <Animated.View style={[styles.dot, style]} />;
}

// Extracted animated slide to avoid hook-in-map violation
function SlideImage({
  scrollX,
  index,
  image,
}: {
  scrollX: Animated.SharedValue<number>;
  index: number;
  image: ReturnType<typeof require>;
}) {
  const imgStyle = useAnimatedStyle(() => ({
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
    <Animated.View style={[styles.imageWrapper, imgStyle]}>
      <Image source={image} style={styles.image} resizeMode="contain" />
    </Animated.View>
  );
}

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const scrollX = useSharedValue(0);

  const bgStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      scrollX.value / width,
      [0, 1, 2],
      [SLIDES[0].bg, SLIDES[1].bg, SLIDES[2].bg]
    ),
  }));

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollX.value = e.nativeEvent.contentOffset.x;
    const idx = Math.round(e.nativeEvent.contentOffset.x / width);
    setCurrentIndex(idx);
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollRef.current?.scrollTo({
        x: (currentIndex + 1) * width,
        animated: true,
      });
    } else {
      await AsyncStorage.setItem("@ecotrack_onboarding", "done");
      router.replace("/(tabs)");
    }
  };

  const handleSkip = async () => {
    await AsyncStorage.setItem("@ecotrack_onboarding", "done");
    router.replace("/(tabs)");
  };

  const isLast = currentIndex === SLIDES.length - 1;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <Animated.View style={[styles.root, bgStyle]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        {!isLast && (
          <Pressable onPress={handleSkip} style={styles.skipBtn}>
            <Text style={styles.skipText}>Atla</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { width }]}>
            <SlideImage scrollX={scrollX} index={i} image={slide.image} />
            <View style={styles.textBlock}>
              <Text style={styles.title}>{slide.title}</Text>
              <Text style={styles.subtitle}>{slide.subtitle}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: bottomPad + 20 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <Dot key={i} active={i === currentIndex} />
          ))}
        </View>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextBtn,
            { opacity: pressed ? 0.85 : 1 },
          ]}
        >
          <Text style={styles.nextText}>{isLast ? "Başla" : "İrəli"}</Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    alignItems: "flex-end",
    paddingHorizontal: 24,
  },
  skipBtn: { padding: 8 },
  skipText: { color: "#A5D6A7", fontSize: 15, fontWeight: "500" },
  slide: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 32,
  },
  imageWrapper: {
    width: width * 0.72,
    height: width * 0.72,
    marginTop: 24,
    borderRadius: 32,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  image: { width: "100%", height: "100%" },
  textBlock: { marginTop: 36, alignItems: "center" },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#B9E7C6",
    textAlign: "center",
    marginTop: 14,
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: 32,
    alignItems: "center",
    gap: 20,
  },
  dots: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { height: 8, borderRadius: 4, backgroundColor: "#A5D6A7" },
  nextBtn: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
  },
  nextText: { color: "#1B5E20", fontSize: 17, fontWeight: "700" },
});
