import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export default function LoginScreen() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert(t.auth.login.errorTitle, t.auth.login.errorFill);
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      const onboarded = await AsyncStorage.getItem("@ecotrack_onboarding");
      if (!onboarded) {
        router.replace("/onboarding");
      } else {
        router.replace("/(tabs)");
      }
    } catch (err: unknown) {
      Alert.alert(
        t.auth.login.errorTitle,
        err instanceof Error ? err.message : t.auth.login.errorGeneral
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.hero}>
            <View style={styles.iconWrap}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>EcoTrack</Text>
            <Text style={styles.tagline}>{t.auth.tagline}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>{t.auth.login.heading}</Text>

            <View style={styles.field}>
              <Text style={styles.label}>{t.auth.login.email}</Text>
              <View style={styles.inputWrap}>
                <Feather name="mail" size={18} color="#7BAE8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="siz@email.com"
                  placeholderTextColor="#A0B8A8"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>{t.auth.login.password}</Text>
              <View style={styles.inputWrap}>
                <Feather name="lock" size={18} color="#7BAE8A" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#A0B8A8"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                  <Feather name={showPass ? "eye-off" : "eye"} size={18} color="#7BAE8A" />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <Text style={styles.btnText}>
                {loading ? t.auth.login.loggingIn : t.auth.login.loginBtn}
              </Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>{t.auth.login.or}</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => router.push("/auth/register")}
            >
              <Text style={styles.secondaryBtnText}>{t.auth.login.createAccount}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#2D7A4F" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 20, gap: 24 },
  hero: { alignItems: "center", gap: 8, paddingTop: 16 },
  iconWrap: {
    width: 88, height: 88, borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  icon: { width: 70, height: 70 },
  appName: { color: "#FFFFFF", fontSize: 32, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: "500" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    gap: 16,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  heading: { fontSize: 20, fontWeight: "700", color: "#1A3A26", marginBottom: 4 },
  field: { gap: 6 },
  label: { fontSize: 13, fontWeight: "600", color: "#4A7A5A" },
  inputWrap: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "#F4FAF6", borderRadius: 12,
    borderWidth: 1.5, borderColor: "#C8E6C9",
    paddingHorizontal: 12, height: 50,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: "#1A3A26" },
  eyeBtn: { padding: 4 },
  btn: {
    backgroundColor: "#2D7A4F", borderRadius: 14,
    height: 52, alignItems: "center", justifyContent: "center",
    shadowColor: "#2D7A4F", shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E8F5E9" },
  dividerText: { color: "#7BAE8A", fontSize: 13, fontWeight: "500" },
  secondaryBtn: {
    borderRadius: 14, height: 52,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#2D7A4F",
  },
  secondaryBtnText: { color: "#2D7A4F", fontSize: 16, fontWeight: "700" },
});
