'use client';

import { Modal } from "@/components/Modal";
import StatsHeader from "@/components/StatsHeader";
import { Category, Store } from "@/generated/prisma/client";
import { useState } from "react";
import { getStockLogs, getStockLogsCSV } from "./actions";
import StockLogTable from "./stockLog-table";
import React from "react";

export type StockLogWithRelations = Awaited<ReturnType<typeof getStockLogs>>[number]

interface StockLogViewProps {
    stockLogs: StockLogWithRelations[],
    categories: Category[],
    stores: Store[],
    stockLogConfig: { 
        pageTitle: string,
        buttonText: string,
        subline: string
    },
    stats: { 
        cardTitle: string,
        value: number | string,
        subline: string
    }[],
}

export default function StockLogView({ 
    stockLogs, 
    categories,
    stores,
    stockLogConfig, 
    stats
} : StockLogViewProps
) {
    const [searchKey, setSearchKey] = useState("")

    const [selectedType, setSelectedType] = useState("")

    const [showEntry, setShowEntry] = useState('10')

    const [selectingStore, setSelectingStore] = useState(() => {
        // set the default selecting store
        const defaultStore = stores.find((store) => {
            return store.name === "Store A"
        })
        return defaultStore
    })

    const handleDownload = async () => {
        const result = await getStockLogsCSV(selectingStore?.id ?? '', selectingStore?.name ?? '');
        if (!result.success || !result.csv) return;

        // Create a blob and trigger browser download
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `stock-logs-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
   
    const filteredRecords = () => {
        // get the specific store stocks based on store Id
        const filteredStockLogs = stockLogs.filter((stockLog) => {
            return stockLog.storeId === selectingStore?.id
        })

        let typeFiltered: StockLogWithRelations[] = filteredStockLogs

        // filter the records based on type
        if (selectedType) {
            typeFiltered = stockLogs.filter((stockLog) => {
                return stockLog.reason === selectedType
            })
        }
        // filter the records based on search key
        const filtered = typeFiltered.filter((stockLog) => {
            const lowerCaseName = stockLog.product.name.toLowerCase()
            const lowerCaseSearchKey = searchKey.toLowerCase()
            return lowerCaseName.includes(lowerCaseSearchKey)
        })

        // restrict the entry number 
        const stockLogsCopy = Array.from(filtered)
        stockLogsCopy.length = Number(showEntry)

        return stockLogsCopy
    }       

    return ( 
        <>
            {/* Stats Header */}
            <StatsHeader 
                pageTitle={stockLogConfig?.pageTitle}
                buttonText={stockLogConfig?.buttonText}
                subline={stockLogConfig?.subline}
                stats={stats}
                onAction={handleDownload}
            />
            <div className="px-8">
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                            <p className="font-bold tracking-wide">Stock activity</p>
                            <div className="flex items-center gap-6">
                                <input
                                    type="text"
                                    placeholder="Search product"
                                    onChange={((e) => { setSearchKey(e.currentTarget.value) })}
                                    className="bg-slate-100 rounded-md py-2 px-4 focus:outline-none w-full sm:w-80 md:w-96 lg:w-[420px]"
                                />
                                <select 
                                    onChange={(e) => { setSelectedType(e.currentTarget.value) }}
                                    className="p-2 rounded border border-gray-300 focus:outline-none focus:border-black w-full"
                                >
                                    <option value="">All types</option>
                                    <option value="RESTOCK">Restock</option>
                                    <option value="SALE">Sale</option>
                                    <option value="DAMAGE">Damage</option>
                                    <option value="ADJUSTMENT">Adjustment</option>
                                </select>
                                <p>
                                    Show 
                                    <input 
                                        type="number" 
                                        min="1" 
                                        defaultValue="10" 
                                        onChange={((e) => { setShowEntry(e.currentTarget.value) })}
                                        className="border border-gray-300 focus:outline-none focus:border-black w-16" 
                                    /> 
                                    entries
                                </p>
                                <p className="whitespace-nowrap">{stockLogs.length} entries</p>
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
                        <StockLogTable 
                            stockLogs={filteredRecords()}
                            categories={categories}
                            stores={stores}
                        />

                        
                </div>
            </div>        
        </>
    )
}