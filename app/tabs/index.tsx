import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { useSelector } from "react-redux";

export default function Index() {
  const email = useSelector((state) => state.user.email);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome Home, {email}!</Text>
      <Link href="/tabs/about" style={styles.button}>
        <Text style={styles.buttonText}>Go to About</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3678da',
    borderWidth: 2,
    borderColor: '#fff',
    padding: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

