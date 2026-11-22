'use client';

import { Modal } from "@/components/Modal";
import StatsHeader from "@/components/StatsHeader";
import { useState } from "react";
import { addCategory, deleteCategory, getCategories, updateCategory } from "./actions";
import CategoryTable from "./category-table";
import { useRole } from "@/context/role-context";

export type CategoryWithRelations = Awaited<ReturnType<typeof getCategories>>[number]

interface CategoryViewProps {
    categories: CategoryWithRelations[],
    categoryConfig: { 
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

export default function CategoryView({ 
    categories, 
    categoryConfig, 
    stats
} : CategoryViewProps
) {
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [searchKey, setSearchKey] = useState("")
        
    const [showEntry, setShowEntry] = useState('10')

    const [isAdding, setIsAdding] = useState(false)
    
    const [error, setErrorMessage] = useState<string | undefined>("")

    const role = useRole()

    async function handleAddCategory(event: React.SyntheticEvent<HTMLFormElement>) {
            event.preventDefault()
            setIsAdding(true)
            setErrorMessage("")
    
            const formData = new FormData(event.currentTarget)
            const name = formData.get("name") as string
    
            const result = await addCategory(name)
            if (!result.success) {
                setErrorMessage(result.error)
                return
            }
            
            setIsModalOpen(false)
            setIsAdding(false)
        }

        const filteredRecords = () => {
            // filter the records based on search key
            const filtered = categories.filter((category) => {
                const lowerCaseName = category.name.toLowerCase()
                const lowerCaseSearchKey = searchKey.toLowerCase()
                return lowerCaseName.includes(lowerCaseSearchKey)
            })

            // restrict the entry number 
            const categoriesCopy = Array.from(filtered)
            categoriesCopy.length = Number(showEntry)

            return categoriesCopy
        }  

    return ( 
        <>
            {/* Stats Header */}
            <StatsHeader 
                pageTitle={categoryConfig?.pageTitle}
                buttonText={categoryConfig?.buttonText}
                subline={categoryConfig?.subline}
                stats={stats}
                onAction={role === "STAFF"? undefined: () => setIsModalOpen(true)}
            />
            <div className="px-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="font-bold tracking-wide">Category directory</p>
                            <div className="flex items-center gap-6">
                                <input
                                    type="text"
                                    placeholder="Search category name"
                                    onChange={((e) => { setSearchKey(e.currentTarget.value) })}
                                    className="bg-slate-100 rounded-md py-2 px-4 focus:outline-none w-full sm:w-80 md:w-96 lg:w-[420px]"
                                />
                                <p>
                                    Show {''}
                                    <input 
                                        type="number" 
                                        min="1" 
                                        defaultValue="10" 
                                        onChange={((e) => { setShowEntry(e.currentTarget.value) })}
                                        className="border border-gray-300 focus:outline-none focus:border-black w-16" 
                                    /> {''}
                                    entries
                                </p>
                                <p className="whitespace-nowrap">3 items</p>
                            </div>
                        </div>
                        {/* Main table */}
                        <CategoryTable 
                            categories={filteredRecords()}
                            onUpdate={updateCategory}
                            onDelete={deleteCategory}
                        />

                        {/* Modal for adding category */}
                        <Modal 
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            title="Add New Category"
                        >
                            <form onSubmit={handleAddCategory} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">
                                        Category Name
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        required
                                        placeholder="e.g. Electronics, Footwear"
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
                                        disabled={isAdding}
                                        className="px-4 py-2 text-sm font-medium bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50"
                                    >
                                        {isAdding? 'Saving...': 'Save Category'}
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