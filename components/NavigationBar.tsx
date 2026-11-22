'use client';
import Link from "next/link";
import { navigationItems } from "@/constants";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { SquareArrowRightExit } from "lucide-react";
import { Role } from "@/generated/prisma/enums";

interface NavigationBarProps {
    role: Role;
}

export default function NavigationBar({ role }: NavigationBarProps) {
    const [isSigningOut, setIsSigningOut] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const visibleNavigationItems = role !== "ADMIN"
    ? navigationItems.filter((item) => item.name !== "User")
    : navigationItems

    async function handleSignOut() {
        setIsSigningOut(true)
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/sign-in')
                    setIsSigningOut(false)
                }
            }
        })
    }

    return (
    <div className="bg-blue-950 p-4">
                {/* Sidebar */}
                <nav className="p-4 flex flex-col gap-4 text-blue-200 w-48">
                    {visibleNavigationItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex gap-4 hover:bg-blue-700 hover:text-white p-2 rounded-lg flex-1 ${pathname === item.href ? 'bg-blue-700 text-white' : ''}`}
                        >
                            <item.icon /> {item.name}
                        </Link>
                    ))}
                    <button 
                        className="flex gap-4 hover:bg-blue-700 hover:text-white p-2 rounded-lg text-left"
                        onClick={handleSignOut}
                        disabled={isSigningOut}
                    >
                        <SquareArrowRightExit /> {isSigningOut? 'Signing Out...': 'Sign Out'}
                    </button>
                </nav>
            </div>
    )
}