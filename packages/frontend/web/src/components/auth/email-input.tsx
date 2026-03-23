import { useState } from "react";
import { cn } from "#lib/utils";
import { Input } from "#components/base/input.tsx";
import { Button } from "#components/base/button.tsx";

interface EmailInputProps {
  onSubmit: (email: string) => void;
  isLoading: boolean;
  placeholder?: string;
  className?: string;
}

export function EmailInput({ onSubmit, isLoading, placeholder = "your@email.com", className }: EmailInputProps) {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    onSubmit(email);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !email.trim()}>
          {isLoading ? "..." : "Submit"}
        </Button>
      </div>
    </form>
  );
}
