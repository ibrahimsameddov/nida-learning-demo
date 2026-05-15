import { z } from 'zod'
import { Grade, Group, Subject, Role } from '../types/models'

export const loginSchema = z.object({
  email:    z.string().email('Email formatı yanlışdır'),
  password: z.string().min(8, 'Şifrə minimum 8 simvol olmalıdır'),
})

export const registerSchema = z.object({
  fullName: z.string().min(3, 'Ad minimum 3 simvol').max(60),
  email:    z.string().email('Email formatı yanlışdır'),
  password: z
    .string()
    .min(8)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])/,
      'Şifrə: böyük hərf, kiçik hərf, rəqəm və xüsusi simvol tələb olunur'
    ),
  role:        z.nativeEnum(Role),
  city:        z.string().min(2).optional(),
  school:      z.string().min(3).optional(),
  grade:       z.nativeEnum(Grade).optional(),
  group:       z.nativeEnum(Group).optional(),
  foreignLang: z.enum([Subject.English, Subject.Russian]).optional(),
  subjects:     z.array(z.string()).optional(),
  phone:        z.string().optional(),
  dateOfBirth:  z.string().optional(),   // YYYY-MM-DD
  parentEmail:  z.string().email().optional().or(z.literal('')),
})

export const examCreateSchema = z.object({
  title:       z.string().min(3).max(100),
  subjects:    z.array(z.nativeEnum(Subject)).min(1),
  duration:    z.number().min(10).max(180),
  scheduledAt: z.string().datetime(),
})

export type LoginInput    = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ExamCreateInput = z.infer<typeof examCreateSchema>
