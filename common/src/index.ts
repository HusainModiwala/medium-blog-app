import { z } from "zod";

// user signup
export const signUpBody = z.object({
    email: z.string().email(),
    name: z.string().optional(),
    password: z.string(),
})

export type SignUpInput = z.infer<typeof signUpBody>

// user signin
export const signInBody = z.object({
    email: z.string().email(),
    password: z.string()
})

export type SignInInput = z.infer<typeof signInBody>

/* ===================================================================================== */

// create blog
export const createBlogInput = z.object({
    title: z.string(),
    content: z.string()
})

export type CreateBlogInput = z.infer<typeof createBlogInput>

// update blog
export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.number()
})

export type UpdateBlogInput = z.infer<typeof updateBlogInput>