import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { getToken } from "../utils/security";
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    const checkSession = async () => {
      try {

        await new Promise(resolve => setTimeout(resolve, 2000));


       const token = await getToken("auth_token");
const storedRole = await getToken("user_role");

if (token) {
  navigation.replace("Dashboard", {
    role: storedRole ? JSON.parse(storedRole) : null,
  });
} else {
  navigation.replace("Login");
}
      } catch (error) {
        navigation.replace("Login");
      }
    };

    checkSession();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mobile</Text>

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
