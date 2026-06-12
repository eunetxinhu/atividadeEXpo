import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
} from "react-native";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";

import { ACTIVE_LOCATION } from "../constants/locations";
import { calcularDistancia } from "../constants/haversine";

type Status = "idle" | "loading" | "success" | "error" | "denied";

export default function HomeScreen() {
  const [status, setStatus] = useState<Status>("idle");
  const [distancia, setDistancia] = useState<number | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const pulsar = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.94, duration: 100, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 200, useNativeDriver: true, easing: Easing.out(Easing.quad) }),
    ]).start();
  };

  const fazerCheckin = async () => {
    pulsar();
    setStatus("loading");
    setDistancia(null);
    setCoords(null);

    const { status: permissao } = await Location.requestForegroundPermissionsAsync();
    if (permissao !== "granted") {
      setStatus("denied");
      return;
    }
    const localizacao = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    const { latitude, longitude } = localizacao.coords;
    setCoords({ lat: latitude, lon: longitude });

    const dist = calcularDistancia(
      latitude,
      longitude,
      ACTIVE_LOCATION.latitude,
      ACTIVE_LOCATION.longitude
    );
    setDistancia(Math.round(dist));

    if (dist <= ACTIVE_LOCATION.radiusMeters) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  };

  const resetar = () => {
    setStatus("idle");
    setDistancia(null);
    setCoords(null);
  };

  const isLoading = status === "loading";

  return (
    <View style={styles.container}>
      <StatusBar style="light" />


      <View style={styles.header}>
        <Text style={styles.eyebrow}>PRESENÇA VERIFICADA POR GPS</Text>
        <Text style={styles.title}>Check-IN</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardRow}>
          <Ionicons name="location" size={18} color="#F5C518" />
          <Text style={styles.cardLabel}>Local do check-in</Text>
        </View>
        <Text style={styles.cardName}>{ACTIVE_LOCATION.name}</Text>
        <Text style={styles.cardAddress}>{ACTIVE_LOCATION.address}</Text>
        <View style={styles.radiusBadge}>
          <Text style={styles.radiusText}>Raio permitido: {ACTIVE_LOCATION.radiusMeters}m</Text>
        </View>
      </View>

      {status !== "idle" && status !== "loading" && (
        <View style={[styles.result, styles[`result_${status}`]]}>
          {status === "success" && (
            <>
              <Ionicons name="checkmark-circle" size={48} color="#22C55E" />
              <Text style={styles.resultTitle}>Check-in realizado!</Text>
              <Text style={styles.resultSub}>Você está a {distancia}m do local.</Text>
            </>
          )}
          {status === "error" && (
            <>
              <Ionicons name="close-circle" size={48} color="#EF4444" />
              <Text style={styles.resultTitle}>Fora do raio permitido</Text>
              <Text style={styles.resultSub}>
                Você está a {distancia}m — precisa estar a menos de {ACTIVE_LOCATION.radiusMeters}m.
              </Text>
            </>
          )}
          {status === "denied" && (
            <>
              <Ionicons name="warning" size={48} color="#ef9b0b" />
              <Text style={styles.resultTitle}>Permissão negada</Text>
              <Text style={styles.resultSub}>
                Habilite a localização nas configurações do celular.
              </Text>
            </>
          )}

          {coords && (
            <View style={styles.coordsBox}>
              <Text style={styles.coordsText}>
                📍 {coords.lat.toFixed(5)}, {coords.lon.toFixed(5)}
              </Text>
            </View>
          )}

          <TouchableOpacity onPress={resetar} style={styles.btnSecondary}>
            <Text style={styles.btnSecondaryText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botão principal */}
      {(status === "idle" || status === "loading") && (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: "100%" }}>
          <TouchableOpacity
            style={[styles.btnPrimary, isLoading && styles.btnPrimaryLoading]}
            onPress={fazerCheckin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <>
                <ActivityIndicator color="#0D0D0D" size="small" />
                <Text style={styles.btnPrimaryText}>Obtendo localização...</Text>
              </>
            ) : (
              <>
                <Ionicons name="navigate" size={20} color="#0D0D0D" />
                <Text style={styles.btnPrimaryText}>Fazer Check-in</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
      )}

      <Text style={styles.footer}>
        Usa expo-location + fórmula Haversine
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D0D0D",
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
    alignItems: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 36,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 3,
    color: "#554301",
    fontWeight: "700",
    marginBottom: 8,
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -1,
  },
  card: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 11,
    color: "#888",
    letterSpacing: 1.5,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  cardName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  cardAddress: {
    fontSize: 13,
    color: "#888",
    marginBottom: 14,
  },
  radiusBadge: {
    backgroundColor: "#F5C51815",
    borderWidth: 1,
    borderColor: "#F5C51840",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: "flex-start",
  },
  radiusText: {
    fontSize: 12,
    color: "#F5C518",
    fontWeight: "600",
  },
  result: {
    width: "100%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  result_success: {
    backgroundColor: "#052E16",
    borderWidth: 1,
    borderColor: "#166534",
  },
  result_error: {
    backgroundColor: "#1F0707",
    borderWidth: 1,
    borderColor: "#7F1D1D",
  },
  result_denied: {
    backgroundColor: "#1C1507",
    borderWidth: 1,
    borderColor: "#78350F",
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 4,
  },
  resultSub: {
    fontSize: 14,
    color: "#AAA",
    textAlign: "center",
    lineHeight: 20,
  },
  coordsBox: {
    backgroundColor: "#FFFFFF10",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  coordsText: {
    fontSize: 11,
    color: "#888",
    fontFamily: "monospace",
  },
  btnSecondary: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#444",
  },
  btnSecondaryText: {
    color: "#AAA",
    fontSize: 14,
    fontWeight: "600",
  },
  btnPrimary: {
    backgroundColor: "#F5C518",
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    width: "100%",
  },
  btnPrimaryLoading: {
    backgroundColor: "#A38510",
  },
  btnPrimaryText: {
    color: "#0D0D0D",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    fontSize: 11,
    color: "#333",
    letterSpacing: 1,
  },
});
