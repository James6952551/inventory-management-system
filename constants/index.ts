import { LayoutGrid, Box, Package, LayoutGridCircles, Store, Truck, SquareText, UserRound } from 'lucide-react';

export const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid },
    { name: 'Stock', href: '/stock', icon: Box},
    { name: 'Product', href: '/product', icon: Package },
    { name: 'Category', href: '/category', icon: LayoutGridCircles },
    { name: 'Store', href: '/store', icon: Store },
    { name: 'Supplier', href: '/supplier', icon: Truck },
    { name: 'Stock Log', href: '/stockLog', icon: SquareText },
    { name: 'User', href: '/user', icon: UserRound },
]

export const statsHeaderItems = [
    {
        pageTitle: 'Dashboard',
        buttonText: 'View reports',
        subline: 'An overview of your inventory and financial performance.'
    },
    {
        pageTitle: 'Stock',
        buttonText: 'Add Stock',
        subline: 'Track inventory by store and spot items that need replenishing.'
    },
    {
        pageTitle: 'Product',
        buttonText: 'Add Product',
        subline: 'Manage product details, pricing and supplier relationships.'
    },
    { 
        pageTitle: 'Category', 
        buttonText: 'Add Category',
        subline: 'Organize your catalog and see how products are distributed.'
    },  
    {
        pageTitle: 'Supplier',
        buttonText: 'Add Supplier',
        subline: 'Keep supplier contacts and delivery addresses easy to find.'
    },
    {
        pageTitle: 'Store',
        buttonText: 'Add Store',
        subline: 'Find your locations and keep store addresses up to date.'
    },
    {
        pageTitle: 'Stock Log',
        buttonText: 'Export log',
        subline: 'Review stock activity with product, quantity, value and date in one place.'
    },
    {
        pageTitle: 'User',
        buttonText: 'Export log',
        subline: 'Review user IDs and manage workspace roles.'
    },
]

export const logReasons = ['RESTOCK', 'SALE', 'DAMAGE', 'ADJUSTMENT']

export const roles = ['ADMIN', 'MANAGER', 'STAFF']