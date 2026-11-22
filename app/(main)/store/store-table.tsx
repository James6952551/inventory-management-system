import { Modal } from "@/components/Modal";
import { Store } from "@/generated/prisma/client"
import { StoreInput } from "@/lib/validations";
import React, { useState } from "react";

interface StoreTableProps {
    stores: Store[];
    onUpdate: (id: string, storeInput: StoreInput) => Promise<{ success: boolean; error?: string }>;
    onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

export default function StoreTable({ stores, onUpdate, onDelete } : StoreTableProps) {
        const [isModalOpen, setIsModalOpen] = useState(false)

        const [isUpdating, setIsUpdating] = useState(false)
        
        const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

        const [isDeleting, setIsDeleting] = useState(false)

        const [error, setErrorMessage] = useState<string | undefined>("")
    
        const [editingStore, setEditingStore] = useState<({id: string} & StoreInput) | null>(null)
        
        const [deletingStoreId, setDeletingStoreId] = useState<string>('')

        function handleModalOpen(id: string, storeInput: StoreInput) {
            setIsModalOpen(true)
            setEditingStore({id, ...storeInput})
        }

        function handleDeleteModalOpen(id: string) {
            setIsDeleteModalOpen(true)
            setDeletingStoreId(id)
        }
        
        async function handleUpdate(event: React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault()

            if (!editingStore) {
                return 
            }    

            setIsUpdating(true)

            const storeId = editingStore.id
            const storeInput = {
                name: editingStore.name,
                address: editingStore.address
            }

            const result = await onUpdate(storeId, storeInput)

            if (!result.success) {
                console.error(result.error)
                setErrorMessage(result.error)
            }

            setIsModalOpen(false)
            setIsUpdating(false)
        }

        async function handleDelete() {
            setIsDeleting(true)

            const result = await onDelete(deletingStoreId)

            if (!result.success) {
                console.error(result.error)
                setErrorMessage(result.error)
            }

            setIsDeleteModalOpen(false)
            setIsDeleting(false)
        }

    return ( 
        <>
            {/* Table displaying data */}
            <table className="w-full">
                <thead className="bg-slate-100">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide w-1/12">No</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Store</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Address</th>
                        <th className="px-4 py-2 text-left text-xs font-semibold text-slate-400 tracking-wide">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {stores && stores.map((store, index) => {
                        const storeInput = {
                            name: store.name,
                            address: store.address
                        }

                        return (
                    <tr key={store.id}>
                        <td className="px-4 py-2 text-sm">{ index + 1 }</td>
                        <td className="px-4 py-2 text-sm">{ store.name }</td>
                        <td className="px-4 py-2 text-sm">{ store.address }</td>
                        <td className="px-4 py-2 text-sm space-x-6">
                            <button 
                                onClick={() => handleModalOpen(store.id, storeInput)}
                                className="text-xs text-blue-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Edit
                            </button>
                            <button 
                                onClick={(e) => handleDeleteModalOpen(store.id)}
                                className="text-xs text-slate-400 tracking-wide hover:underline cursor-pointer"
                            >
                                Delete
                            </button>
                        </td>
                    </tr>
                    )})}
                    
                </tbody>
            </table>

            {/* Modal for updating store */}
            <Modal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Edit Store"
            >
                <form 
                    onSubmit={handleUpdate} 
                    className="space-y-4">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Store Name
                        </label>
                        <input
                            type="text"
                            value={editingStore?.name ?? ''}
                            onChange={(e) => {
                                const name = e.currentTarget.value
                                setEditingStore(prev => prev ? { ...prev, name } : null)
                            }}
                            required
                            placeholder="e.g. Electronics, Footwear"
                            className="w-full border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:border-black"
                        />
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Address (Optional)
                        </label>
                        <input
                            type="text"
                            name="address"
                            value={editingStore?.address ?? ''}
                            onChange={(e) => {
                                const address = e.currentTarget.value
                                setEditingStore(prev => prev ? { ...prev, address } : null)
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

            {/* Confirmation modal for deleting store */}
            <Modal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Store"
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