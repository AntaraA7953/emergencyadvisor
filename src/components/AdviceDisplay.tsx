import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, Phone, AlertTriangle } from "lucide-react";

interface AdviceDisplayProps {
  emergency: string;
  advice: string;
}

interface Section {
  title: string;
  items: string[];
  icon: React.ReactNode;
  variant: 'success' | 'destructive' | 'warning' | 'default';
}

const AdviceDisplay = ({ emergency, advice }: AdviceDisplayProps) => {
  // Parse the advice into sections
  const parseAdvice = (text: string): Section[] => {
    const sections: Section[] = [];
    
    // Split by section headers
    const doMatch = text.match(/DO's?:?\s*\n([\s\S]*?)(?=\n\n|DON'T|WHEN TO CALL|IMMEDIATE STEPS|$)/i);
    const dontMatch = text.match(/DON'T'?s?:?\s*\n([\s\S]*?)(?=\n\n|WHEN TO CALL|IMMEDIATE STEPS|$)/i);
    const whenToCallMatch = text.match(/WHEN TO CALL EMERGENCY:?\s*\n([\s\S]*?)(?=\n\n|IMMEDIATE STEPS|$)/i);
    const immediateStepsMatch = text.match(/IMMEDIATE STEPS:?\s*\n([\s\S]*?)$/i);

    if (doMatch) {
      const items = doMatch[1]
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      sections.push({
        title: "DO's",
        items,
        icon: <CheckCircle2 className="w-6 h-6" />,
        variant: 'success'
      });
    }

    if (dontMatch) {
      const items = dontMatch[1]
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      sections.push({
        title: "DON'Ts",
        items,
        icon: <XCircle className="w-6 h-6" />,
        variant: 'destructive'
      });
    }

    if (whenToCallMatch) {
      const items = whenToCallMatch[1]
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      sections.push({
        title: "When to Call Emergency",
        items,
        icon: <Phone className="w-6 h-6" />,
        variant: 'warning'
      });
    }

    if (immediateStepsMatch) {
      const items = immediateStepsMatch[1]
        .split('\n')
        .filter(line => line.trim())
        .map(line => line.replace(/^\d+\.\s*/, '').trim());
      
      sections.push({
        title: "Immediate Steps",
        items,
        icon: <AlertTriangle className="w-6 h-6" />,
        variant: 'default'
      });
    }

    return sections;
  };

  const sections = parseAdvice(advice);

  const getCardClasses = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'border-accent bg-accent/5';
      case 'destructive':
        return 'border-destructive bg-destructive/5';
      case 'warning':
        return 'border-warning bg-warning/5';
      default:
        return 'border-primary bg-primary/5';
    }
  };

  const getIconColor = (variant: string) => {
    switch (variant) {
      case 'success':
        return 'text-accent';
      case 'destructive':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-primary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">First Aid for: {emergency}</h2>
        <p className="text-muted-foreground">Follow these steps carefully</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {sections.map((section, idx) => (
          <Card 
            key={idx}
            className={`p-6 border-2 ${getCardClasses(section.variant)}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={getIconColor(section.variant)}>
                {section.icon}
              </div>
              <h3 className="text-xl font-bold">{section.title}</h3>
            </div>
            <ul className="space-y-3">
              {section.items.map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-2">
                  <span className="font-semibold text-muted-foreground min-w-6">
                    {itemIdx + 1}.
                  </span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-destructive/10 border-destructive">
        <p className="text-center font-semibold">
          ⚠️ If symptoms worsen or persist, seek immediate professional medical attention
        </p>
      </Card>
    </div>
  );
};

export default AdviceDisplay;
