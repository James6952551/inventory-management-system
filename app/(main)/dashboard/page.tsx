import Header from "@/components/Header";
import { statsHeaderItems } from "@/constants";
import DashboardView from "./dashboard-view";
import { prisma } from "@/lib/prisma";
import { getStoreStocks } from "../stock/actions";

export const instant = false;

// Reusable helper so totalProfits and NovemberProfits stay mathematically identical
function calculateLogProfit(log: {
    changeAmount: number;
    product: {
        sellingPrice: { toNumber: () => number };
        costPrice: { toNumber: () => number };
    };
}) {
    const quantity = Math.abs(log.changeAmount);
    const sellingPrice = log.product.sellingPrice.toNumber();
    const costPrice = log.product.costPrice.toNumber();
    return (sellingPrice - costPrice) * quantity;
}

export default async function DashboardPage() {
    // Run independent database queries in parallel
    const [storeStocks, productsCount, storesCount, saleStockLogs] = await Promise.all([
        getStoreStocks(),
        prisma.product.count(),
        prisma.store.count(),
        prisma.stockLog.findMany({
            where: { reason: "SALE" },
            include: { product: true },
        }),
    ]);

    const dashboardConfig = statsHeaderItems.find(
        (item) => item.pageTitle === "Dashboard"
    );

    if (!dashboardConfig) {
        return <div>Configuration not found for Dashboard page.</div>;
    }

    // Calculate all-time total profits
    const totalProfits = saleStockLogs.reduce(
        (total, log) => total + calculateLogProfit(log),
        0
    );

    // Filter by log.createdAt (when the sale happened) & use the same profit formula
    const novemberSaleLogs = saleStockLogs.filter((log) => {
        const date = new Date(log.createdAt);
        return date.getMonth() === 10 && date.getFullYear() === 2026;
    });

    const NovemberProfits = novemberSaleLogs.reduce(
        (total, log) => total + calculateLogProfit(log),
        0
    );

    const belowMinimum = storeStocks.filter(
        (storeStock) => storeStock.quantity < storeStock.minStockThreshold
    );

    const stats = [
        {
            cardTitle: "Total Profits",
            value: `$${totalProfits.toFixed(2)}`,
            subline: "All-time net profit",
        },
        {
            cardTitle: "Total Products",
            value: productsCount,
            subline: "Available products",
        },
        {
            cardTitle: "Low Stock Product",
            value: belowMinimum.length,
            subline: "Review your stock level",
        },
        {
            cardTitle: "Active Stores",
            value: storesCount,
            subline: "Available stores",
        },
    ];

    return (
        <div className="bg-gray-50 w-full">
            <Header />
            <DashboardView
                dashboardConfig={dashboardConfig}
                stats={stats}
                belowMinimum={belowMinimum.length}
                NovemberProfits={Number(NovemberProfits.toFixed(2))}
            />
        </div>
    );
}