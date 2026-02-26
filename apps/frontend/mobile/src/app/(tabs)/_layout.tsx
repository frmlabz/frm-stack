import { Tabs, Redirect } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";

import { HapticTab } from "#components/haptic-tab";
import { IconSymbol } from "#components/ui/icon-symbol";
import { Colors } from "#constants/theme";
import { useColorScheme } from "#hooks/use-color-scheme";
import { useSession } from "#providers/session-provider";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/signin" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Todos",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
