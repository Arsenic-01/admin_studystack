// app/admin/register/page.tsx
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { importUsersFromCsv } from "@/lib/actions/Admin.actions";
import { signUpFormSchema } from "@/lib/validation_schema/validation";
import {
  AlertTriangle,
  Eye,
  EyeOff,
  FileDown,
  KeyRound,
  Loader2,
  Mail,
  Upload,
  User,
  UserSquare,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

function CsvUserImporter() {
  const [isPending, startTransition] = useTransition();

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const csvContent = reader.result as string;
      startTransition(async () => {
        const response = await importUsersFromCsv(csvContent);
        if (response.success) {
          toast.success("Import Complete!", {
            description: `${response.createdCount} new users have been successfully created.`,
          });
        } else {
          toast.error("Import Failed", {
            description: response.error || "An unknown error occurred.",
            duration: 10000,
          });
        }
      });
    };

    reader.readAsText(file);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "text/csv": [".csv"] },
    multiple: false,
  });

  const downloadTemplate = () => {
    const header = "prnNo,name,email,password,role\n";
    const example =
      "1234567890,John Doe,john.doe@example.com,password123,student\n";
    const blob = new Blob([header, example], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "user_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-md text-center">
      <h2 className="mt-6 text-3xl font-bold">Import Users in Bulk</h2>
      <p className="mt-2 text-muted-foreground">
        Save time by uploading a CSV file to register multiple users at once.
      </p>

      <div
        {...getRootProps()}
        className={`mt-6 p-8 border-2  border-dashed rounded-xl cursor-pointer
        ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-neutral-200 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors"
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Upload className="size-10" />
          {isDragActive ? (
            <p className="font-semibold text-primary">Drop the file here...</p>
          ) : (
            <p>Drag & drop a CSV file here, or click to select</p>
          )}
        </div>
      </div>

      <Button variant="outline" className="mt-4" onClick={downloadTemplate}>
        <FileDown className="mr-2 h-4 w-4" />
        Download CSV Template
      </Button>

      {isPending && (
        <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Processing file... Please wait.</span>
        </div>
      )}
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    prnNo: "",
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(""); // Clear error on change
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (role: string) => {
    setError(""); // Clear error on change
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const validation = signUpFormSchema.safeParse(form);
    if (!validation.success) {
      setError(validation.error.issues[0].message);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      toast.success("Registration successful!", {
        description: "The new user account has been created.",
      });
      setForm({ prnNo: "", name: "", email: "", password: "", role: "" });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:min-h-[95vh] lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-4 py-10 lg:p-0">
        <div className="mx-auto grid w-[400px] gap-6">
          <div className="grid gap-1 md:gap-2 text-center">
            <h1 className="text-2xl md:text-3xl font-bold">
              Create a Single Account
            </h1>
            <p className="text-sm text-balance text-muted-foreground">
              Enter the details below to register one user.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="grid gap-4">
            {/* Form inputs remain the same */}
            <div className="grid gap-2">
              <Label htmlFor="prnNo">PRN Number</Label>
              <div className="relative">
                <UserSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="prnNo"
                  name="prnNo"
                  type="text"
                  placeholder="e.g., 1234567890"
                  required
                  value={form.prnNo}
                  onChange={handleChange}
                  className="pl-10 text-sm"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., John Doe"
                  required
                  value={form.name}
                  onChange={handleChange}
                  className="pl-10 text-sm "
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g., m@example.com"
                  required
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10 text-sm "
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={handleChange}
                  className="pl-10 pr-10 text-sm "
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={form.role} onValueChange={handleRoleChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Registration Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Registering..." : "Create Account"}
            </Button>
          </form>
        </div>
      </div>
      <div className="hidden border-l-[0.2px] border-l-neutral-200 dark:border-l-neutral-800 bg-neutral-100 dark:bg-neutral-900 lg:flex items-center justify-center p-8">
        <CsvUserImporter />
      </div>
    </div>
  );
}
