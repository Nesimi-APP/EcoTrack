import { Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";

const ECOSCORE_COLORS: Record<string, string> = {
  a: "#1a9641",
  b: "#70c050",
  c: "#f0c030",
  d: "#e8843a",
  e: "#d7191c",
  unknown: "#9E9E9E",
};

const ECOSCORE_LABELS: Record<string, string> = {
  a: "A",
  b: "B",
  c: "C",
  d: "D",
  e: "E",
};

interface ProductResult {
  barcode: string;
  name: string;
  brand: string;
  imageUrl?: string;
  ecoscoreGrade?: string;
  ecoscoreScore?: number;
  carbonPer100g?: number;
  carbonEstimated: boolean;
  category?: string;
  categoryAz?: string;
  packaging?: string;
  quantity?: string;
  status: "found" | "not_found";
}

// Estimated carbon footprint (grams CO₂ per 100g or 100ml) by category keyword
const CATEGORY_CARBON: Array<{ keywords: string[]; co2: number; labelAz: string }> = [
  { keywords: ["water", "waters", "spring-water", "mineral-water", "mineral-waters"], co2: 6, labelAz: "Su" },
  { keywords: ["soft-drink", "sodas", "cola", "carbonated"], co2: 11, labelAz: "Qazlı içki" },
  { keywords: ["juice", "fruit-juice", "nectars", "fruit-drinks"], co2: 9, labelAz: "Meyvə suyu" },
  { keywords: ["energy-drink", "energy-drinks"], co2: 14, labelAz: "Enerji içkisi" },
  { keywords: ["milk", "milks", "dairy-drinks"], co2: 32, labelAz: "Süd" },
  { keywords: ["yogurt", "yogurts", "fermented-milk"], co2: 28, labelAz: "Qatıq" },
  { keywords: ["cheese", "cheeses"], co2: 140, labelAz: "Pendir" },
  { keywords: ["butter", "margarines"], co2: 180, labelAz: "Yağ" },
  { keywords: ["beef", "veal"], co2: 1200, labelAz: "Mal əti" },
  { keywords: ["lamb", "mutton"], co2: 900, labelAz: "Quzu əti" },
  { keywords: ["pork"], co2: 480, labelAz: "Donuz əti" },
  { keywords: ["chicken", "poultry"], co2: 280, labelAz: "Toyuq" },
  { keywords: ["fish", "seafood", "fishes"], co2: 350, labelAz: "Balıq" },
  { keywords: ["eggs", "egg"], co2: 170, labelAz: "Yumurta" },
  { keywords: ["bread", "breads", "loaves"], co2: 75, labelAz: "Çörək" },
  { keywords: ["pasta", "noodles"], co2: 55, labelAz: "Makaron" },
  { keywords: ["rice"], co2: 80, labelAz: "Düyü" },
  { keywords: ["chocolate", "chocolates"], co2: 380, labelAz: "Şokolad" },
  { keywords: ["biscuit", "cookies", "crackers", "snacks", "chips"], co2: 210, labelAz: "Qəlyanaltı" },
  { keywords: ["ice-cream", "frozen-desserts"], co2: 135, labelAz: "Dondurma" },
  { keywords: ["coffee"], co2: 280, labelAz: "Qəhvə" },
  { keywords: ["tea", "teas"], co2: 30, labelAz: "Çay" },
  { keywords: ["fruit", "fruits", "apple", "orange", "banana"], co2: 18, labelAz: "Meyvə" },
  { keywords: ["vegetable", "vegetables", "tomato", "potato"], co2: 22, labelAz: "Tərəvəz" },
  { keywords: ["oil", "olive-oil", "sunflower-oil"], co2: 190, labelAz: "Bitki yağı" },
  { keywords: ["sauce", "ketchup", "mayonnaise", "condiment"], co2: 85, labelAz: "Sous" },
  { keywords: ["cereal", "cereals", "corn-flakes", "muesli"], co2: 95, labelAz: "Taxıl" },
  { keywords: ["sugar", "sweetener"], co2: 45, labelAz: "Şəkər" },
  { keywords: ["salt", "spice", "spices"], co2: 15, labelAz: "Ədviyyat" },
];

function estimateCarbonFromCategories(
  tags: string[] = []
): { co2: number; labelAz: string } | null {
  const joined = tags.join(" ").toLowerCase();
  for (const entry of CATEGORY_CARBON) {
    if (entry.keywords.some((k) => joined.includes(k))) {
      return { co2: entry.co2, labelAz: entry.labelAz };
    }
  }
  return null;
}

// Derive readable eco-grade from estimated CO₂ (per 100g)
function gradeFromCo2(co2: number): string {
  if (co2 < 20) return "a";
  if (co2 < 60) return "b";
  if (co2 < 150) return "c";
  if (co2 < 400) return "d";
  return "e";
}

async function lookupBarcode(barcode: string): Promise<ProductResult> {
  const res = await fetch(
    `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
    { headers: { "User-Agent": "EcoTrack/1.0 (ecotrack.az)" } }
  );
  if (!res.ok) throw new Error("Network error");
  const data = await res.json();

  if (data.status !== 1 || !data.product) {
    return { barcode, name: "", brand: "", carbonEstimated: false, status: "not_found" };
  }

  const p = data.product;

  // Try to get measured carbon data first
  const measuredCarbon: number | undefined =
    typeof p.carbon_footprint_from_known_ingredients_100g === "number"
      ? p.carbon_footprint_from_known_ingredients_100g
      : typeof p.ecoscore_data?.agribalyse?.co2_total === "number"
      ? p.ecoscore_data.agribalyse.co2_total * 100 // agribalyse is per kg → convert to per 100g
      : typeof p.nutriments?.["carbon-footprint_100g"] === "number"
      ? p.nutriments["carbon-footprint_100g"]
      : undefined;

  const categoryTags: string[] = p.categories_tags ?? [];
  const estimate = measuredCarbon == null ? estimateCarbonFromCategories(categoryTags) : null;

  const carbonPer100g = measuredCarbon ?? estimate?.co2;
  const carbonEstimated = measuredCarbon == null && estimate != null;

  // Derive eco-grade from estimate when API grade is missing
  const ecoscoreGrade =
    p.ecoscore_grade && p.ecoscore_grade !== "not-applicable" && p.ecoscore_grade !== "unknown"
      ? p.ecoscore_grade
      : carbonPer100g != null
      ? gradeFromCo2(carbonPer100g)
      : undefined;

  const ecoscoreScore =
    typeof p.ecoscore_score === "number"
      ? p.ecoscore_score
      : carbonPer100g != null && ecoscoreGrade
      ? Math.max(0, Math.min(100, Math.round(100 - carbonPer100g / 10)))
      : undefined;

  // Human-readable category
  const mainCatRaw: string =
    p.main_category_en ||
    categoryTags.find((t: string) => t.startsWith("en:"))?.replace("en:", "") ||
    categoryTags[0]?.replace(/^[a-z]+:/, "") ||
    "";

  const categoryAz = estimate?.labelAz;

  // Packaging info
  const packagingRaw: string = p.packaging || p.packaging_tags?.join(", ") || "";

  return {
    barcode,
    name: p.product_name || p.product_name_en || p.abbreviated_product_name || "",
    brand: p.brands || "",
    imageUrl: p.image_front_small_url || p.image_url,
    ecoscoreGrade,
    ecoscoreScore,
    carbonPer100g,
    carbonEstimated,
    category: mainCatRaw.replace(/-/g, " "),
    categoryAz,
    packaging: packagingRaw,
    quantity: p.quantity || "",
    status: "found",
  };
}

function EcoScoreBadge({ grade }: { grade?: string }) {
  const g = (grade || "unknown").toLowerCase();
  const color = ECOSCORE_COLORS[g] ?? ECOSCORE_COLORS.unknown;
  const label = ECOSCORE_LABELS[g] ?? "?";
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
}

function ResultCard({
  result,
  onScanAnother,
}: {
  result: ProductResult;
  onScanAnother: () => void;
}) {
  const colors = useColors();

  if (result.status === "not_found") {
    return (
      <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
        <Ionicons name="alert-circle-outline" size={56} color="#E57373" />
        <Text style={[styles.resultTitle, { color: colors.foreground }]}>
          Məhsul tapılmadı
        </Text>
        <Text style={[styles.resultSub, { color: colors.mutedForeground }]}>
          Bu barkod üçün məlumat mövcud deyil
        </Text>
        <Text style={[styles.barcodeText, { color: colors.mutedForeground }]}>
          {result.barcode}
        </Text>
        <Pressable style={styles.scanAnotherBtn} onPress={onScanAnother}>
          <Text style={styles.scanAnotherText}>Yenidən skan et</Text>
        </Pressable>
      </View>
    );
  }

  const grade = (result.ecoscoreGrade || "unknown").toLowerCase();
  const gradeColor = ECOSCORE_COLORS[grade] ?? ECOSCORE_COLORS.unknown;
  const displayCategory = result.categoryAz || result.category || "";

  return (
    <ScrollView
      style={{ width: "100%" }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
        {/* Header */}
        <View style={styles.productHeader}>
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={[styles.productName, { color: colors.foreground }]} numberOfLines={2}>
              {result.name || "İsimsiz məhsul"}
            </Text>
            {!!result.brand && (
              <Text style={[styles.productBrand, { color: colors.mutedForeground }]}>
                {result.brand}
              </Text>
            )}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
              {!!displayCategory && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{displayCategory}</Text>
                </View>
              )}
              {!!result.quantity && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{result.quantity}</Text>
                </View>
              )}
            </View>
          </View>
          <EcoScoreBadge grade={result.ecoscoreGrade} />
        </View>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {/* Carbon & Eco metrics */}
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
              Eco Qiymət
            </Text>
            <View style={styles.metricValueRow}>
              <View style={[styles.gradeDot, { backgroundColor: gradeColor }]} />
              <Text style={[styles.metricValue, { color: colors.foreground }]}>
                {grade !== "unknown" ? `${ECOSCORE_LABELS[grade]} Sinif` : "—"}
              </Text>
            </View>
            {result.carbonEstimated && grade !== "unknown" && (
              <Text style={[styles.estimatedLabel, { color: "#F0A500" }]}>təxmini</Text>
            )}
          </View>

          <View style={[styles.metricDivider, { backgroundColor: colors.border }]} />

          <View style={styles.metric}>
            <Text style={[styles.metricLabel, { color: colors.mutedForeground }]}>
              Karbon / 100q
            </Text>
            {result.carbonPer100g != null ? (
              <>
                <Text style={[styles.metricValue, { color: colors.foreground }]}>
                  {result.carbonPer100g >= 100
                    ? `${(result.carbonPer100g / 1000).toFixed(2)} kq CO₂`
                    : `${result.carbonPer100g.toFixed(1)} q CO₂`}
                </Text>
                {result.carbonEstimated && (
                  <Text style={[styles.estimatedLabel, { color: "#F0A500" }]}>təxmini</Text>
                )}
              </>
            ) : (
              <Text style={[styles.metricValue, { color: colors.mutedForeground }]}>—</Text>
            )}
          </View>
        </View>

        {/* Score bar */}
        {result.ecoscoreScore != null && (
          <View style={styles.scoreBarWrap}>
            <View style={styles.scoreBarLabels}>
              <Text style={[styles.scoreText, { color: colors.mutedForeground }]}>
                Ekoloji bal
              </Text>
              <Text style={[styles.scoreText, { color: gradeColor, fontWeight: "700" }]}>
                {result.ecoscoreScore}/100
              </Text>
            </View>
            <View style={[styles.scoreBarBg, { backgroundColor: colors.border }]}>
              <View
                style={[
                  styles.scoreBarFill,
                  {
                    width: `${result.ecoscoreScore}%` as `${number}%`,
                    backgroundColor: gradeColor,
                  },
                ]}
              />
            </View>
          </View>
        )}

        {/* Packaging */}
        {!!result.packaging && (
          <View style={styles.detailRow}>
            <Ionicons name="cube-outline" size={15} color="#7BAE8A" />
            <Text style={[styles.detailText, { color: colors.mutedForeground }]}>
              {result.packaging}
            </Text>
          </View>
        )}

        {/* Estimated disclaimer */}
        {result.carbonEstimated && (
          <View style={[styles.infoBox, { backgroundColor: "#FFF8E7", borderColor: "#F0A500", borderWidth: 1 }]}>
            <Ionicons name="flask-outline" size={15} color="#F0A500" />
            <Text style={[styles.infoText, { color: "#8B6500" }]}>
              Bu məhsul üçün dəqiq məlumat tapılmadı. Göstərilən dəyərlər kateqoriyaya görə
              hesablanmış <Text style={{ fontWeight: "700" }}>təxmini</Text> rəqəmlərdir.
            </Text>
          </View>
        )}

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={15} color="#7BAE8A" />
          <Text style={[styles.infoText, { color: colors.mutedForeground }]}>
            Məlumat Open Food Facts bazasından götürülmüşdür
          </Text>
        </View>

        <Pressable style={styles.scanAnotherBtn} onPress={onScanAnother}>
          <Ionicons name="barcode-outline" size={18} color="#fff" />
          <Text style={styles.scanAnotherText}>Yeni məhsul skan et</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

export default function ScanScreen() {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [manualBarcode, setManualBarcode] = useState("");
  const scanLock = useRef(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handleBarcodeScan = useCallback(
    async ({ data }: { data: string }) => {
      if (scanLock.current) return;
      scanLock.current = true;
      setScanned(true);
      setLoading(true);
      try {
        const res = await lookupBarcode(data);
        setResult(res);
      } catch {
        Alert.alert("Xəta", "Məhsul məlumatı yüklənərkən xəta baş verdi.");
        setScanned(false);
        scanLock.current = false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleManualSearch = useCallback(async () => {
    const code = manualBarcode.trim();
    if (!code) return;
    setLoading(true);
    try {
      const res = await lookupBarcode(code);
      setResult(res);
    } catch {
      Alert.alert("Xəta", "Məhsul məlumatı yüklənərkən xəta baş verdi.");
    } finally {
      setLoading(false);
    }
  }, [manualBarcode]);

  const reset = useCallback(() => {
    setResult(null);
    setScanned(false);
    setLoading(false);
    scanLock.current = false;
  }, []);

  if (result) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Pressable onPress={reset} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Məhsul Məlumatı
          </Text>
          <View style={{ width: 38 }} />
        </View>
        <ResultCard result={result} onScanAnother={reset} />
      </SafeAreaView>
    );
  }

  if (Platform.OS === "web") {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.webContainer}>
          <Ionicons name="barcode-outline" size={64} color="#2D7A4F" />
          <Text style={[styles.webTitle, { color: colors.foreground }]}>
            Barkod ilə Karbon İzi
          </Text>
          <Text style={[styles.webDesc, { color: colors.mutedForeground }]}>
            Barkod nömrəsini daxil edərək məhsulun karbon izini öyrənin
          </Text>
          <View style={[styles.manualInputRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Ionicons name="search-outline" size={20} color="#7BAE8A" />
            <TextInput
              style={[styles.manualInput, { color: colors.foreground }]}
              placeholder="Barkod nömrəsi (məs. 8690526085584)"
              placeholderTextColor={colors.mutedForeground}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="numeric"
              returnKeyType="search"
              onSubmitEditing={handleManualSearch}
            />
          </View>
          <Pressable
            style={[styles.searchBtn, loading && { opacity: 0.6 }]}
            onPress={handleManualSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchBtnText}>Axtar</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  if (!permission) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.centeredContent}>
          <ActivityIndicator color="#2D7A4F" />
        </View>
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={72} color="#2D7A4F" />
          <Text style={[styles.permTitle, { color: colors.foreground }]}>
            Kamera İcazəsi
          </Text>
          <Text style={[styles.permDesc, { color: colors.mutedForeground }]}>
            Barkod skan etmək üçün kameraya giriş icazəsi tələb olunur
          </Text>
          <Pressable style={styles.permBtn} onPress={requestPermission}>
            <Text style={styles.permBtnText}>İcazə ver</Text>
          </Pressable>

          <View style={[styles.orRow, { marginTop: 20 }]}>
            <View style={[styles.orLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.orText, { color: colors.mutedForeground }]}>və ya</Text>
            <View style={[styles.orLine, { backgroundColor: colors.border }]} />
          </View>

          <View style={[styles.manualInputRow, { borderColor: colors.border, backgroundColor: colors.card, marginTop: 12 }]}>
            <Ionicons name="search-outline" size={20} color="#7BAE8A" />
            <TextInput
              style={[styles.manualInput, { color: colors.foreground }]}
              placeholder="Barkod nömrəsini daxil edin"
              placeholderTextColor={colors.mutedForeground}
              value={manualBarcode}
              onChangeText={setManualBarcode}
              keyboardType="numeric"
              returnKeyType="search"
              onSubmitEditing={handleManualSearch}
            />
          </View>
          <Pressable
            style={[styles.searchBtn, loading && { opacity: 0.6 }]}
            onPress={handleManualSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.searchBtnText}>Axtar</Text>
            )}
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.cameraContainer}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScan}
        barcodeScannerSettings={{
          barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "code128", "qr"],
        }}
      />

      <LinearGradient
        colors={["rgba(0,0,0,0.6)", "transparent"]}
        style={styles.topOverlay}
      >
        <SafeAreaView>
          <Text style={styles.cameraTitle}>Məhsul Skanı</Text>
          <Text style={styles.cameraSubtitle}>
            Barkodu çərçivəyə yerləşdirin
          </Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.scanFrameWrap}>
        <View style={styles.scanFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator color="#fff" size="large" />
              <Text style={styles.loadingText}>Yüklənir...</Text>
            </View>
          )}
        </View>
      </View>

      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.bottomOverlay}
      >
        <View style={styles.manualInputRow}>
          <Ionicons name="search-outline" size={20} color="#fff" />
          <TextInput
            style={styles.manualInputDark}
            placeholder="Barkodu əl ilə daxil edin"
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={manualBarcode}
            onChangeText={setManualBarcode}
            keyboardType="numeric"
            returnKeyType="search"
            onSubmitEditing={handleManualSearch}
          />
          {manualBarcode.length > 0 && (
            <Pressable onPress={handleManualSearch} style={styles.goBtn}>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </View>
  );
}

const CORNER_SIZE = 28;
const CORNER_WIDTH = 3;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centeredContent: { flex: 1, alignItems: "center", justifyContent: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 17, fontWeight: "700" },

  cameraContainer: { flex: 1, backgroundColor: "#000" },
  topOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  cameraTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 8 },
  cameraSubtitle: { color: "rgba(255,255,255,0.7)", fontSize: 14, marginTop: 4 },
  bottomOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 20,
    zIndex: 2,
  },
  scanFrameWrap: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  scanFrame: {
    width: 260,
    height: 180,
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "#2D7A4F",
    borderWidth: CORNER_WIDTH,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 4,
    gap: 8,
  },
  loadingText: { color: "#fff", fontSize: 14, fontWeight: "600" },

  manualInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  manualInput: { flex: 1, fontSize: 15 },
  manualInputDark: {
    flex: 1,
    fontSize: 15,
    color: "#fff",
  },
  goBtn: {
    backgroundColor: "#2D7A4F",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  permTitle: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  permDesc: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  permBtn: {
    backgroundColor: "#2D7A4F",
    borderRadius: 14,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 8,
  },
  permBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  orRow: { flexDirection: "row", alignItems: "center", gap: 12, width: "100%" },
  orLine: { flex: 1, height: 1 },
  orText: { fontSize: 13 },

  webContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 16,
  },
  webTitle: { fontSize: 22, fontWeight: "800", textAlign: "center" },
  webDesc: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  searchBtn: {
    backgroundColor: "#2D7A4F",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  searchBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  resultCard: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  productHeader: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  productName: { fontSize: 18, fontWeight: "800", lineHeight: 24 },
  productBrand: { fontSize: 14, fontWeight: "500" },
  productCategory: { fontSize: 12, textTransform: "capitalize" },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  badgeText: { color: "#fff", fontSize: 22, fontWeight: "900" },
  divider: { height: 1 },
  metricsRow: { flexDirection: "row", gap: 12 },
  metric: { flex: 1, gap: 4 },
  metricLabel: { fontSize: 12, fontWeight: "600" },
  metricValue: { fontSize: 15, fontWeight: "700" },
  metricValueRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  gradeDot: { width: 10, height: 10, borderRadius: 5 },
  metricDivider: { width: 1, alignSelf: "stretch" },
  scoreBarWrap: { gap: 6 },
  scoreBarBg: { height: 8, borderRadius: 4, overflow: "hidden" },
  scoreBarFill: { height: "100%", borderRadius: 4 },
  scoreText: { fontSize: 12, fontWeight: "500" },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F4FAF6",
    borderRadius: 8,
    padding: 10,
  },
  infoText: { fontSize: 12, flex: 1, lineHeight: 16 },
  scanAnotherBtn: {
    backgroundColor: "#2D7A4F",
    borderRadius: 14,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  scanAnotherText: { color: "#fff", fontSize: 15, fontWeight: "700" },
  resultTitle: { fontSize: 20, fontWeight: "800" },
  resultSub: { fontSize: 14, textAlign: "center" },
  barcodeText: { fontSize: 12, fontFamily: "monospace" },
  tag: {
    backgroundColor: "#EAF4EE",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: { fontSize: 12, color: "#4A7A5A", fontWeight: "500" },
  estimatedLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  detailRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  detailText: { fontSize: 13, flex: 1 },
  scoreBarLabels: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
});
