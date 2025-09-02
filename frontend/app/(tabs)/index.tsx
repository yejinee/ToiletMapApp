import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import axios from "axios";

export default function HomeScreen() {
  const [message, setMessage] = useState("로딩중...");

  useEffect(() => {
    axios
      .get("http://121.170.141.42:5000/") // 👉 네 PC IP로 교체
      .then((res) => setMessage(res.data))
      .catch((err) => setMessage("에러: " + err.message));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
