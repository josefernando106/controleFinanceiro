
import { StatusBar } from "react-native";
import Routes from "./routes/Index";

export default function App() {
  return (
   <> 
      <StatusBar backgroundColor="#F0F4FF" barStyle="dark-content"/>
      <Routes />
    </>
  );
}
