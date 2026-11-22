'use client';

import Chart from "@/components/Chart"
import { useRouter } from "next/navigation";
import { useRole } from "@/context/role-context";

interface DashboardViewProps {
    dashboardConfig: { 
        pageTitle: string,
        buttonText: string,
        subline: string
    },
    stats: { 
        cardTitle: string,
        value: number | string,
        subline: string
    }[],
    belowMinimum: number,
    NovemberProfits: number
}

export default function DashboardView({ 
    dashboardConfig, 
    stats,
    belowMinimum,
    NovemberProfits
} : DashboardViewProps
) {   
    const router = useRouter()

    const role = useRole()
    
    const data = [
        {
            month: 'May',
            profits: 11300.99,
        },
        {
            month: 'Jun',
            profits: 11289.99,
        },
        {
            month: 'Jul',
            profits: 21000.99,
        },
        {
            month: 'Aug',
            profits: 20459.99,
        },
        {
            month: 'Sep',
            profits: 10410.99,
        },
        {
            month: 'Oct',
            profits: 10310.99,
        },
        {
            month: 'Nov',
            profits: NovemberProfits || 0,
        },

    ]

    return ( 
        <>
            {/* Stats Header */}
            <div className="p-8 space-y-6">
                <div className="flex justify-between">
                    <div className="space-y-2">
                        <p className="text-3xl font-bold tracking-wide">
                            {dashboardConfig.pageTitle}
                        </p>
                        <p className="text-slate-500">
                            {dashboardConfig.subline}
                        </p>
                    </div>
                </div>
                <div className="grid grid-cols-4 gap-8">
                    {stats.map(stat => (
                        <div key={stat.cardTitle} className="bg-white rounded-2xl p-6 shadow-sm space-y-2">
                            <p className="text-sm font-semibold text-slate-500">{stat.cardTitle}</p>
                            <p className="text-4xl font-bold">{stat.value}</p>
                                <p className="text-sm font-medium text-slate-400">{stat.subline}</p>
                        </div>
                    ))}
                </div>
            </div>
            <div className="px-8">
                <div className="grid grid-cols-6 gap-8">

                    {/* Financial Analysis Chart */}
                    <div className="col-span-4 bg-white rounded-2xl p-6 shadow-sm space-y-6">
                        <p className="font-bold tracking-wide text-xl">Financial Analysis</p>
                        <Chart data={data}/>
                    </div>

                    {/* Action Center */}
                    <div className="col-span-2 bg-white rounded-2xl p-6 shadow-sm space-y-6">
                        <p className="font-bold tracking-wide text-xl">Action Center</p>
                        {belowMinimum && (
                            <div className="bg-yellow-100/50 rounded p-4 space-y-4">
                            <p className="text-xs font-semibold text-yellow-700">STOCK ALERT</p>
                            <p className="font-bold tracking-wide text-lg text-slate-900">{belowMinimum} products need attention</p>
                            <p className="text-sm font-medium text-slate-500">Review low-stock items before placing your next purchase.</p>
                            <button 
                                onClick={() => { router.push('/stock') }}
                                className="bg-blue-700 hover:bg-blue-800 text-white w-full h-1/2 px-6 py-2.5 rounded-lg cursor-pointer"
                            >
                            Review low stock
                            </button>
                        </div>
                        )}                              
                        <div className="flex flex-col space-y-4">
                            <p className="text-slate-500 text-xs">QUICK ACCESS</p>
                            <button 
                                onClick={() => { router.push('/stock')}}
                                className="w-full border-b-2 border-slate-300 pb-2 cursor-pointer hover:bg-slate-100">
                                <div className="text-left">
                                    <p className="font-semibold">Stock</p>
                                    <p className="text-slate-500">View current inventory</p>
                                </div>
                            </button>
                            <button 
                                onClick={() => { router.push('/product')}}
                                className="w-full border-b-2 border-slate-300 pb-2 cursor-pointer hover:bg-slate-100">
                                <div className="text-left">
                                    <p className="font-semibold">Product</p>
                                    <p className="text-slate-500">View current inventory</p>
                                </div>
                            </button>
                            {role === "ADMIN" && (
                                <button 
                                    onClick={() => { router.push('/user')}}
                                    className="w-full cursor-pointer hover:bg-slate-100">
                                    <div className="text-left">
                                        <p className="font-semibold">User</p>
                                        <p className="text-slate-500">Manage workspace access</p>
                                    </div>
                                </button>
                            )}
                            
                        </div>
                    </div>            
                </div>                         
            </div>        
        </>
    )
}