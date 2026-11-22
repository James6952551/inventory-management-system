import { z } from "zod";

export const storeStockSchema = z.object({
    storeId: z
    .string()
    .min(1, "Store is required"),

    productId: z
    .string()
    .min(1, "Product is required"),

    quantity: z
    .coerce.number()
    .int("Quantity must be a whole number")
    .nonnegative("Quantity cannot be negative"),

    minStockThreshold: z
    .coerce.number()
    .int("Threshold must be a whole number")
    .min(5, "Minimum stock cannot be less than 5")
})

export type StoreStockInput = z.infer<typeof storeStockSchema>

export const stockLogSchema = z.object({
    storeId: z
    .string()
    .min(1, "Store is required"), 

    productId: z
    .string()
    .min(1, "Product is required"),

    quantity: z
    .coerce.number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1"),

    reason: z.enum(["RESTOCK", "SALE", "DAMAGE", "ADJUSTMENT"], {
        message: "Please select a valid reason",
    }),

    notes: z
    .string()
    .nullish()
});

export type StockLogInput = z.infer<typeof stockLogSchema>

export const productSchema = z.object({
    name: z
    .string()
    .min(1, "Product name is required")
    .max(100, "Product name must be less than 100 characters"),

    sku: z
    .string()
    .min(1, "SKU is required")
    .max(50, "SKU must be less than 50 characters"),

    costPrice: z
    .coerce.number()
    .min(0, "Cost price must be 0 or greater"),

    sellingPrice: z
    .coerce.number()
    .min(0.01, "Selling price must be greater than 0"),

    categoryId: z
    .string()
    .min(1, "Category is required"),

    supplierId: z
    .string()
    .min(1, "Supplier is required"),
});

export type ProductInput = z.infer<typeof productSchema>

export const categorySchema = z.object({
    name: z
    .string()
    .min(1, "Category name is required")
    .max(50, "Category name must be less than 50 characters"),
})

export const supplierSchema = z.object({
    name: z
    .string()
    .min(1, "Supplier name is required")
    .max(50, "Supplier name must be less than 50 characters"),

    contactEmail: z
    .string()
    .min(1, "Supplier email is required")
    .email("Please enter a valid email address")
    .max(100, "Supplier email must be less than 100 characters"),

    phone: z
    .string()
    .max(50, "Supplier phone must be less than 50 characters")
    .nullish(),

    address: z
    .string()
    .max(255, "Supplier address must be less than 255 characters")
    .nullish()
})

export type SupplierInput = z.infer<typeof supplierSchema>

export const storeSchema = z.object({
    name: z
    .string()
    .min(1, "Store name is required")
    .max(50, "Store name must be less than 50 characters"),

    address: z
    .string()
    .max(255, "Store address must be less than 255 characters")
    .nullish()
})

export type StoreInput = z.infer<typeof storeSchema>

export const profileSchema = z.object({
    name: z
    .string(),
    
    role: z.enum(["ADMIN", "MANAGER", "STAFF"], {
        message: "Please select a valid role",
    }),

    department: z
    .string()
    .nullish()
})

export type ProfileInput = z.infer<typeof profileSchema>