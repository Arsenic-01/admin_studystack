"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useUpdateLink } from "@/hooks/useAdminData";

// Define the validation schema for the form
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters."),
  url: z.string().url("Please enter a valid URL."),
  // formType is optional because it only applies to 'form' links
  formType: z.enum(["googleForm", "assignment", "other"]).optional(),
});

type FormSchemaType = z.infer<typeof formSchema>;

export interface LinkForEdit {
  id: string;
  title: string;
  url: string;
  type: "youtube" | "form";
  formType?: "googleForm" | "assignment" | "other";
}

interface EditLinkModalProps {
  link: LinkForEdit | null;
  open: boolean;
  onClose: () => void;
}

export function EditLinkModal({ link, open, onClose }: EditLinkModalProps) {
  const form = useForm<FormSchemaType>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: link?.title || "",
      url: link?.url || "",
      formType: link?.formType,
    },
  });

  // Reset form when a new link is passed in
  useEffect(() => {
    if (link) {
      form.reset({
        title: link.title,
        url: link.url,
        formType: link.formType,
      });
    }
  }, [link, form]);

  const { mutate: updateLink, isPending } = useUpdateLink();

  const handleSubmit = (values: FormSchemaType) => {
    if (!link) return;
    updateLink(
      { id: link.id, type: link.type, ...values },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit {link?.type === "youtube" ? "YouTube Link" : "Form Link"}
          </DialogTitle>
          <DialogDescription>
            Make changes to the link details below. Click save when you&apos;re
            done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter link title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Conditionally render the formType selector only for 'form' links */}
            {link?.type === "form" && (
              <FormField
                control={form.control}
                name="formType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Form Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a form type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="googleForm">Google Form</SelectItem>
                        <SelectItem value="assignment">Assignment</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
