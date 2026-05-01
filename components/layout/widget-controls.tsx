import { useDashboardLayout } from '@/store/useDashboardLayout';
import { Button } from '@/components/ui/button';

export default function WidgetControls() {
  const { widgets, visibleWidgets, toggleWidgetVisibility } = useDashboardLayout();

  const hiddenWidgets = widgets.filter(w => !visibleWidgets.includes(w.id));

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {hiddenWidgets.map(widget => (
        <Button
          key={widget.id}
          variant="outline"
          onClick={() => toggleWidgetVisibility(widget.id)}
        >
          Add {widget.name}
        </Button>
      ))}

      <Button
        variant="outline"
        onClick={() => visibleWidgets.forEach(id => toggleWidgetVisibility(id))}
      >
        Reset Layout
      </Button>
    </div>
  );
}
