"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AddAppDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add New App</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a new application</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="app-name">Application Name</Label>
            <Input id="app-name" placeholder="My Cool App" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-url">Application URL</Label>
            <Input id="app-url" placeholder="https://example.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-desc">Description</Label>
            <Textarea id="app-desc" placeholder="Short description..." />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button type="submit">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddAppDialog;


