import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import * as React from "react";
import { Pressable, TextInput, View, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Feather from "@expo/vector-icons/Feather";
import { router } from "expo-router";
import { useAuthStore } from "@/store/useAuthStore";

export function SignInForm() {
  const setUser = useAuthStore((state) => state.setUser);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const passwordInputRef = React.useRef<TextInput>(null);

  function onEmailSubmitEditing() {
    passwordInputRef.current?.focus();
  }

  async function onSubmit() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("http://192.168.29.192:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Login failed", data.message || "Invalid credentials");
        return;
      }

      console.log("Token:", data.token);
      console.log("User:", data.user);
      setUser({
        id: data.user.id,
        email: data.user.email,
        role: data.user.role,
      });
      // Alert.alert("Success", "Logged in successfully!");
      router.push("/(tabs)/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="min-h-screen w-full justify-center items-center">
      <Card className="border-border/0 sm:border-border shadow-none sm:shadow-sm sm:shadow-black/5">
        <CardHeader>
          <CardTitle className="text-center text-xl sm:text-left">
            Sign in to your Inventory 📦
          </CardTitle>
          <CardDescription className="text-center sm:text-left">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="gap-6">
          <View className="gap-6">
            {/* Email Field */}
            <View className="gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                placeholder="m@example.com"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
                onChangeText={setEmail}
                value={email}
                onSubmitEditing={onEmailSubmitEditing}
                returnKeyType="next"
              />
            </View>

            {/* Password Field */}
            <View className="gap-1.5 relative w-full">
              <Label htmlFor="password">Password</Label>
              <Input
                ref={passwordInputRef}
                id="password"
                secureTextEntry={!showPassword}
                onChangeText={setPassword}
                value={password}
                className="pr-10" // add padding so text doesn't overlap the icon
                returnKeyType="send"
                onSubmitEditing={onSubmit}
              />
              <Pressable
                className="absolute right-3 top-[68%] -translate-y-1/2"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Feather
                  name={showPassword ? "eye" : "eye-off"}
                  size={20} // smaller size
                  color="gray"
                />
              </Pressable>
            </View>

            {/* Submit Button */}
            <Button className="w-full" onPress={onSubmit} disabled={loading}>
              <Text>{loading ? "Loading..." : "Continue"}</Text>
            </Button>
          </View>
        </CardContent>
      </Card>
    </SafeAreaView>
  );
}
