import { z } from "zod";

export const courseLevels = ["Beginner", "Intermediate", "Advanced"] as const;
export const courseStatus = ["Draft", "Published", "Archived"] as const;

export const courseCategories = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "Cloud Computing",
  "Cybersecurity",
  "UI/UX Design",
  "Game Development",
  "DevOps",
  "AI & Robotics",
  "Business & Entrepreneurship",
  "Marketing & SEO",
  "Finance & Investing",
  "Personal Development",
  "Language Learning",
  "Health & Wellness",
] as const;

export const courseSchema = z.object({
  title: z
    .string()
    .min(3, {
      message: "Title must be at least 3 characters long",
    })
    .max(100, {
      message: "Title must be at most 100 characters long",
    }),

  description: z.string().min(3, {
    message: "Description must be at least 3 characters long",
  }),

  fileKey: z.string().min(1, {
    message: "File is required",
  }),

  price: z.coerce.number().min(1, {
    message: "Price must be at least 1",
  }),

  duration: z.coerce
    .number()
    .min(1, {
      message: "Duration must be at least 1 hour",
    })
    .max(500, {
      message: "Duration cannot exceed 500 hours",
    }),

  level: z.enum(courseLevels, {
    message: "Please select a valid course level",
  }),

  category: z.enum(courseCategories, {
    message: "Categories is required",
  }),

  smallDescription: z
    .string()
    .min(3, {
      message: "Short description must be at least 3 characters",
    })
    .max(200, {
      message: "Short description cannot exceed 200 characters",
    }),

  slug: z.string().min(3, {
    message: "Slug must be at least 3 characters long",
  }),

  status: z.enum(courseStatus, {
    message: "Please choose a valid status for the course",
  }),
});

export type courseSchemaType = z.infer<typeof courseSchema>;
