
import { StatusBar } from "react-native";
import 'react-native-gesture-handler';
import Routes from "./routes/Index";

import AuthProvider from "./contexts/auth";

export default function App() {
  return (
    <AuthProvider>
      <StatusBar backgroundColor="#F0F4FF" barStyle="dark-content" />
      <Routes />
    </AuthProvider>
  );
}
