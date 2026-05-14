import { Feather } from "@expo/vector-icons";
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

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert("Xəta", "Bütün sahələri doldurun");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Xəta", "Şifrə ən az 6 simvol olmalıdır");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Xəta", "Şifrələr uyğun gəlmir");
      return;
    }
    setLoading(true);
    try {
      await register(email.trim(), name.trim(), password);
      // First time — go to onboarding
      router.replace("/onboarding");
    } catch (err: unknown) {
      Alert.alert(
        "Qeydiyyat uğursuz",
        err instanceof Error ? err.message : "Xəta baş verdi"
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
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.iconWrap}>
              <Image
                source={require("@/assets/images/icon.png")}
                style={styles.icon}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appName}>EcoTrack</Text>
            <Text style={styles.tagline}>Hesab yaradın</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.heading}>Yeni hesab</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Ad</Text>
              <View style={styles.inputWrap}>
                <Feather name="user" size={18} color="#7BAE8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Adınızı daxil edin"
                  placeholderTextColor="#A0B8A8"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>E-poçt</Text>
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
              <Text style={styles.label}>Şifrə</Text>
              <View style={styles.inputWrap}>
                <Feather name="lock" size={18} color="#7BAE8A" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="Ən az 6 simvol"
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

            <View style={styles.field}>
              <Text style={styles.label}>Şifrəni Təsdiqlə</Text>
              <View style={styles.inputWrap}>
                <Feather name="check-circle" size={18} color="#7BAE8A" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Şifrəni yenidən daxil edin"
                  placeholderTextColor="#A0B8A8"
                  value={confirm}
                  onChangeText={setConfirm}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <Pressable
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.btnText}>
                {loading ? "Qeydiyyat edilir..." : "Qeydiyyatdan keç"}
              </Text>
            </Pressable>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>artıq hesabınız var?</Text>
              <View style={styles.dividerLine} />
            </View>

            <Pressable
              style={styles.secondaryBtn}
              onPress={() => router.back()}
            >
              <Text style={styles.secondaryBtnText}>Daxil ol</Text>
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
  hero: { alignItems: "center", gap: 8, paddingTop: 8 },
  iconWrap: {
    width: 80, height: 80, borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  icon: { width: 64, height: 64 },
  appName: { color: "#FFFFFF", fontSize: 28, fontWeight: "800", letterSpacing: -0.5 },
  tagline: { color: "rgba(255,255,255,0.65)", fontSize: 14, fontWeight: "500" },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  heading: { fontSize: 20, fontWeight: "700", color: "#1A3A26", marginBottom: 2 },
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
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  divider: { flexDirection: "row", alignItems: "center", gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#E8F5E9" },
  dividerText: { color: "#7BAE8A", fontSize: 12, fontWeight: "500" },
  secondaryBtn: {
    borderRadius: 14, height: 52,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5, borderColor: "#2D7A4F",
  },
  secondaryBtnText: { color: "#2D7A4F", fontSize: 16, fontWeight: "700" },
});
