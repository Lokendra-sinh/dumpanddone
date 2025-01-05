import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Input,
} from "@dumpanddone/ui";
import { useState } from "react";

export const WaitlistModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Email:", email);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl border-none shadow-sm">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-medium text-black">
            Your personal content alchemist is almost ready!
          </DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            We're crafting the perfect tool to transform your scattered notes
            into golden content. Be among the first to experience the magic.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 bg-white border rounded-xl"
              required
            />
            <Button
              type="submit"
              className="w-full h-11 rounded-xl text-base font-medium text-white bg-primary hover:bg-primary/90"
            >
              Save My Spot
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
