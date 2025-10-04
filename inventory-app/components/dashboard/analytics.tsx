import { API_URL } from "@/constants/api";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
} from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";

export interface Category {
  id: string;
  name: string;
}

type CategoryStats = {
  count: number;
  value: number;
};

export interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  price: string;
  imageUrl?: string;
  barcodeUrl: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

const AnalyticsDashboard = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/get-all`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setProducts(result.data as Product[]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  // Calculate total inventory value
  const getTotalInventoryValue = () =>
    products.reduce((sum, p) => sum + parseFloat(p.price) * p.quantity, 0);

  // Get total stock quantity
  const getTotalStock = () => products.reduce((sum, p) => sum + p.quantity, 0);

  // Category breakdown
  const getCategoryDistribution = () => {
    const categoryMap: Record<string, CategoryStats> = {};
    products.forEach((p) => {
      const catName = p.category.name;
      if (!categoryMap[catName]) {
        categoryMap[catName] = { count: 0, value: 0 };
      }
      categoryMap[catName].count += p.quantity;
      categoryMap[catName].value += parseFloat(p.price) * p.quantity;
    });

    const colors = ["#0EA5E9", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];

    return Object.entries(categoryMap).map(([name, data], index) => ({
      value: data.count,
      text: name,
      color: colors[index % colors.length],
    }));
  };

  // Top 5 most valuable products
  const getTopProducts = () =>
    [...products]
      .sort(
        (a, b) =>
          parseFloat(b.price) * b.quantity - parseFloat(a.price) * a.quantity
      )
      .slice(0, 5)
      .map((p, index) => {
        const value = parseFloat(p.price) * p.quantity;
        return {
          value: value,
          label: p.name.length > 12 ? p.name.substring(0, 10) + ".." : p.name,
          frontColor: index === 0 ? "#0EA5E9" : "#38BDF8",
        };
      });

  // Stock alert levels
  const getStockAlerts = () => {
    const lowStock = products.filter((p) => p.quantity < 20).length;
    const goodStock = products.filter((p) => p.quantity >= 20).length;

    return [
      { value: lowStock, color: "#EF4444", text: "Low Stock" },
      { value: goodStock, color: "#10B981", text: "Good Stock" },
    ];
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

  const totalValue = getTotalInventoryValue();
  const totalStock = getTotalStock();
  const categoryData = getCategoryDistribution();
  const topProductsData = getTopProducts();
  const stockAlertData = getStockAlerts();

  return (
    <ScrollView
      className="flex-1 bg-background"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#0EA5E9"]}
        />
      }
    >
      <View className="mt-16">
        {/* Title */}
        <Text
          className={`text-4xl font-bold mb-3 px-6 ${isDark ? "text-white" : "text-black"}`}
        >
          Analytics
        </Text>

        {/* Key Metrics - Simple & Clear */}
        <View className="mb-3">
          <View className="rounded-2xl p-6 mb-3">
            <Text
              className={`text-sm font-medium mb-1 ${isDark ? "text-white" : "text-black"}`}
            >
              Total Inventory Value
            </Text>
            <Text
              className={`text-3xl font-bold ${isDark ? "text-white" : "text-black"}`}
            >
              ₹{(totalValue / 1000).toFixed(1)}k 💸
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1 bg-card rounded-2xl p-5 shadow-sm">
              <Text
                className={`text-xs font-medium mb-1 ${isDark ? "text-white" : "text-black"}`}
              >
                Products
              </Text>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}
              >
                {products.length}
              </Text>
            </View>

            <View className="flex-1 bg-card rounded-2xl p-5 shadow-sm">
              <Text
                className={`text-xs font-medium mb-1 ${isDark ? "text-white" : "text-black"}`}
              >
                Total Units
              </Text>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}
              >
                {totalStock}
              </Text>
            </View>

            <View className="flex-1 bg-card rounded-2xl p-5 shadow-sm">
              <Text
                className={`text-xs font-medium mb-1 ${isDark ? "text-white" : "text-black"}`}
              >
                Categories
              </Text>
              <Text
                className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}
              >
                {categoryData.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Top 5 Products - FIXED BAR CHART */}
        <View className="bg-card rounded-2xl p-5 mb-6 shadow-md">
          <Text
            className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}
          >
            🏆 Top 5 Products
          </Text>
          <Text
            className={`text-sm mb-6 ${isDark ? "text-white" : "text-black"}`}
          >
            Highest value items in stock
          </Text>

          <View style={{ height: 240 }}>
            <BarChart
              data={topProductsData}
              barWidth={40}
              barBorderRadius={8}
              spacing={30}
              height={200}
              initialSpacing={20}
              endSpacing={20}
              yAxisThickness={0}
              xAxisThickness={1}
              xAxisColor="#E5E7EB"
              hideRules
              showGradient
              gradientColor="#38BDF8"
              noOfSections={4}
              maxValue={Math.max(...topProductsData.map((d) => d.value)) * 1.2}
              yAxisTextStyle={{ color: "#9CA3AF", fontSize: 10 }}
              xAxisLabelTextStyle={{
                color: "#6B7280",
                fontSize: 11,
                fontWeight: "500",
              }}
            />
          </View>
        </View>

        {/* Stock Alerts - Simplified */}
        <View className="bg-card rounded-2xl p-5 mb-6 shadow-md">
          <Text
            className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}
          >
            📦 Stock Status
          </Text>
          <Text
            className={`text-sm mb-6 ${isDark ? "text-white" : "text-black"}`}
          >
            Products by stock level
          </Text>

          <View className="flex-row items-center justify-center mb-6">
            <PieChart
              data={stockAlertData}
              radius={100}
              innerRadius={60}
              donut
              innerCircleColor="#FFFFFF"
              centerLabelComponent={() => (
                <View>
                  <Text
                    className={`text-3xl font-bold text-center ${isDark ? "text-white" : "text-black"}`}
                  >
                    {products.length}
                  </Text>
                  <Text
                    className={`text-xs text-center ${isDark ? "text-white" : "text-black"}`}
                  >
                    Products
                  </Text>
                </View>
              )}
            />
          </View>

          <View className="flex-row justify-around pt-4 border-t border-border">
            {stockAlertData.map((alert, idx) => (
              <View key={idx} className="items-center">
                <View className="flex-row items-center mb-2">
                  <View
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: alert.color }}
                  />
                  <Text
                    className={`text-sm ${isDark ? "text-white" : "text-black"}`}
                  >
                    {alert.text}
                  </Text>
                </View>
                <Text
                  className={`text-2xl font-bold ${isDark ? "text-white" : "text-black"}`}
                >
                  {alert.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Categories Distribution */}
        <View className="bg-card rounded-2xl p-5 mb-6 shadow-md">
          <Text
            className={`text-xl font-bold mb-2 ${isDark ? "text-white" : "text-black"}`}
          >
            📊 By Category
          </Text>
          <Text
            className={`text-sm mb-6 ${isDark ? "text-white" : "text-black"}`}
          >
            Units distributed across categories
          </Text>

          <View className="items-center mb-4">
            <PieChart
              data={categoryData}
              radius={90}
              textColor="#FFFFFF"
              textSize={12}
              fontWeight="bold"
              showText
              showValuesAsLabels
            />
          </View>

          <View className="space-y-2">
            {categoryData.map((cat, idx) => (
              <View
                key={idx}
                className="flex-row items-center justify-between py-2 border-b border-border"
              >
                <View className="flex-row items-center">
                  <View
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: cat.color }}
                  />
                  <Text
                    className={`text-sm font-medium ${isDark ? "text-white" : "text-black"}`}
                  >
                    {cat.text}
                  </Text>
                </View>
                <Text
                  className={`text-sm font-bold ${isDark ? "text-white" : "text-black"}`}
                >
                  {cat.value} units
                </Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default AnalyticsDashboard;
