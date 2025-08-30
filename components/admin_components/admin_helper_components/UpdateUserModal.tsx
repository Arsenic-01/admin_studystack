"use client";

import { useState, useTransition } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/search-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { updateUser } from "@/lib/actions/Admin.actions";

// 1. Define the Zod schema for validation
const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name cannot be empty"),
  email: z.string().email("Invalid email address"),
  prnNo: z.string().regex(/^\d{10}$/, "PRN No. must be exactly 10 digits"),
  role: z.enum(["admin", "teacher", "student"]),
  // New password is optional, but if present, must be >= 8 chars.
  // An empty string is allowed, which means "don't update".
  password: z
    .union([
      z.string().min(8, "Password must be at least 8 characters"),
      z.literal(""),
    ])
    .optional(),
});

export interface UpdateUserData {
  id: string;
  prnNo: string;
  role: "admin" | "teacher" | "student";
  email: string;
  name: string;
  password?: string;
}

type UpdateUserDialogProps = {
  user: UpdateUserData;
  onClose: () => void;
  onUpdate: () => void;
};

export function UpdateUserDialog({
  user,
  onClose,
  onUpdate,
}: UpdateUserDialogProps) {
  const [formData, setFormData] = useState<Omit<UpdateUserData, "password">>({
    id: user.id,
    prnNo: user.prnNo,
    role: user.role,
    email: user.email,
    name: user.name,
  });
  const [newPassword, setNewPassword] = useState("");
  // 2. Add state to hold validation errors
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  // 3. Update handleSubmit to validate with Zod
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    const payload: UpdateUserData = { ...formData };
    // Only include the password if the user has typed something
    if (newPassword.trim()) {
      payload.password = newPassword;
    }

    const validationResult = updateUserSchema.safeParse(payload);

    if (!validationResult.success) {
      const fieldErrors: Record<string, string | undefined> = {};
      for (const issue of validationResult.error.issues) {
        fieldErrors[issue.message[0]] = issue.message;
      }
      setErrors(fieldErrors);
      toast.error("Please fix the errors in the form.");
      return; // Stop submission
    }

    startTransition(() => {
      // Use the validated data from Zod
      updateUser(validationResult.data).then((result) => {
        if (result.success) {
          toast.success("User updated successfully!");
          onUpdate();
        } else {
          toast.error(result.error || "Failed to update user.");
          console.error(result.error);
        }
      });
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="mb-5">
          <DialogTitle>Update User</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="Name"
            id="name"
            value={formData.name}
            onChange={(name) => setFormData((prev) => ({ ...prev, name }))}
            error={errors.name}
          />
          <FormInput
            label="Email"
            id="email"
            value={formData.email}
            onChange={(email) => setFormData((prev) => ({ ...prev, email }))}
            error={errors.email}
          />
          <FormInput
            label="PRN No"
            id="prnNo"
            value={formData.prnNo}
            onChange={(prnNo) => setFormData((prev) => ({ ...prev, prnNo }))}
            type="numeric"
            error={errors.prnNo}
          />

          {/* Password Field */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="newPassword" className="pt-2 text-left">
              New Password
            </Label>
            <div className="col-span-3">
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep current password"
                  className={`pr-10 ${
                    errors.password ? "border-destructive" : ""
                  }`}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5 text-gray-400" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password}
                </p>
              )}
            </div>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-left">
              Role
            </Label>
            <Select
              value={formData.role}
              onValueChange={(role) =>
                setFormData((prev) => ({
                  ...prev,
                  role: role as "admin" | "teacher" | "student",
                }))
              }
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="teacher">Teacher</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// 4. Update FormInput to display errors
const FormInput = ({
  label,
  id,
  value,
  onChange,
  type = "text",
  error,
}: {
  label: string;
  id: string;
  value: string;
  onChange: (val: string) => void;
  type?: "text" | "numeric";
  error?: string;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (type === "numeric") {
      // 5. Enforce max length of 10 for numeric input for better UX
      if (/^\d*$/.test(newValue) && newValue.length <= 10) {
        onChange(newValue);
      }
    } else {
      onChange(newValue);
    }
  };

  return (
    <div className="grid grid-cols-4 items-start gap-4">
      <Label htmlFor={id} className="pt-2 text-left">
        {label}
      </Label>
      <div className="col-span-3">
        <Input
          id={id}
          value={value}
          onChange={handleChange}
          className={error ? "border-destructive" : ""}
          inputMode={type === "numeric" ? "numeric" : "text"}
        />
        {error && <p className="text-sm text-destructive mt-1">{error}</p>}
      </div>
    </div>
  );
};
