import { Modal } from "@/components/Modal";
import { StockLogInput, StoreStockInput } from "@/lib/validations";
import React, { useState } from "react";
import { Category, Supplier } from "@/generated/prisma/client";
import { StoreStockWithRelations } from "./stock-view";
import { logReasons } from "@/constants";

interface StockTableProps {
    storeStocks: StoreStockWithRelations[];
    categories: Category[];
    suppliers: Supplier[];
    onUpdate: (storeStockInput: StoreStockInput, stockLogInput: StockLogInput) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

type Product = {
        name: string,
        sku: string,
        category: string,
        supplier: string,
        sellingPrice: number,
    }

type StoreStockFormState = {
    storeStock: StoreStockInput;
    stockLog: StockLogInput;
    product: Product,
} | null

export default function ProductTable({ 
    storeStocks, 
    categories, 
    suppliers, 
    onUpdate, 
    onDelete 
} : StockTableProps
) {
        const [isModalOpen, setIsModalOpen] = useState(false)

        const [isUpdating, setIsUpdating] = useState(false)
        
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

        const [isDeleting, setIsDeleting] = useState(false)

        const [error, setErrorMessage] = useState<string | undefined>("")
    
        const [editingStock, setEditingStock] = useState<StoreStockFormState>(null)

        const [deletingProductId, setDeletingProductId] = useState<string>('')

        function handleModalOpen(
            storeStockInput: StoreStockInput, 
            stockLogInput: StockLogInput, 
            product: Product
        ) {
            setIsModalOpen(true)
            setEditingStock({
                storeStock: storeStockInput, 
                stockLog: stockLogInput,
                product: product
            })
        }

        function handleDeleteModalOpen(id: string) {
            setIsDeleteModalOpen(true)
            setDeletingProductId(id)
        }
        
        async function handleUpdate(event: React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault()

            if (!editingStock) {
                return 
            }    

            setIsUpdating(true)

            const storeStockInput = editingStock.storeStock   
            const stockLogInput = editingStock.stockLog

            const result = await onUpdate(storeStockInput, stockLogInput)

            if (!result.success) {
                console.error(result.error)
                setErrorMessage(result.error)
            }

            setIsModalOpen(false)
            setIsUpdating(false)
        }

        async function handleDelete() {
            setIsDeleting(true)

            const result = await onDelete(deletingProductId)

            if (!result.success) {
                console.error(result.error)
                setErrorMessage(result.error)
            }

            setIsDeleteModalOpen(false)
            setIsDeleting(false)
        }

        function getSupplierById(id: string) {
            const supplier = suppliers.find((supplier) => {
                return supplier.id === id
            })

            return supplier
        }

    return ( 
        <>
            {/* Table displaying data */}
            <table className="w-full">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide w-1/12">No</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Product</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">SKU</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Minimum Stock</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Qty</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Selling Price</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Supplier</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {storeStocks && storeStocks.map((storeStock, index) => {
                        const storeStockInput = {
                            storeId: storeStock.storeId,
                            productId: storeStock.productId,
                            quantity: 0,
                            minStockThreshold: storeStock.minStockThreshold
                        }

                        const stockLogInput: StockLogInput = {
                            storeId: storeStock.storeId,
                            productId: storeStock.productId,
                            quantity: storeStock.quantity,
                            reason: "RESTOCK",
                            notes: ""
                        }

                        const category = categories.find((category) => {
                            return category.id === storeStock.product.categoryId
                        })     
                        
                        const supplier = getSupplierById(storeStock.product.supplierId) ?? { name: "Unknown" }

                        const product: Product = {
                            name: storeStock.product.name,
                            sku: storeStock.product.sku,
                            category: category?.name ?? "Unknown",
                            supplier: supplier.name,
                            sellingPrice: storeStock.product.sellingPrice
                        }
                        
                        return (
                    <tr key={storeStock.product.id}>
                        <td className="px-4 py-2 text-sm">{ index + 1 }</td>
                        <td className="px-4 py-2 text-sm">{ storeStock.product.name }</td>
                        <td className="px-4 py-2 text-sm">{ storeStock.product.sku }</td>
                        <td className="px-4 py-2 text-sm">{ storeStock.minStockThreshold }</td>
                        <td className="px-4 py-2 text-sm">{ storeStock.quantity }</td>
                        <td className="px-4 py-2 text-sm">${ storeStock.product.sellingPrice.toFixed(2) }</td>
                        <td className="px-4 py-2 text-sm">{ supplier.name }</td>
                        <td className="px-4 py-2 text-sm">{ storeStock.quantity < storeStock.minStockThreshold? (
                            <p className="p-2 bg-yellow-50 text-yellow-700 text-sm text-center rounded">Low stock</p>
                        ): (
                            <p className="p-2 bg-green-50 text-green-700 text-sm text-center rounded">In stock</p>
                        ) }
                        </td>
                        <td className="px-4 py-2 text-sm space-x-6">
                            <button 
                                onClick={() => handleModalOpen(storeStockInput, stockLogInput, product)}
                                className="text-xs text-blue-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={(e) => handleDeleteModalOpen(storeStock.id)}
                                className="text-xs text-slate-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                    )})}
                    
                </tbody>
            </table>

            {/* Modal for updating stock */}
            <Modal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Stock"
            >
                <form 
                    onSubmit={handleUpdate} 
                    className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Product Name
                        </label>
                        <div className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black">
                            {editingStock?.product.name}
                        </div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            SKU
                        </label>
                        <div className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black">
                            {editingStock?.product.sku}
                        </div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Category
                        </label>
                         <div className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black">
                            {editingStock?.product.category}
                        </div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Selling Price
                        </label>
                        <div className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black">
                            {editingStock?.product.sellingPrice}
                        </div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Minimum Stock
                        </label>
                        <input
                            type="number"
                            name="minStockThreshold"
                            min="5"
                            value={editingStock?.storeStock.minStockThreshold ?? ''}
                            onChange={(e) => {
                                const minStockThreshold = Number(e.currentTarget.value)
                                setEditingStock(prev => prev ? { ...prev, storeStock: {
                                    ...prev.storeStock,
                                    minStockThreshold 
                                } } : null)
                            }}
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
                            value={editingStock?.storeStock.quantity ?? ''}
                            onChange={(e) => {
                                const quantity = Number(e.currentTarget.value)
                                setEditingStock(prev => prev ? { ...prev, storeStock: {
                                    ...prev.storeStock,
                                    quantity
                                } } : null)
                            }}
                            required
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        />
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Supplier
                        </label>
                        <div className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black">
                            {editingStock?.product.supplier}
                        </div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Reason
                        </label>
                        <select
                            value={editingStock?.stockLog.reason ?? ''}
                            onChange={(e) => {
                                const reason = e.currentTarget.value as "RESTOCK" | "SALE" | "DAMAGE" | "ADJUSTMENT"
                                setEditingStock(prev => prev ? { ...prev, stockLog: {
                                    ...prev.stockLog,
                                    reason: reason? reason: "RESTOCK"
                                } } : null)
                            }}
                            required
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        >
                            {logReasons && logReasons.map((reason) => (
                                <option 
                                    key={reason}
                                    value={reason}>{reason}</option>
                            ))}
                        </select>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Notes
                        </label>
                        <input
                            type="text"
                            name="notes"
                            onChange={(e) => {
                                const notes = e.currentTarget.value
                                setEditingStock(prev => prev ? { ...prev, stockLog: {
                                    ...prev.stockLog,
                                    notes
                                } } : null)
                            }}
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        />
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
                            disabled={isUpdating}
                            className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
                        >
                            {isUpdating? 'Saving...': 'Save Changes'}
                        </button>
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>
                </form>
            </Modal>

            {/* Confirmation modal for deleting stock */}
            <Modal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Stock"
            >
                <div className="space-y-4">
                    <div>
                        <p>Are you sure you want to delete ?</p>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isDeleting}
                            onClick={handleDelete}
                            className="px-4 py-2 text-sm font-medium bg-red-700 text-white rounded-lg hover:bg-red-800 disabled:opacity-50"
                        >
                            {isDeleting? 'Deleting...': 'Delete'}
                        </button>
                        {error && (
                            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-md">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>
        </>
    )
}