import { useDashboardLayout } from '@/store/useDashboardLayout';
import { Button } from '@/components/ui/button';
import { toast } from "@/lib/utils/toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function WidgetControls() {
  const { widgets, visibleWidgets, toggleWidgetVisibility } = useDashboardLayout();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const hiddenWidgets = widgets.filter(w => !visibleWidgets.includes(w.id));

  return (
    <div className="flex flex-wrap gap-2 mb-4 animate-in slide-in-from-right duration-300">
      {hiddenWidgets.map(widget => (
        <Button
          key={widget.id}
          variant="outline"
          className="min-h-[44px] min-w-[44px]"
          onClick={() => {
            toggleWidgetVisibility(widget.id);
            toast.success("Widget dodany");
          }}
        >
          Dodaj {widget.name}
        </Button>
      ))}

      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="min-h-[44px] min-w-[44px]"
          >
            Resetuj układ
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetuj układ</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć wszystkie widgety? Ta akcja ukryje wszystkie widoczne widgety.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              visibleWidgets.forEach(id => toggleWidgetVisibility(id));
              toast.success("Widgety zresetowane");
              setResetDialogOpen(false);
            }}>
              Potwierdź
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
