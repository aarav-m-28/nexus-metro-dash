import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Languages, X, Volume2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TextTranslatorProps {
  selectedText: string;
  position: { x: number; y: number };
  onClose: () => void;
}

const languages = [
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'hi', name: 'Hindi' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'ta', name: 'Tamil' },
  { code: 'te', name: 'Telugu' },
  { code: 'kn', name: 'Kannada' },
];

export function TextTranslator({ selectedText, position, onClose }: TextTranslatorProps) {
  const [targetLanguage, setTargetLanguage] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const mockTranslate = async (text: string, targetLang: string) => {
    // Mock translation - in real app, use Google Translate API or similar
    const translations: Record<string, Record<string, string>> = {
      'safety protocol': {
        'hi': 'सुरक्षा प्रोटोकॉल',
        'ml': 'സുരക्ষാ പ്രോട്ടോക്കോൾ',
        'es': 'protocolo de seguridad',
        'fr': 'protocole de sécurité'
      },
      'emergency response': {
        'hi': 'आपातकालीन प्रतिक्रिया',
        'ml': 'അടിയന্തര പ്രതികരണം',
        'es': 'respuesta de emergencia',
        'fr': 'réponse d\'urgence'
      }
    };
    
    const lowerText = text.toLowerCase();
    for (const [key, trans] of Object.entries(translations)) {
      if (lowerText.includes(key)) {
        return trans[targetLang] || `[Translated: ${text}]`;
      }
    }
    return `[Translated to ${languages.find(l => l.code === targetLang)?.name}: ${text}]`;
  };

  const handleTranslate = async () => {
    if (!targetLanguage) return;
    
    setIsTranslating(true);
    try {
      const result = await mockTranslate(selectedText, targetLanguage);
      setTranslatedText(result);
    } catch (error) {
      setTranslatedText('Translation failed. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSpeak = () => {
    if (translatedText) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card 
      className="fixed z-50 p-4 w-80 border bg-card/95 backdrop-blur-sm shadow-lg animate-in fade-in-0 zoom-in-95"
      style={{
        left: Math.min(position.x, window.innerWidth - 320),
        top: Math.min(position.y + 10, window.innerHeight - 200)
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Languages className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Translate</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        <div className="p-2 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground mb-1">Selected text:</p>
          <p className="text-sm font-medium">{selectedText}</p>
        </div>

        <div className="flex gap-2">
          <Select onValueChange={setTargetLanguage}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleTranslate} 
            disabled={!targetLanguage || isTranslating}
            size="sm"
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>
        </div>

        {translatedText && (
          <div className="p-2 bg-primary/5 border border-primary/20 rounded-md">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm text-primary font-medium">Translation:</p>
              <Button variant="ghost" size="sm" onClick={handleSpeak}>
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-sm">{translatedText}</p>
          </div>
        )}
      </div>
    </Card>
  );
}