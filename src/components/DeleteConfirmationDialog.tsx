import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "./ui/button";
import { showError, showSuccess } from "@/utils/toast";

interface DeleteConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const CORRECT_PASSWORD = "941642";

export function DeleteConfirmationDialog({ isOpen, onClose, onConfirm }: DeleteConfirmationDialogProps) {
  const [password, setPassword] = useState("");

  const handleConfirm = () => {
    if (password === CORRECT_PASSWORD) {
      onConfirm();
      showSuccess("השורה נמחקה בהצלחה.");
      onClose();
    } else {
      showError("סיסמה שגויה.");
    }
    setPassword("");
  };
  
  const handleCancel = () => {
    setPassword("");
    onClose();
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>אישור מחיקה</AlertDialogTitle>
          <AlertDialogDescription>
            האם אתה בטוח שברצונך למחוק את השורה? פעולה זו היא בלתי הפיכה.
            <br />
            יש להזין סיסמה כדי לאשר את המחיקה.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2">
          <Label htmlFor="delete-password">סיסמה</Label>
          <Input
            id="delete-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="הזן סיסמה"
            onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
          />
        </div>
        <AlertDialogFooter>
          <Button variant="outline" onClick={handleCancel}>ביטול</Button>
          <Button variant="destructive" onClick={handleConfirm}>אישור מחיקה</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}