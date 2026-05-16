import { Tabs, usePathname } from "expo-router";
import {
  FavouriteIcon,
  Icon,
  MenuIcon,
  StarIcon,
  UserIcon,
} from "@/components/ui/icon";
import { ComponentProps } from "react";
import { View } from "react-native";
import { BookAutocomplete } from "@/components/book-autocomplete";

type IconAs = ComponentProps<typeof Icon>["as"];

const TabIcon = ({ as, color }: { as: IconAs; color: string }) => (
  <Icon as={as} size="lg" style={{ color }} />
);

const tabs = [
  { name: "index", options: { title: "Home", icon: StarIcon } },
  { name: "list", options: { title: "List", icon: MenuIcon } },
  { name: "community", options: { title: "Community", icon: FavouriteIcon } },
  { name: "profile/index", options: { title: "Profile", icon: UserIcon } },
  { name: "profile/[userId]", options: { href: null } },
] as const;

export default function TabLayout() {
  const pathname = usePathname();

  const isAutocompleteSticky = pathname === "/community";
  const isAutocompleteShown = pathname !== "/settings";

  return (
    <View style={{ flex: 1 }}>
      {isAutocompleteShown && (
        <BookAutocomplete isSticky={isAutocompleteSticky} />
      )}
      <View style={{ flex: 1 }}>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "#2563eb",
            headerShown: false,
          }}
        >
          {tabs.map(({ name, options }) => (
            <Tabs.Screen
              key={name}
              name={name}
              options={{
                ...("icon" in options
                  ? {
                      tabBarIcon: ({ color }) => (
                        <TabIcon as={options.icon} color={color} />
                      ),
                    }
                  : {}),
                ...options,
              }}
            />
          ))}
        </Tabs>
      </View>
    </View>
  );
}
