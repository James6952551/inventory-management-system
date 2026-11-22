'use client';

import { Modal } from "@/components/Modal";
import StatsHeader from "@/components/StatsHeader";
import { Category, Store, Supplier } from "@/generated/prisma/client";
import React, { ChangeEvent, useState } from "react";
import { addOrUpdateStoreStocksWithLog, deleteStock, getStoreStocks } from "./actions";
import StockTable from "./stock-table";
import { ProductWithRelations } from "../product/product-view";

export type StoreStockWithRelations = Awaited<ReturnType<typeof getStoreStocks>>[number];

interface StockViewProps {
    storeStocks: StoreStockWithRelations[],
    products: ProductWithRelations[],
    categories: Category[],
    stores: Store[],
    suppliers: Supplier[],
    stockConfig: { 
        pageTitle: string,
        buttonText: string,
        subline: string
    },  
}

export default function StockView({ 
    storeStocks,
    products,
    categories,
    stores,
    suppliers,
    stockConfig, 
} : StockViewProps
) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [searchKey, setSearchKey] = useState("")

    const [showStatus, setShowStatus] = useState("")

    const [showEntry, setShowEntry] = useState('10')

    const [selectingStore, setSelectingStore] = useState(() => {
        // set the default selecting store
        const defaultStore = stores.find((store) => {
            return store.name === "Store A"
        })
        return defaultStore
    })

    const [isAdding, setIsAdding] = useState(false)

    const [selectingProduct, setSelectingProduct] = useState<ProductWithRelations>()
    
    const [error, setErrorMessage] = useState<string | undefined>("")

    const totalStock = storeStocks.reduce((totalValue, currentValue) => {
        return totalValue + currentValue.quantity
    }, 0)

    const belowMinimum = storeStocks.filter((storeStock) => { return storeStock.quantity < storeStock.minStockThreshold })

    const stats = [
        { 
            cardTitle: 'Total Stock Units',
            value: totalStock,
            subline: 'Products shown in this view'
        },
        {
            cardTitle: 'Below minimum',
            value: belowMinimum.length,
            subline: 'Review stock'
        },
        {
            cardTitle: 'Selected store',
            value: selectingStore?.name ?? "",
            subline: 'Current store filter'
        }
    ]


    async function handleAddStock(event: React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault()
            setIsAdding(true)
            setErrorMessage("")
    
            const formData = new FormData(event.currentTarget)           
            const storeId = formData.get("store") as string
            const productId = formData.get("product") as string
            const quantity = Number(formData.get("quantity") as string)
            const minStockThreshold = Number(formData.get("minStockThreshold") as string)

            const result = await addOrUpdateStoreStocksWithLog({ 
                storeId,
                productId, 
                quantity,
                minStockThreshold
            }, {
                storeId,
                productId,
                quantity,
                reason: "RESTOCK",
                notes: "Initialization of stock"
            })
            if (!result.success) {
                setErrorMessage(result.error)
                return
            }
            
            setIsModalOpen(false)
            setIsAdding(false)
            setSelectingProduct(undefined)
        }

        const filteredRecords = () => {
            // get the specific store stocks based on store Id
            const filteredStoreStocks = storeStocks.filter((storeStock) => {
                return storeStock.storeId === selectingStore?.id
            })

            let statusFiltered: StoreStockWithRelations[] = filteredStoreStocks
            
            // filter the records based on stock status
            if (showStatus === "In stock") {
                statusFiltered = filteredStoreStocks.filter((stock) => {
                    return stock.quantity >= stock.minStockThreshold
                })
            } else if (showStatus === "Low stock") {
                statusFiltered = filteredStoreStocks.filter((stock) => {
                    return stock.quantity < stock.minStockThreshold
                })
            } else if (showStatus === "All") {
                statusFiltered = filteredStoreStocks
            }

            // filter the records based on search key
            const searchKeyFiltered = statusFiltered.filter((stock) => {
                const lowerCaseName = stock.product.name.toLowerCase()
                const lowerCaseSearchKey = searchKey.toLowerCase()
                return lowerCaseName.includes(lowerCaseSearchKey)
            })

            // restrict the entry number 
            const storeStocksCopy = Array.from(searchKeyFiltered)
            storeStocksCopy.length = Number(showEntry)

            return storeStocksCopy
        }       

        async function getProductById(event: ChangeEvent<HTMLSelectElement>) {
            const product = products.find((product) => {
                return product.id === event.currentTarget.value
            })

            setSelectingProduct(product)
        }

    return ( 
        <>
            {/* Stats Header */}
            <StatsHeader 
                pageTitle={stockConfig?.pageTitle}
                buttonText={stockConfig?.buttonText}
                subline={stockConfig?.subline}
                stats={stats}
                onAction={() => setIsModalOpen(true)}
            />
            <div className="px-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="font-bold tracking-wide">Store inventory</p>
                            <div className="flex items-center gap-6">
                                <input
                                    type="text"
                                    placeholder="Search product name"
                                    onChange={((e) => { setSearchKey(e.currentTarget.value) })}
                                    className="bg-slate-100 rounded-md py-2 px-4 focus:outline-none w-full sm:w-80 md:w-96 lg:w-[420px]"
                                />
                                <select 
                                    onChange={(e) => { setShowStatus(e.currentTarget.value) }}
                                    className="p-2 rounded border border-gray-300 focus:outline-none focus:border-black w-full"
                                >
                                    <option value="All">Stock status: All</option>
                                    <option value="In stock">Stock status: In stock</option>
                                    <option value="Low stock">Stock status: Low stock</option>
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
                                <p className="whitespace-nowrap">{storeStocks.length} items</p>
                            </div>        
                        </div>
                        <div className="space-x-2">
                            {stores.map((store) => (
                                <button 
                                    key={store.id}
                                    onClick={(e) => setSelectingStore(store)}  
                                    className={`px-4 py-2 text-sm tracking-wide text-center rounded hover:bg-blue-200/50 hover:text-blue-700 ${selectingStore?.id === store.id? "bg-blue-200/50 text-blue-700": "text-slate-400"}`}
                                >
                                    {store.name}
                                </button>
                            ))}
                        </div>
                        {/* Main table */}
                        <StockTable 
                            storeStocks={filteredRecords()}
                            categories={categories}
                            suppliers={suppliers}
                            onUpdate={addOrUpdateStoreStocksWithLog}
                            onDelete={deleteStock}
                        />

                        {/* Modal for adding category */}
                        <Modal 
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Add New Stock"
                        >
                            <form onSubmit={handleAddStock} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Product Name
                                    </label>
                                    <select 
                                        name="product"
                                        onChange={(e) => { getProductById(e) }}
                                        className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                                    >
                                        <option value="">Select Product</option>
                                        {products && products.map((product) => (
                                            <option 
                                                key={product.id} 
                                                value={product.id}
                                            >
                                                {product.name}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        SKU
                                    </label>
                                    <div className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black">
                                        {selectingProduct?.sku}
                                    </div>                   
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Category
                                    </label>
                                    <div className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black">
                                        {selectingProduct?.category.name}
                                    </div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Selling Price
                                    </label>
                                    <div className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black">
                                        {selectingProduct?.sellingPrice.toFixed(2)}
                                    </div>          
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Store
                                    </label>
                                    <select 
                                        name="store"
                                        className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                                    >
                                        {stores && stores.map((store) => (
                                            <option 
                                                key={store.id} 
                                                value={store.id}
                                            >
                                                {store.name}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Minimum Stock
                                    </label>
                                    <input
                                        type="number"
                                        name="minStockThreshold"
                                        min="5"
                                        required
                                        className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                                    />  
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Quantity
                                    </label>
                                    <input
                                        type="number"
                                        name="quantity"
                                        min="1"
                                        required
                                        className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                                    />      
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Supplier
                                    </label>
                                    <div className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black">
                                        {selectingProduct?.supplier.name}
                                    </div>                                                   
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
                                        {isAdding? 'Saving...': 'Save Stock'}
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