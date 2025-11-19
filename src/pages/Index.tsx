import { useState } from "react";
import { Search, AlertCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import EmergencyCard from "@/components/EmergencyCard";
import AdviceDisplay from "@/components/AdviceDisplay";

const commonEmergencies = [
  { id: 1, name: "Burns", icon: "🔥" },
  { id: 2, name: "Snake Bite", icon: "🐍" },
  { id: 3, name: "Choking", icon: "😮" },
  { id: 4, name: "Bleeding", icon: "🩸" },
  { id: 5, name: "Heart Attack", icon: "❤️" },
  { id: 6, name: "Fainting", icon: "😵" },
  { id: 7, name: "Fracture", icon: "🦴" },
  { id: 8, name: "Poisoning", icon: "☠️" },
];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [currentEmergency, setCurrentEmergency] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSearch = async (emergency: string) => {
    if (!emergency.trim()) {
      toast({
        title: "Please enter an emergency",
        description: "Type what emergency you need help with",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setCurrentEmergency(emergency);
    setAdvice(null);

    try {
      const { data, error } = await supabase.functions.invoke('first-aid-advice', {
        body: { emergency: emergency.trim() }
      });

      if (error) {
        console.error('Function error:', error);
        
        if (error.message?.includes('429')) {
          toast({
            title: "Too Many Requests",
            description: "Please wait a moment before trying again.",
            variant: "destructive",
          });
          return;
        }
        
        if (error.message?.includes('402')) {
          toast({
            title: "Service Unavailable",
            description: "AI service credits exhausted. Please contact support.",
            variant: "destructive",
          });
          return;
        }

        throw error;
      }

      if (data?.advice) {
        setAdvice(data.advice);
        // Scroll to advice
        setTimeout(() => {
          document.getElementById('advice-section')?.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
          });
        }, 100);
      } else {
        throw new Error('No advice received');
      }

    } catch (error) {
      console.error('Error getting first aid advice:', error);
      toast({
        title: "Error",
        description: "Failed to get first aid advice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmergencySelect = (emergencyName: string) => {
    setSearchQuery(emergencyName);
    handleSearch(emergencyName);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="bg-emergency-gradient text-primary-foreground py-12 md:py-16 shadow-emergency">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <AlertCircle className="w-12 h-12 md:w-16 md:h-16 mr-3" />
            <h1 className="text-4xl md:text-6xl font-bold">AI Emergency Advisor</h1>
          </div>
          <p className="text-lg md:text-xl mb-8 opacity-95">
            Instant first aid guidance when every second counts
          </p>
          
          {/* Search Bar */}
          <Card className="max-w-2xl mx-auto p-2 bg-card/95 backdrop-blur">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Type emergency: burn, snake bite, choking..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="pl-10 h-12 text-lg"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={() => handleSearch(searchQuery)}
                disabled={isLoading}
                size="lg"
                className="px-8"
              >
                {isLoading ? "Getting Help..." : "Get Help"}
              </Button>
            </div>
          </Card>
        </div>
      </header>

      {/* Common Emergencies */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
          Common Emergencies
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {commonEmergencies.map((emergency) => (
            <EmergencyCard
              key={emergency.id}
              name={emergency.name}
              icon={emergency.icon}
              onClick={() => handleEmergencySelect(emergency.name)}
              disabled={isLoading}
            />
          ))}
        </div>
      </section>

      {/* Emergency Call Section */}
      <section className="bg-destructive/10 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Phone className="w-6 h-6 text-destructive" />
            <h3 className="text-xl font-semibold">
              In severe emergencies, call your local emergency number immediately
            </h3>
          </div>
          <p className="text-muted-foreground">
            This tool provides first aid guidance but is not a replacement for professional medical care
          </p>
        </div>
      </section>

      {/* Advice Display */}
      {advice && currentEmergency && (
        <section id="advice-section" className="container mx-auto px-4 py-12">
          <AdviceDisplay 
            emergency={currentEmergency}
            advice={advice}
          />
        </section>
      )}

      {/* Footer */}
      <footer className="bg-muted py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            ⚠️ Always seek professional medical help in serious situations. This is for informational purposes only.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
