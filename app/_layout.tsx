import { Stack } from "expo-router";
import { Fragment } from "react";
import { StatusBar } from "react-native";

export default function RootLayout() {
  return (
    <Fragment>
      <StatusBar barStyle="default" translucent />
      <Stack screenOptions={{ headerShown: false }} />
    </Fragment>
  );
}
