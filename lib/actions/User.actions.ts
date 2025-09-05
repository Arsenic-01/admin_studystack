// lib/actions/User.actions.ts

"use server";

import { UpdateUserData } from "@/app/admin/users/_components/UpdateUserModal";
import { DATABASE_ID, db, Query, USER_COLLECTION_ID } from "@/lib/appwrite";
import { updateUserData } from "../appwrite_types";
import bcrypt from "bcryptjs";
import z from "zod";
import { ID } from "node-appwrite";
import { signUpFormSchema } from "@/validation";

export async function fetchUsers() {
  try {
    const response = await db.listDocuments(DATABASE_ID!, USER_COLLECTION_ID!);

    return response.documents.map((doc) => ({
      id: doc.$id,
      prnNo: doc.prnNo,
      name: doc.name,
      role: doc.role as "admin" | "student" | "teacher",
      email: doc.email,
      password: doc.password,
    }));
  } catch (error) {
    console.log("Error fetching users:", error);
    return [];
  }
}

export async function updateUser(data: updateUserData) {
  try {
    const { id: userId, password, ...updateData } = data;

    const dataToUpdate: Partial<UpdateUserData> = { ...updateData };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      dataToUpdate.password = hashedPassword;
    }

    await db.updateDocument(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      userId,
      dataToUpdate
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: (error as Error).message };
  }
}

export async function deleteUser(userId: string) {
  try {
    await db.deleteDocument(DATABASE_ID!, USER_COLLECTION_ID!, userId);

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, error: (error as Error).message };
  }
}

const CsvUserSchema = signUpFormSchema.omit({ password: true }).extend({
  password: z.string().min(1, "Password is required"), // Password is required in CSV
});

export async function importUsersFromCsv(
  csvContent: string
): Promise<{ success: boolean; error?: string; createdCount?: number }> {
  try {
    // Split content into lines and remove header
    const rows = csvContent.trim().split("\n").slice(1);

    if (rows.length === 0) {
      return {
        success: false,
        error: "CSV file is empty or contains only a header.",
      };
    }

    const usersToCreate = [];
    const validationErrors = [];

    // 1. Parse and Validate all rows first
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i].split(",");
      const [prnNo, name, email, password, role] = row.map((cell) =>
        cell.trim()
      );

      const userData = { prnNo, name, email, password, role };
      const validation = CsvUserSchema.safeParse(userData);

      if (!validation.success) {
        validationErrors.push(
          `Row ${i + 2}: ${validation.error.issues
            .map((e) => e.message)
            .join(", ")}`
        );
        continue; // Skip invalid rows
      }
      usersToCreate.push(validation.data);
    }

    if (validationErrors.length > 0) {
      return {
        success: false,
        error: `Validation failed for ${
          validationErrors.length
        } rows. Please fix them and re-upload. Errors: ${validationErrors.join(
          "; "
        )}`,
      };
    }

    // 2. Check for existing users and hash passwords
    const creationPromises = usersToCreate.map(async (user) => {
      // Check if user with PRN or email already exists
      const existingUser = await db.listDocuments(
        DATABASE_ID!,
        USER_COLLECTION_ID!,
        [
          Query.or([
            Query.equal("prnNo", user.prnNo),
            Query.equal("email", user.email),
          ]),
        ]
      );

      if (existingUser.total > 0) {
        // You can decide how to handle duplicates. Here we just skip them.
        console.log(`Skipping duplicate user: ${user.email} / ${user.prnNo}`);
        return null;
      }

      const hashedPassword = await bcrypt.hash(user.password, 10);

      return {
        prnNo: user.prnNo,
        name: user.name,
        email: user.email,
        password: hashedPassword,
        role: user.role,
      };
    });

    const documentsToCreate = (await Promise.all(creationPromises)).filter(
      Boolean
    );

    if (documentsToCreate.length === 0) {
      return {
        success: true,
        createdCount: 0,
        error: "No new users to create. They may already exist.",
      };
    }

    // 3. Batch create documents (Appwrite doesn't have a batch create, so we loop)
    const creationResults = await Promise.all(
      documentsToCreate.map((doc) =>
        db.createDocument(DATABASE_ID!, USER_COLLECTION_ID!, ID.unique(), doc!)
      )
    );

    return { success: true, createdCount: creationResults.length };
  } catch (error) {
    console.error("Error importing users from CSV:", error);
    return { success: false, error: "An unexpected server error occurred." };
  }
}
