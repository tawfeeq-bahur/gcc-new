"use client";

import { AlertCircle, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DemoModeBanner() {
  return (
    <Card className="bg-amber-500/10 border-amber-500/50 mb-6">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="h-5 w-5 text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-amber-400 font-semibold mb-2">
              🎭 Demo Mode Active
            </h3>
            <p className="text-sm text-slate-300 mb-3">
              You're seeing <strong>mock AI analysis</strong>. For real Gemini AI-powered resume analysis, add your API key to <code className="bg-slate-800 px-2 py-0.5 rounded">.env.local</code>
            </p>
            <div className="flex gap-3">
              <Button
                size="sm"
                variant="outline"
                className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Get Free API Key
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-slate-400 hover:text-slate-300"
                onClick={() => toast.info(
                  '1. Get your key from: https://makersuite.google.com/app/apikey\n' +
                  '2. Open .env.local file\n' +
                  '3. Replace "your_gemini_api_key_here" with your actual key\n' +
                  '4. Restart the dev server (npm run dev)',
                  { duration: 8000 }
                )}
              >
                Setup Instructions
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
