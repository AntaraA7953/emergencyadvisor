import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface EmergencyCardProps {
  name: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
}

const EmergencyCard = ({ name, icon, onClick, disabled }: EmergencyCardProps) => {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      className={cn(
        "p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105",
        "border-2 hover:border-primary",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-md"
      )}
    >
      <div className="text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="font-semibold text-lg">{name}</h3>
      </div>
    </Card>
  );
};

export default EmergencyCard;
