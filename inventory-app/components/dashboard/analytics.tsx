import { API_URL } from "@/constants/api";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  useColorScheme,
  StyleSheet,
} from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { Product } from "../ProductList";

export interface Category {
  id: string;
  name: string;
}

type CategoryStats = {
  count: number;
  value: number;
};

const AnalyticsDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

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

    const colors = ["#2563eb", "#F59E0B", "#10B981", "#8B5CF6", "#EC4899"];

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
          frontColor: index === 0 ? "#2563eb" : "#60a5fa",
        };
      });

  // Stock alert levels
  const getStockAlerts = () => {
    const lowStock = products.filter((p) => p.quantity < 20).length;
    const goodStock = products.filter((p) => p.quantity >= 20).length;

    return [
      { value: lowStock, color: "#dc2626", text: "Low Stock" },
      { value: goodStock, color: "#10B981", text: "Good Stock" },
    ];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
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
      style={[
        styles.container,
        { backgroundColor: isDark ? "#000000" : "#ffffff" },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#2563eb"]}
        />
      }
    >
      <View style={styles.content}>
        {/* Title */}
        <Text style={[styles.title, isDark && styles.titleDark]}>
          Analytics
        </Text>

        {/* Key Metrics - Simple & Clear */}
        <View style={styles.metricsSection}>
          <View style={styles.totalValueCard}>
            <Text style={[styles.metricLabel, isDark && styles.textDark]}>
              Total Inventory Value
            </Text>
            <Text style={[styles.totalValueText, isDark && styles.textDark]}>
              ₹{(totalValue / 1000).toFixed(1)}k 💸
            </Text>
          </View>

          <View style={styles.metricsRow}>
            <View
              style={[
                styles.metricCard,
                { backgroundColor: isDark ? "#1f2937" : "#ffffff" },
              ]}
            >
              <Text
                style={[styles.metricLabelSmall, isDark && styles.textDark]}
              >
                Products
              </Text>
              <Text style={[styles.metricValue, isDark && styles.textDark]}>
                {products.length}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text
                style={[styles.metricLabelSmall, isDark && styles.textDark]}
              >
                Total Units
              </Text>
              <Text style={[styles.metricValue, isDark && styles.textDark]}>
                {totalStock}
              </Text>
            </View>

            <View style={styles.metricCard}>
              <Text
                style={[styles.metricLabelSmall, isDark && styles.textDark]}
              >
                Categories
              </Text>
              <Text style={[styles.metricValue, isDark && styles.textDark]}>
                {categoryData.length}
              </Text>
            </View>
          </View>
        </View>

        {/* Top 5 Products - FIXED BAR CHART */}
        <View
          style={[
            styles.chartCard,
            { backgroundColor: isDark ? "#1f2937" : "#ffffff" },
          ]}
        >
          <Text style={[styles.chartTitle, isDark && styles.textDark]}>
            🏆 Top 5 Products
          </Text>
          <Text style={[styles.chartSubtitle, isDark && styles.textDark]}>
            Highest value items in stock
          </Text>

          <View style={styles.chartContainer}>
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
              xAxisColor="#e5e7eb"
              hideRules
              showGradient
              gradientColor="#60a5fa"
              noOfSections={4}
              maxValue={Math.max(...topProductsData.map((d) => d.value)) * 1.2}
              yAxisTextStyle={{ color: "#6b7280", fontSize: 10 }}
              xAxisLabelTextStyle={{
                color: "#6b7280",
                fontSize: 11,
                fontWeight: "500",
              }}
            />
          </View>
        </View>

        {/* Stock Alerts - Simplified */}
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, isDark && styles.textDark]}>
            📦 Stock Status
          </Text>
          <Text style={[styles.chartSubtitle, isDark && styles.textDark]}>
            Products by stock level
          </Text>

          <View style={styles.pieChartContainer}>
            <PieChart
              data={stockAlertData}
              radius={100}
              innerRadius={60}
              donut
              innerCircleColor="#ffffff"
              centerLabelComponent={() => (
                <View>
                  <Text
                    style={[
                      styles.pieChartCenterValue,
                      isDark && styles.textDark,
                    ]}
                  >
                    {products.length}
                  </Text>
                  <Text
                    style={[
                      styles.pieChartCenterLabel,
                      isDark && styles.textDark,
                    ]}
                  >
                    Products
                  </Text>
                </View>
              )}
            />
          </View>

          <View style={styles.stockAlertsLegend}>
            {stockAlertData.map((alert, idx) => (
              <View key={idx} style={styles.alertItem}>
                <View style={styles.alertHeader}>
                  <View
                    style={[
                      styles.alertColorDot,
                      { backgroundColor: alert.color },
                    ]}
                  />
                  <Text style={[styles.alertText, isDark && styles.textDark]}>
                    {alert.text}
                  </Text>
                </View>
                <Text style={[styles.alertValue, isDark && styles.textDark]}>
                  {alert.value}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Categories Distribution */}
        <View style={styles.chartCard}>
          <Text style={[styles.chartTitle, isDark && styles.textDark]}>
            📊 By Category
          </Text>
          <Text style={[styles.chartSubtitle, isDark && styles.textDark]}>
            Units distributed across categories
          </Text>

          <View style={styles.categoryPieContainer}>
            <PieChart
              data={categoryData}
              radius={90}
              textColor={isDark ? "#000000" : "#ffffff"}
              textSize={12}
              fontWeight="bold"
              showText
              showValuesAsLabels
            />
          </View>

          <View style={styles.categoryList}>
            {categoryData.map((cat, idx) => (
              <View key={idx} style={styles.categoryItem}>
                <View style={styles.categoryItemLeft}>
                  <View
                    style={[
                      styles.categoryColorBox,
                      { backgroundColor: cat.color },
                    ]}
                  />
                  <Text
                    style={[styles.categoryName, isDark && styles.textDark]}
                  >
                    {cat.text}
                  </Text>
                </View>
                <Text style={[styles.categoryValue, isDark && styles.textDark]}>
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    marginTop: 64,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 12,
    paddingHorizontal: 24,
    color: "#1f2937",
  },
  titleDark: {
    color: "#ffffff",
  },
  textDark: {
    color: "#ffffff",
  },
  metricsSection: {
    marginBottom: 12,
  },
  totalValueCard: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
    color: "#1f2937",
  },
  totalValueText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1f2937",
  },
  metricsRow: {
    flexDirection: "row",
    padding: 14,
    gap: 6,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  metricLabelSmall: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
    color: "#1f2937",
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1f2937",
  },
  chartSubtitle: {
    fontSize: 14,
    marginBottom: 24,
    color: "#6b7280",
  },
  chartContainer: {
    height: 240,
  },
  pieChartContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  pieChartCenterValue: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1f2937",
  },
  pieChartCenterLabel: {
    fontSize: 12,
    textAlign: "center",
    color: "#1f2937",
  },
  stockAlertsLegend: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  alertItem: {
    alignItems: "center",
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  alertColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  alertText: {
    fontSize: 14,
    color: "#1f2937",
  },
  alertValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  categoryPieContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  categoryList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  categoryItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  categoryColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1f2937",
  },
  categoryValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
  },
});

export default AnalyticsDashboard;
