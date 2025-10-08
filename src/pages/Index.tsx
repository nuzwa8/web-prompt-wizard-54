import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const Index = () => {
  const [topic, setTopic] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");

  const proCamera = [
    { letter: "P", word: "Perspective", description: "Camera angle or point of view" },
    { letter: "R", word: "Resolution", description: "Image quality and detail level" },
    { letter: "O", word: "Objects", description: "Main subjects and elements" },
    { letter: "C", word: "Colors", description: "Color palette and mood" },
    { letter: "A", word: "Atmosphere", description: "Lighting and ambiance" },
    { letter: "M", word: "Medium", description: "Art style or technique" },
    { letter: "E", word: "Effects", description: "Special visual effects" },
    { letter: "R", word: "Realism", description: "Level of photorealism" },
    { letter: "A", word: "Aesthetic", description: "Overall visual style" },
  ];

  const handleGenerate = () => {
    if (!topic.trim()) return;
    
    const prompt = `${topic}, professional perspective, ultra high resolution 8K, detailed objects and composition, vibrant color palette, cinematic lighting and atmosphere, digital art medium, advanced ray tracing effects, photorealistic rendering, modern aesthetic design`;
    setGeneratedPrompt(prompt);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="inline-block rounded-full bg-primary/10 px-4 py-2 mb-6">
          <span className="text-primary font-semibold text-sm">P.R.O C.A.M.E.R.A Framework</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold mb-6">
          Transform Ideas Into{" "}
          <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            Perfect Image Prompts
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          AI-powered image prompt generator using the proven P.R.O C.A.M.E.R.A formula for stunning results
        </p>
        
        <Button size="lg" className="text-lg px-8 py-6">
          Start Creating Free
        </Button>
      </section>

      {/* Interactive Demo Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto bg-card rounded-2xl border shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-center">Try It Now</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Enter Your Image Idea</label>
              <Input
                placeholder="e.g., sunset over mountains"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="text-lg p-6"
              />
            </div>

            <Button onClick={handleGenerate} className="w-full" size="lg">
              Generate Prompt
            </Button>

            {generatedPrompt && (
              <div className="space-y-4 animate-fade-in">
                <label className="block text-sm font-medium">Generated Prompt</label>
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  className="min-h-[120px] text-base"
                />
              </div>
            )}
          </div>

          {/* P.R.O C.A.M.E.R.A Framework Display */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6 text-center">P.R.O C.A.M.E.R.A Framework</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {proCamera.map((item, idx) => (
                <div key={idx} className="bg-secondary/50 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl font-bold text-primary">{item.letter}</span>
                    <div>
                      <h4 className="font-semibold">{item.word}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Why Use Our Generator</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "P.R.O C.A.M.E.R.A Framework", desc: "9-point formula for perfect prompts" },
            { title: "Instant Generation", desc: "Get professional prompts in seconds" },
            { title: "AI Optimized", desc: "Works with all major AI image tools" },
            { title: "Easy to Use", desc: "No technical knowledge needed" },
          ].map((feature, idx) => (
            <div key={idx} className="bg-card rounded-xl border p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-bold mb-3 text-primary">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2025 AI Image Prompt Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
