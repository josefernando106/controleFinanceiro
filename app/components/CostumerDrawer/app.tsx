import { AuthContext } from "@/app/contexts/auth";
import { DrawerContentScrollView, DrawerItemList } from "@react-navigation/drawer";
import React from "react";
import { Image, Text, View } from "react-native";


export default function CustomerDrawer(props: any) {

    const { user, signOut } = React.useContext(AuthContext);
    return (
    <DrawerContentScrollView>
        <View style={{ alignItems: "center", marginTop: 20, justifyContent: "center" }}>
            <Image 
                source={require('../../../assets/images/Logo.png')}
                style={{ width: 90, height: 90}}
                resizeMode="contain" />
                <Text style={{fontSize:18, marginTop: 14}}>Bem-vindo</Text>
                <Text style={{fontSize:16, marginBottom: 14, paddingHorizontal: 10 }}>{user && user?.name}</Text>
        </View>
        <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}