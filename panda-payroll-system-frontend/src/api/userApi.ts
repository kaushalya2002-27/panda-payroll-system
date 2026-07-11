import axios from "axios";
import { z } from "zod";
import { PermissionKeysObjectSchema } from "../views/Administration/SectionList";
import { StorageFileSchema } from "../utils/StorageFiles.util";

export const userRoleSchema = z.object({
  id: z.number(),
  userType: z.string(),
  description: z.string().optional(),
  permissionObject: PermissionKeysObjectSchema,
  created_at: z.string(),
});

export type UserRole = z.infer<typeof userRoleSchema>;

export const userTypeSchema = z.object({
  id: z.number(),
  userType: z.string(),
  description: z.string().optional(),
  permissionObject: PermissionKeysObjectSchema,
  created_at: z.string(),
});

export const userLevelSchema = z.object({
  id: z.string(),
  levelId: z.string(),
  levelName: z.string().optional(),
  created_at: z.string(),
});

export type UserLevel = z.infer<typeof userLevelSchema>;

export type UserType = z.infer<typeof userTypeSchema>;

export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  userTypeId: z.number(),
  name: z.string(),
  mobile: z.string(),
  emailVerifiedAt: z.string().nullable(),
  role: z.string(),
  roleId: z.string(),
  gender: z.string(),
  availability: z.boolean(),
  responsibleSection: z.array(z.string()),
  userType: userTypeSchema,
  userLevel: userLevelSchema,
  profileImage: z
    .array(z.union([z.instanceof(File), StorageFileSchema]))
    .optional(),
  status: z.string(),
  isCompanyEmployee: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
  department: z.string(),
  assignedFactory: z.array(z.string()),
  employeeNumber: z.string(),
  jobPosition: z.string(),
  assigneeLevel: z.string(),
  permissionObject: PermissionKeysObjectSchema,
});

export type User = z.infer<typeof userSchema>;

export const passwordResetSchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string(),
  newPassword_confirmation: z.string(),
});

export type PasswordReset = z.infer<typeof passwordResetSchema>;

export async function login({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const res = await axios.post("/api/login", {
    email,
    password,
  });
  return res.data;
}

export async function userPasswordReset(data: PasswordReset) {
  const res = await axios.post(`/api/user-change-password`, data);
  return res.data;
}

export async function registerUser({
  name,
  email,
  mobileNumber: mobile,
  password,
  confirmPassword: password_confirmation,
  isCompanyEmployee,
  department,
  jobPosition,
  assignedFactory,
  employeeNumber,
}: {
  email: string;
  password: string;
  name: string;
  mobileNumber: string;
  confirmPassword: string;
  isCompanyEmployee: boolean;
  jobPosition: string;
  department: string;
  assignedFactory: string[];
  employeeNumber: string;
}) {
  const res = await axios.post("/api/register", {
    email,
    password,
    name,
    mobile,
    password_confirmation,
    isCompanyEmployee,
    jobPosition,
    department,
    assignedFactory,
    employeeNumber,
  });
  return res.data;
}

export async function validateUser() {
  const res = await axios.get("/api/user");
  return res.data;
}

export async function fetchAllUsers() {
  const res = await axios.get("/api/all-users");
  return res.data;
}

// Grants a newly registered (guest) user basic access to the system.
// This creates a default permission record for the user (Insight page only)
// and marks the user as available (active), so they can now log in.
export async function giveUserAccess(userId: number) {
  const res = await axios.post(`/api/users/${userId}/give-access`);
  return res.data;
}

// Permanently deletes a user account.
export async function deleteUser(userId: number) {
  const res = await axios.delete(`/api/users/${userId}/delete`);
  return res.data;
}

export async function forgotPassword({ email }: { email: string }) {
  const res = await axios.post("/api/forgot-password", {
    email,
  });
  return res.data;
}

export async function otpVerification({
  email,
  otp,
}: {
  email: string;
  otp: string;
}) {
  const res = await axios.post("/api/reset-password", {
    email,
    otp,
  });
  return res.data;
}

export async function resetPassword({
  email,
  password,
  otp,
}: {
  email: string;
  password: string;
  otp: string;
}) {
  const res = await axios.post("/api/change-password", {
    email,
    password,
    otp,
  });
  return res.data;
}

export async function fetchAllAssigneeLevel() {
  const res = await axios.get("/api/users-assignee-level");
  return res.data.assigneeLevels;
}

export async function updateUserType({
  id,
  name,
  assigneeLevel,
  department,
  availability,
  jobPosition,
}: {
  id: number;
  name: string;
  assigneeLevel: string;
  department: string;
  availability: boolean;
  jobPosition: string;
}) {
  const res = await axios.post(`/api/users/${id}/update`, {
    name,
    assigneeLevel: assigneeLevel?.toString(),
    department,
    availability,
    jobPosition,
  });

  return res.data;
}

//assignee by the responsible section

export async function updateUserProfileImage({ id, imageFile }: { id: number; imageFile: File }) {
  const formData = new FormData();
  formData.append("profileImage[]", imageFile); 
  
  const res = await axios.post(`/api/user/${id}/profile-update`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
}
export async function updateUserProfileDetails({
  id,
  name,
  gender,
  mobile,
}: {
  id: number;
  name: string;
  gender: string;
  mobile: string;
}) {
  const data = {
    name,
    gender,
    mobile,
  };

  const res = await axios.post(`/api/user/${id}/profile-update`, data);

  return res.data;
}

export async function resetProfileEmail({ currentEmail,id }: { currentEmail: string, id: number }) {
  const res = await axios.post(`/api/user/${id}/email-change`, {
    currentEmail,
  });
  return res.data;
}

export async function resetProfileEmailVerification({ otp,id }: { otp: string, id: number }) {
  const res = await axios.post(`/api/user/${id}/email-change-verify`, {
    otp,
  });
  return res.data;
}

export async function resetProfileEmailConfirm({ newEmail,id }: { newEmail: string, id: number }) {
  const res = await axios.post(`/api/user/${id}/email-change-confirm`, {
    newEmail,
  });
  return res.data;
}