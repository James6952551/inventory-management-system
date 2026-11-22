interface StatsHeaderProps {
    pageTitle: string;
    buttonText?: string;
    subline: string;
    stats: {
        cardTitle: string;
        value: number | string;
        subline: string;      
    }[];
    onAction?: () => void;
}

export default function StatsHeader({ pageTitle, buttonText, subline, stats, onAction }: StatsHeaderProps) {
    return (
        <div className="p-8 space-y-6">
                <div className="flex justify-between">
                    <div className="space-y-2">
                        <p className="text-3xl font-bold tracking-wide">
                            {pageTitle}
                        </p>
                        <p className="text-slate-500">
                            {subline}
                        </p>
                    </div>
                    {onAction && (
                        <button 
                            onClick={onAction}
                            className="bg-blue-700 hover:bg-blue-800 text-white h-1/2 px-6 py-2.5 rounded-lg cursor-pointer">
                            {buttonText}
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-3 gap-8">
                    {stats.map(stat => (
                        <div key={stat.cardTitle} className="bg-white rounded-2xl p-6 shadow-sm space-y-2">
                            <p className="text-sm font-semibold text-slate-500">{stat.cardTitle}</p>
                            <p className="text-4xl font-bold">{stat.value}</p>
                                <p className="text-sm font-medium text-slate-400">{stat.subline}</p>
                        </div>
                    ))}
                </div>
            </div>
    )
}           