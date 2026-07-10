import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { getToken } from "../../utils/security";
import authApi from "../../services/authApi";
import { RootStackParamList } from "../../navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const checkSession = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const token = await getToken("auth_token");
        const storedRole = await getToken("user_role");

        if (!token) {
          navigation.replace("Login");
          return;
        }

        // Verify token with backend
        const result = await authApi.getCurrentUser();

        if (!result.success) {
          navigation.replace("Login");
          return;
        }

        if (
          storedRole === "student" ||
          storedRole === "teacher" ||
          storedRole === "parent"
        ) {
          navigation.replace("Home", {
            initialRole: storedRole,
          });
        } else {
          navigation.replace("Login");
        }
      } catch (error) {
        navigation.replace("Login");
      }
    };

    checkSession();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BrainMint</Text>

      <ActivityIndicator
        size="large"
        color="#4F46E5"
        style={styles.loader}
      />

      <Text style={styles.loading}>Loading...</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#4F46E5",
  },

  loader: {
    marginTop: 20,
  },

  loading: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748B",
  },
});