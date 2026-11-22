'use client';

import { Modal } from "@/components/Modal";
import StatsHeader from "@/components/StatsHeader";
import { Category, Product, Supplier } from "@/generated/prisma/client";
import { useState } from "react";
import { addProduct, deleteProduct, getProducts, updateProduct } from "./actions";
import SupplierTable from "./product-table";
import React from "react";
import { StoreStockWithRelations } from "../stock/stock-view";
import { useRole } from "@/context/role-context";

export type ProductWithRelations = Awaited<ReturnType<typeof getProducts>>[number]

interface ProductViewProps {
    products: ProductWithRelations[],
    categories: Category[],
    suppliers: Supplier[],
    productConfig: { 
        pageTitle: string,
        buttonText: string,
        subline: string
    },
    stats: { 
        cardTitle: string,
        value: number,
        subline: string
    }[],
}

export default function ProductView({ 
    products, 
    categories,
    suppliers,
    productConfig, 
    stats
} : ProductViewProps
) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [searchKey, setSearchKey] = useState("")

    const [showCategory, setShowCategory] = useState("")
    
    const [showEntry, setShowEntry] = useState('10')
    
    const [isAdding, setIsAdding] = useState(false)
    
    const [error, setErrorMessage] = useState<string | undefined>("")

    const role = useRole()

    async function handleAddProduct(event: React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault()
            setIsAdding(true)
            setErrorMessage("")
    
            const formData = new FormData(event.currentTarget)
            const name = formData.get("name") as string
            const sku = formData.get("sku") as string
            const costPrice = Number(formData.get("costPrice") as string)
            const sellingPrice = Number(formData.get("sellingPrice") as string)
            const categoryId = formData.get("category") as string
            const supplierId = formData.get("supplier") as string

            const result = await addProduct({ 
                name, 
                sku, 
                costPrice, 
                sellingPrice, 
                categoryId, 
                supplierId
            })
            if (!result.success) {
                setErrorMessage(result.error)
                return
            }
            
            setIsModalOpen(false)
            setIsAdding(false)
        }

    const filteredRecords = () => {
        let categoryFiltered: ProductWithRelations[] = products
        
        // filter the records based on category
        if (showCategory) {
            categoryFiltered = products.filter((product) => {
                return product.categoryId === showCategory
            })
        }

        // filter the records based on search key
        const filtered = categoryFiltered.filter((product) => {
            const lowerCaseName = product.name.toLowerCase()
            const lowerCaseSearchKey = searchKey.toLowerCase()
            return lowerCaseName.includes(lowerCaseSearchKey)
        })

        // restrict the entry number 
        const productsCopy = Array.from(filtered)
        productsCopy.length = Number(showEntry)

        return productsCopy
    }  

    return ( 
        <>
            {/* Stats Header */}
            <StatsHeader 
                pageTitle={productConfig?.pageTitle}
                buttonText={productConfig?.buttonText}
                subline={productConfig?.subline}
                stats={stats}
                onAction={role === "STAFF"? undefined: () => setIsModalOpen(true)}
            />
            <div className="px-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="font-bold tracking-wide">Product directory</p>
                            <div className="flex items-center gap-6">
                                <input
                                    type="text"
                                    placeholder="Search product name"
                                    onChange={((e) => { setSearchKey(e.currentTarget.value) })}
                                    className="bg-slate-100 rounded-md py-2 px-4 focus:outline-none w-full sm:w-80 md:w-96 lg:w-[420px]"
                                />
                                <select 
                                    onChange={(e) => { setShowCategory(e.currentTarget.value) }}
                                    className="p-2 rounded border border-gray-300 focus:outline-none focus:border-black w-full"
                                >
                                    <option value="">All products</option>
                                    {categories && categories.map((category) => (
                                        <option 
                                            key={category.id}
                                            value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                                <p>
                                    Show 
                                    <input 
                                        type="number" 
                                        min="1" 
                                        defaultValue="10" 
                                        onChange={(e) => { setShowEntry(e.currentTarget.value) }}
                                        className="border border-gray-300 focus:outline-none focus:border-black w-16" 
                                    /> 
                                    entries
                                </p>
                                <p className="whitespace-nowrap">{products.length} items</p>
                            </div>
                        </div>
                        {/* Main table */}
                        <SupplierTable 
                            products={filteredRecords()}
                            categories={categories}
                            suppliers={suppliers}
                            onUpdate={updateProduct}
                            onDelete={deleteProduct}
                        />

                        {/* Modal for adding category */}
                        <Modal 
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Add New Product"
                        >
                            <form onSubmit={handleAddProduct} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Product Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                                    />
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        SKU
                                    </label>
                                    <input
                                        type="text"
                                        name="sku"
                                        required
                                        className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                                    />
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Category
                                    </label>
                                    <select 
                                        name="category"
                                        className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                                    >
                                        {categories && categories.map((category) => (
                                            <option 
                                                key={category.id} 
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Cost Price
                                    </label>
                                    <input
                                        type="number"
                                        name="costPrice"
                                        step="0.01"
                                        className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                                    />
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Selling Price
                                    </label>
                                    <input
                                        type="number"
                                        name="sellingPrice"
                                        step="0.01"
                                        className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                                    />
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Category
                                    </label>
                                    <select 
                                        name="supplier"
                                        className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                                    >
                                        {suppliers && suppliers.map((supplier) => (
                                            <option 
                                                key={supplier.id} 
                                                value={supplier.id}
                                            >
                                                {supplier.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isAdding}
                                        className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
                                    >
                                        {isAdding? 'Saving...': 'Save Product'}
                                    </button>
                                    {error && (
                                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </form>
                        </Modal>
                </div>
            </div>        
        </>
    )
}