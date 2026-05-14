import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Logged in — check onboarding
    AsyncStorage.getItem("@ecotrack_onboarding").then((val) => {
      if (!val) router.replace("/onboarding");
      // else: stays on (tabs) which is the initial route
    });
  }, [isLoading, user]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Geri" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="auth/login"
        options={{ headerShown: false, animation: "fade" }}
      />
      <Stack.Screen
        name="auth/register"
        options={{ headerShown: false, animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="notifications"
        options={{ title: "Bildirişlər", headerTintColor: "#2D7A4F" }}
      />
      <Stack.Screen
        name="entries"
        options={{ title: "Bütün Girişlər", headerTintColor: "#2D7A4F" }}
      />
      <Stack.Screen
        name="wiki"
        options={{ title: "Eko-Vikipediya", headerTintColor: "#2D7A4F" }}
      />
      <Stack.Screen
        name="wiki/[id]"
        options={{
          title: "",
          headerTintColor: "#FFFFFF",
          headerTransparent: true,
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splash}>
        <View style={styles.splashIconWrap}>
          <Image
            source={require("@/assets/images/icon.png")}
            style={styles.splashIcon}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.splashTitle}>EcoTrack</Text>
        <Text style={styles.splashSub}>Karbon İzi İzləyici</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <AppProvider>
                <GestureHandlerRootView style={{ flex: 1 }}>
                  <KeyboardProvider>
                    <RootLayoutNav />
                  </KeyboardProvider>
                </GestureHandlerRootView>
              </AppProvider>
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: "#2D7A4F",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  splashIconWrap: {
    width: 120,
    height: 120,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  splashIcon: { width: 100, height: 100 },
  splashTitle: {
    color: "#FFFFFF",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -1,
  },
  splashSub: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 15,
    fontWeight: "500",
  },
});
