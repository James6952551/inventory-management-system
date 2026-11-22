import Header from "@/components/Header";
import { statsHeaderItems } from "@/constants"
import { getCategories } from "./actions";
import CategoryView from "./category-view";
import { prisma } from "@/lib/prisma";

export const instant = false;

export default async function CategoryPage() {
    const categories = await getCategories()

    const productsCount = await prisma.product.count()

    const unassignedCategory = categories.filter((category) => {
        return category.products.length <= 0
    })

    const categoryConfig = statsHeaderItems.find(item => item.pageTitle === "Category")

    // Safe fallback check in case the config is missing
    if (!categoryConfig) {
        return <div>Configuration not found for Category page.</div>
    }

    const stats = [
        { 
            cardTitle: 'Total Categories',
            value: categories.length,
            subline: 'Categories shown in this view'
        },
        {
            cardTitle: 'Total Products Assigned',
            value: productsCount,
            subline: 'Products assigned'
        },
        {
            cardTitle: 'Unassigned Categories',
            value: unassignedCategory.length,
            subline: 'Categories with no products'
        }
    ]

    

    return (
        <div className="bg-gray-50 w-full">
            {/* Header */}
            <Header />
            <CategoryView 
                categories={categories}
                categoryConfig={categoryConfig}   
                stats={stats} 
            />
            
        </div>
    )
}
         
    
