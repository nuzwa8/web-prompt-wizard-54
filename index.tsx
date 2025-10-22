import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, RotateCcw, Sparkles, BookOpen, Users, Trash2, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Character {
  id: string;
  name: string;
  age: string;
  gender: string;
  hair: string;
  eyes: string;
  face: string;
  clothing: string;
  uniqueFeatures: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState("ai-generator");
  const [topic, setTopic] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const { toast } = useToast();

  // Ready-Made Prompts State
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPrompts, setCurrentPrompts] = useState<string[]>([]);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [editablePrompt, setEditablePrompt] = useState("");

  // Consistent Character State
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<string>("");
  const [characterForm, setCharacterForm] = useState<Omit<Character, 'id'>>({
    name: "",
    age: "",
    gender: "",
    hair: "",
    eyes: "",
    face: "",
    clothing: "",
    uniqueFeatures: ""
  });
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedExpression, setSelectedExpression] = useState("");
  const [selectedBackground, setSelectedBackground] = useState("");
  const [characterPrompt, setCharacterPrompt] = useState("");

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

  // Ready-Made Prompts Data
  const promptCategories = {
    "Nature & Landscapes": [
      "Majestic mountain peak at golden hour, dramatic clouds, ultra-wide angle, 8K resolution, vivid sunset colors, atmospheric fog, photorealistic landscape photography, HDR lighting, epic scale",
      "Serene forest path with dappled sunlight, morning mist, eye-level perspective, lush green foliage, soft natural lighting, painterly style, peaceful atmosphere",
      "Crystal clear turquoise ocean waves, aerial view, pristine beach, tropical paradise, vibrant blues and whites, sunny day, high detail, paradise aesthetic",
      "Aurora borealis dancing over snowy mountains, night photography, wide angle, vibrant green and purple lights, starry sky, long exposure effect, magical atmosphere",
      "Ancient redwood forest, towering trees, ground-level perspective, filtered sunlight beams, rich earthy tones, mystical ambiance, fine art photography",
      "Desert sand dunes at sunrise, dramatic shadows, warm golden tones, minimalist composition, high contrast, cinematic lighting, vast scale",
      "Waterfall cascading into emerald pool, lush jungle surroundings, silky water effect, vibrant greens, tropical lighting, paradise aesthetic",
      "Autumn forest with colorful foliage, winding path, warm orange and red tones, soft overcast lighting, cozy atmosphere, medium detail",
      "Volcanic landscape with glowing lava, dramatic perspective, intense reds and oranges, dark volcanic rock, powerful atmosphere, high contrast",
      "Lavender field at sunset, rows of purple flowers, warm golden light, pastoral scene, peaceful mood, romantic aesthetic",
      "Rocky coastline with crashing waves, dramatic seascape, stormy sky, high detail spray, moody atmosphere, powerful nature",
      "Bamboo forest path, vertical lines, soft filtered light, peaceful zen atmosphere, natural green tones, minimalist composition",
      "Alpine meadow with wildflowers, mountain backdrop, clear blue sky, vibrant colors, idyllic scene, crisp detail",
      "Misty lake reflection at dawn, mirror-like water, silhouette mountains, pastel sky colors, tranquil mood, ethereal atmosphere",
      "Canyon landscape, layered rock formations, warm earth tones, late afternoon light, geological detail, grand scale",
      "Tropical rainforest canopy, bird's eye view, dense vegetation, vibrant greens, dappled sunlight, rich biodiversity",
      "Northern lights over frozen lake, ice formations, purple and green aurora, starry sky, winter wonderland, magical realism",
      "Sunset over wheat field, golden crops swaying, warm tones, rural landscape, peaceful evening, pastoral beauty",
      "Rocky mountain stream, flowing water, moss-covered stones, forest surroundings, cool blue-green tones, refreshing atmosphere",
      "Cherry blossom trees in full bloom, pink petals falling, spring scene, soft pastel colors, romantic Japanese aesthetic"
    ],
    "Portrait & People": [
      "Professional headshot, confident business person, eye-level angle, neutral background, studio lighting, sharp focus, natural skin tones, modern corporate aesthetic",
      "Candid street portrait, urban environment, shallow depth of field, golden hour lighting, authentic expression, documentary style, vibrant city life",
      "Fashion editorial portrait, dramatic pose, high-key lighting, designer clothing, artistic makeup, glossy magazine style, elegant aesthetic",
      "Environmental portrait, craftsperson at work, natural workspace lighting, authentic setting, detailed background, storytelling composition",
      "Close-up beauty portrait, flawless skin, macro detail, soft studio lighting, pastel colors, dreamy aesthetic, high fashion",
      "Group family portrait, multiple generations, warm home setting, natural poses, soft even lighting, heartwarming atmosphere",
      "Athlete in action, dynamic movement, sports photography, dramatic lighting, powerful stance, intense expression, energetic composition",
      "Vintage style portrait, classic Hollywood lighting, black and white, timeless elegance, film noir aesthetic, dramatic shadows",
      "Child portrait with natural expression, playful mood, soft natural light, colorful environment, candid moment, joyful atmosphere",
      "Senior portrait with character, weathered face details, respectful composition, natural lighting, storytelling wrinkles, dignified presence",
      "Artistic double exposure portrait, silhouette filled with landscape, creative composition, dreamy effect, symbolic imagery",
      "Glamour portrait, elegant pose, luxury setting, dramatic makeup, sophisticated lighting, high-end fashion aesthetic",
      "Lifestyle portrait, authentic daily activity, natural environment, candid expression, relatable setting, documentary approach",
      "Silhouette portrait at sunset, dramatic backlight, simple composition, emotional mood, artistic minimalism, powerful outline",
      "Studio portrait with colored gels, creative lighting, dramatic colors, fashion-forward, experimental style, bold aesthetic",
      "Outdoor natural light portrait, soft overcast day, genuine smile, environmental background, fresh and airy feel",
      "Corporate team portrait, professional group, office setting, confident poses, balanced lighting, business atmosphere",
      "Artistic profile portrait, side angle, dramatic shadows, minimalist background, elegant composition, timeless style",
      "Maternity portrait, glowing expectant mother, soft lighting, flowing fabric, tender mood, life-celebrating aesthetic",
      "Character portrait, unique personality, interesting styling, creative background, authentic expression, storytelling details"
    ],
    "Fantasy & Sci-Fi": [
      "Cyberpunk cityscape at night, neon lights reflecting on wet streets, futuristic architecture, flying vehicles, vibrant purple and blue tones, dystopian atmosphere, high-tech aesthetic",
      "Majestic dragon perched on mountain peak, scales detail, epic fantasy scene, dramatic sky, powerful presence, mythical creature, cinematic composition",
      "Space station orbiting alien planet, detailed spacecraft, cosmic background, colorful nebula, sci-fi technology, vast scale, futuristic design",
      "Enchanted forest with glowing mushrooms, magical creatures, bioluminescent plants, mystical fog, fairy tale atmosphere, vibrant fantasy colors",
      "Post-apocalyptic ruins, overgrown vegetation, abandoned city, dramatic lighting, desolate atmosphere, survival aesthetic, detailed decay",
      "Steampunk airship, brass and copper details, Victorian era fusion, cloudy sky, mechanical intricacy, retro-futuristic design",
      "Portal to another dimension, swirling energy, magical gateway, cosmic colors, mystical artifacts, otherworldly atmosphere",
      "Alien landscape, multiple moons, strange rock formations, exotic vegetation, sci-fi exploration, unknown planet aesthetic",
      "Medieval fantasy castle, imposing towers, dramatic sky, magical aura, detailed stonework, epic fantasy setting",
      "Futuristic soldier in powered armor, high-tech weapons, battlefield scene, dynamic pose, military sci-fi, detailed mech suit",
      "Underwater city, bioluminescent architecture, marine life, glass domes, aquatic civilization, deep ocean atmosphere",
      "Wizard casting spell, magical energy effects, mystical robes, ancient library, glowing runes, fantasy magic aesthetic",
      "Robot character with human emotions, detailed mechanical parts, futuristic design, expressive face, AI consciousness theme",
      "Fairy kingdom hidden in flowers, miniature architecture, magical creatures, soft glowing light, whimsical fantasy world",
      "Time traveler in Victorian steampunk outfit, temporal distortion effects, mixed era elements, adventure aesthetic",
      "Alien encounter, first contact scene, mysterious extraterrestrial, spacecraft landing, dramatic atmosphere, sci-fi wonder",
      "Mythical phoenix rising from flames, vibrant fire colors, majestic bird, rebirth symbolism, epic fantasy creature",
      "Cybernetic enhancement surgery, futuristic medical lab, high-tech equipment, sci-fi transhumanism, clinical lighting",
      "Magical library with floating books, endless shelves, mystical atmosphere, warm candlelight, fantasy knowledge realm",
      "Space battle scene, starfighters engaged, laser effects, explosive action, cosmic background, epic sci-fi warfare"
    ],
    "Architecture & Urban": [
      "Modern skyscraper, glass facade reflecting clouds, architectural photography, symmetrical composition, urban landscape, clean lines, contemporary design",
      "Historic cathedral interior, vaulted ceilings, stained glass windows, dramatic light beams, gothic architecture, sacred atmosphere",
      "Narrow European street, cobblestone path, colorful buildings, flower boxes, charming old town, warm afternoon light",
      "Minimalist Japanese house, clean lines, natural materials, zen garden, indoor-outdoor connection, serene atmosphere",
      "Art deco building facade, geometric patterns, vintage elegance, rich colors, 1920s aesthetic, ornate details",
      "Futuristic smart city, sustainable architecture, green buildings, efficient design, utopian urban planning, eco-friendly",
      "Ancient ruins, weathered stone columns, historical site, dramatic sky, archaeological beauty, timeless grandeur",
      "Brutalist concrete structure, geometric forms, stark composition, modernist architecture, dramatic shadows, raw aesthetic",
      "Cozy cafe interior, warm lighting, rustic decor, inviting atmosphere, wooden furniture, intimate setting",
      "Contemporary museum, white walls, natural skylight, gallery space, minimalist design, art exhibition environment",
      "Victorian mansion exterior, ornate details, period architecture, manicured garden, historical elegance, grand entrance",
      "Industrial loft conversion, exposed brick, high ceilings, modern furnishings, urban living, adaptive reuse",
      "Traditional Chinese temple, red pillars, curved roofs, intricate carvings, cultural architecture, spiritual atmosphere",
      "Modern bridge design, engineering marvel, spanning water, sunset reflection, architectural innovation, elegant structure",
      "Abandoned factory interior, industrial decay, dramatic light through broken windows, urban exploration, post-industrial",
      "Luxury hotel lobby, grand chandelier, marble floors, opulent design, hospitality architecture, sophisticated ambiance",
      "Suburban neighborhood, tree-lined street, diverse houses, residential architecture, community atmosphere, American dream",
      "Gothic castle at night, illuminated windows, mysterious atmosphere, medieval architecture, dramatic presence",
      "Open-plan office space, collaborative design, natural light, modern workplace, ergonomic furniture, productive environment",
      "Mediterranean villa, white walls, blue accents, terracotta tiles, coastal architecture, vacation paradise aesthetic"
    ],
    "Animals & Wildlife": [
      "Majestic lion portrait, intense gaze, golden mane, close-up detail, savanna background, natural lighting, wildlife photography",
      "Eagle soaring in flight, wings spread, mountain backdrop, action shot, powerful presence, nature's predator, dynamic composition",
      "Underwater dolphin pod, crystal clear water, playful swimming, marine life, sunlight rays, ocean blue tones, graceful movement",
      "Baby elephant with mother, tender moment, African plains, dust particles, warm sunset light, family bond, emotional wildlife",
      "Colorful parrot in rainforest, vibrant feathers, tropical vegetation, detailed plumage, natural habitat, exotic bird beauty",
      "Wolf pack in snowy forest, winter landscape, pack dynamics, cold atmosphere, survival theme, wild nature",
      "Butterfly on flower, macro photography, delicate wings, vibrant colors, shallow depth of field, natural detail",
      "Humpback whale breaching, massive scale, ocean spray, dramatic action, marine wildlife, powerful nature moment",
      "Red fox in autumn forest, bushy tail, curious expression, fall foliage, natural habitat, wildlife portrait",
      "Penguin colony in Antarctica, ice landscape, group behavior, cold blue tones, polar wildlife, community atmosphere",
      "Cheetah sprinting, motion blur, maximum speed, African savanna, predator in action, wildlife dynamics",
      "Orangutan in jungle canopy, expressive face, hanging from branch, rainforest habitat, endangered species, primate intelligence",
      "Seahorse underwater, intricate details, colorful coral reef, marine ecosystem, delicate creature, underwater macro",
      "Grizzly bear catching salmon, river rapids, wildlife feeding, natural behavior, Alaska wilderness, action photography",
      "Peacock displaying feathers, iridescent colors, mating ritual, detailed plumage, natural behavior, ornate bird beauty",
      "Meerkat standing guard, desert landscape, alert posture, family group, African wildlife, curious nature",
      "Owl in flight, wings spread, nocturnal hunter, forest background, silent predator, nighttime wildlife",
      "Giraffe family at sunset, long necks, savanna silhouette, golden hour, peaceful scene, African wildlife",
      "Clownfish in anemone, symbiotic relationship, coral reef colors, underwater scene, tropical marine life",
      "Tiger in jungle, striped pattern, powerful stance, dense vegetation, apex predator, endangered species awareness"
    ],
    "Food & Culinary": [
      "Gourmet burger, juicy patty, fresh ingredients, overhead shot, rustic wooden table, restaurant quality, appetizing presentation, food photography",
      "Fresh sushi platter, artistic arrangement, colorful rolls, clean white plate, minimalist style, Japanese cuisine, professional presentation",
      "Chocolate lava cake, molten center flowing, powdered sugar dusting, elegant plating, dessert photography, indulgent treat",
      "Farm-to-table salad, vibrant vegetables, artisanal presentation, natural light, healthy eating, organic ingredients, fresh aesthetic",
      "Pizza from wood-fired oven, melted cheese, crispy crust, Italian cuisine, rustic setting, traditional cooking, appetizing detail",
      "Craft coffee with latte art, ceramic cup, morning light, cozy cafe atmosphere, artisan beverage, warm tones",
      "Colorful smoothie bowl, fresh fruits, granola topping, breakfast photography, healthy lifestyle, Instagram aesthetic",
      "Steaming ramen bowl, rich broth, perfect egg, Asian cuisine, comfort food, detailed toppings, warming dish",
      "Charcuterie board, assorted meats and cheeses, artisan arrangement, wine pairing, entertaining, gourmet selection",
      "Freshly baked croissants, flaky layers, bakery display, French pastry, golden brown, buttery perfection",
      "Grilled steak, perfect sear marks, juicy cut, side vegetables, upscale dining, culinary excellence, meat lover's dream",
      "Homemade pasta, flour dusted surface, Italian cooking, rustic kitchen, traditional preparation, authentic cuisine",
      "Tropical fruit bowl, exotic varieties, vibrant colors, healthy snack, summery feel, refreshing presentation",
      "Artisan bread loaves, crusty exterior, bakery setting, rustic display, traditional baking, wholesome food",
      "Tacos with fresh ingredients, Mexican cuisine, colorful toppings, street food style, appetizing close-up, authentic flavors",
      "Decadent chocolate truffles, luxury confection, elegant arrangement, gift-worthy, rich cocoa, artisan chocolatier",
      "Fresh oysters on ice, seafood platter, lemon wedges, fine dining, coastal cuisine, elegant presentation",
      "Pancake stack with syrup, breakfast classic, butter melting, morning comfort food, fluffy texture, appetizing drizzle",
      "Colorful macarons, French pastry, pastel colors, delicate cookies, elegant dessert, bakery showcase",
      "BBQ ribs with sauce, glazed meat, smoky flavor visual, American cuisine, outdoor cooking, savory presentation"
    ]
  };

  const actions = [
    "standing confidently", "sitting relaxed", "walking forward", "running fast",
    "jumping high", "dancing gracefully", "fighting stance", "thinking deeply",
    "laughing joyfully", "reading book", "drinking coffee", "talking on phone",
    "working on laptop", "exercising", "cooking food", "painting artwork",
    "playing music", "driving vehicle", "flying through air", "meditating peacefully",
    "climbing mountain", "swimming", "riding horse", "shooting bow"
  ];

  const expressions = [
    "happy smile", "sad tears", "angry scowl", "surprised wide eyes",
    "confused look", "determined face", "scared expression", "excited grin",
    "thoughtful gaze", "peaceful calm", "worried frown", "loving eyes"
  ];

  const backgrounds = [
    "modern city street", "peaceful forest", "sandy beach", "snowy mountains",
    "cozy room interior", "bustling marketplace", "ancient ruins", "futuristic laboratory",
    "elegant ballroom", "dark alley", "colorful garden", "desert landscape",
    "underwater scene", "space station", "medieval castle", "tropical jungle"
  ];

  // Load characters from localStorage
  useEffect(() => {
    const savedCharacters = localStorage.getItem('story-characters');
    if (savedCharacters) {
      setCharacters(JSON.parse(savedCharacters));
    }
  }, []);

  // Save characters to localStorage
  const saveCharacters = (chars: Character[]) => {
    localStorage.setItem('story-characters', JSON.stringify(chars));
    setCharacters(chars);
  };

  // AI Generator Functions
  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Error",
        description: "Please enter an image idea first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prompt', {
        body: { topic: topic.trim() }
      });

      if (error) throw error;

      if (data?.generatedPrompt) {
        const cleanedPrompt = data.generatedPrompt
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/#+\s*/g, '')
          .trim();
        
        setGeneratedPrompt(cleanedPrompt);
        toast({
          title: "Success",
          description: "AI-powered prompt generated successfully!",
        });
      }
    } catch (error) {
      console.error('Error generating prompt:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate prompt",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = async (text: string) => {
    if (!text) return;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Prompt copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy prompt",
        variant: "destructive",
      });
    }
  };

  const handleEnhancePrompt = async () => {
    if (!generatedPrompt) return;
    
    setIsEnhancing(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-prompt', {
        body: { topic: `Enhance this prompt to make it more detailed and vivid: ${generatedPrompt}` }
      });

      if (error) throw error;

      if (data?.generatedPrompt) {
        const cleanedPrompt = data.generatedPrompt
          .replace(/\*\*/g, '')
          .replace(/\*/g, '')
          .replace(/#+\s*/g, '')
          .trim();
        
        setGeneratedPrompt(cleanedPrompt);
        toast({
          title: "Enhanced!",
          description: "Prompt has been enhanced successfully",
        });
      }
    } catch (error) {
      console.error('Error enhancing prompt:', error);
      toast({
        title: "Error",
        description: "Failed to enhance prompt",
        variant: "destructive",
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  // Ready-Made Prompts Functions
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    const prompts = promptCategories[category as keyof typeof promptCategories];
    setCurrentPrompts(prompts);
    setSelectedPrompt("");
    setEditablePrompt("");
  };

  const handleRefreshPrompts = () => {
    if (!selectedCategory) return;
    
    const prompts = promptCategories[selectedCategory as keyof typeof promptCategories];
    const shuffled = [...prompts].sort(() => Math.random() - 0.5);
    setCurrentPrompts(shuffled);
    toast({
      title: "Refreshed!",
      description: "Prompts refreshed successfully",
    });
  };

  const handleSelectPrompt = (prompt: string) => {
    setSelectedPrompt(prompt);
    setEditablePrompt(prompt);
  };

  // Consistent Character Functions
  const generateCharacterName = () => {
    const count = characters.length + 1;
    return `Character ${count}`;
  };

  const handleSaveCharacter = () => {
    if (characters.length >= 3) {
      toast({
        title: "Limit Reached",
        description: "Maximum 3 characters allowed. Delete one to add new.",
        variant: "destructive",
      });
      return;
    }

    const finalName = characterForm.name.trim() || generateCharacterName();
    
    const newCharacter: Character = {
      id: Date.now().toString(),
      ...characterForm,
      name: finalName
    };

    saveCharacters([...characters, newCharacter]);
    
    // Reset form
    setCharacterForm({
      name: "",
      age: "",
      gender: "",
      hair: "",
      eyes: "",
      face: "",
      clothing: "",
      uniqueFeatures: ""
    });

    toast({
      title: "Character Saved!",
      description: `${finalName} has been saved successfully",
    });
  };

  const handleDeleteCharacter = (id: string) => {
    const updated = characters.filter(char => char.id !== id);
    saveCharacters(updated);
    if (selectedCharacter === id) {
      setSelectedCharacter("");
    }
    toast({
      title: "Character Deleted",
      description: "Character removed successfully",
    });
  };

  const handleGenerateCharacterPrompt = () => {
    if (!selectedCharacter || !selectedAction || !selectedExpression || !selectedBackground) {
      toast({
        title: "Missing Information",
        description: "Please select character, action, expression, and background",
        variant: "destructive",
      });
      return;
    }

    const character = characters.find(c => c.id === selectedCharacter);
    if (!character) return;

    const prompt = `${character.name}, ${character.age} years old, ${character.gender}, with ${character.hair} hair and ${character.eyes} eyes, ${character.face} facial features, wearing ${character.clothing}${character.uniqueFeatures ? `, with ${character.uniqueFeatures}` : ''}, ${selectedAction}, ${selectedExpression}, in ${selectedBackground}. P.R.O C.A.M.E.R.A optimized: medium shot perspective, 8K ultra-high resolution, detailed character focus, vibrant natural colors, cinematic atmospheric lighting, photorealistic digital art medium, volumetric light effects, hyper-realistic rendering, professional aesthetic quality.`;

    setCharacterPrompt(prompt);
    toast({
      title: "Prompt Generated!",
      description: "Character prompt created successfully",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
          Transform Ideas Into{" "}
          <span className="bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
            Perfect Image Prompts
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4">
          AI-powered image prompt generator with P.R.O C.A.M.E.R.A framework
        </p>
      </section>

      {/* Main Tabs Section */}
      <section className="container mx-auto px-4 py-8 md:py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-auto">
            <TabsTrigger value="ai-generator" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 text-xs md:text-base">
              <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">AI Generator</span>
              <span className="sm:hidden">AI</span>
            </TabsTrigger>
            <TabsTrigger value="ready-made" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 text-xs md:text-base">
              <BookOpen className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Ready-Made</span>
              <span className="sm:hidden">Prompts</span>
            </TabsTrigger>
            <TabsTrigger value="character" className="flex flex-col md:flex-row items-center gap-1 md:gap-2 py-3 md:py-2 text-xs md:text-base">
              <Users className="h-4 w-4 md:h-5 md:w-5" />
              <span className="hidden sm:inline">Consistent Character</span>
              <span className="sm:hidden">Character</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: AI Generator */}
          <TabsContent value="ai-generator" className="mt-0">
            <div className="max-w-4xl mx-auto bg-card rounded-2xl border shadow-lg p-4 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">AI Prompt Generator</h2>
              
              <div className="space-y-4 md:space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Enter Your Image Idea</label>
                  <Input
                    placeholder="e.g., sunset over mountains"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="text-base md:text-lg p-4 md:p-6"
                  />
                </div>

                <Button 
                  onClick={handleGenerate} 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading || !topic.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    'Generate Prompt'
                  )}
                </Button>

                {generatedPrompt && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <label className="block text-sm font-medium">Generated Prompt</label>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          onClick={() => handleCopyPrompt(generatedPrompt)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          <span className="hidden sm:inline">Copy</span>
                        </Button>
                        <Button
                          onClick={handleEnhancePrompt}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          disabled={isEnhancing}
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span className="hidden sm:inline">{isEnhancing ? "Enhancing..." : "Enhance"}</span>
                        </Button>
                        <Button
                          onClick={handleGenerate}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          disabled={isLoading}
                        >
                          <RotateCcw className="h-4 w-4" />
                          <span className="hidden sm:inline">Regenerate</span>
                        </Button>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-primary/30 p-4">
                      <Textarea
                        value={generatedPrompt}
                        readOnly
                        className="min-h-[120px] text-sm md:text-base border-0 bg-transparent resize-none focus:ring-0"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* P.R.O C.A.M.E.R.A Framework */}
              <div className="mt-8 md:mt-12">
                <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">P.R.O C.A.M.E.R.A Framework</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  {proCamera.map((item, idx) => (
                    <div key={idx} className="bg-secondary/50 rounded-lg p-3 md:p-4 border border-primary/20">
                      <div className="flex items-start gap-2 md:gap-3">
                        <span className="text-xl md:text-2xl font-bold text-primary">{item.letter}</span>
                        <div>
                          <h4 className="font-semibold text-sm md:text-base">{item.word}</h4>
                          <p className="text-xs md:text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Tab 2: Ready-Made Prompts */}
          <TabsContent value="ready-made" className="mt-0">
            <div className="max-w-6xl mx-auto bg-card rounded-2xl border shadow-lg p-4 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-center">Ready-Made Prompts Library</h2>
              
              <div className="space-y-4 md:space-y-6">
                {/* Category Selection */}
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <div className="flex-1">
                    <Label>Select Category</Label>
                    <Select value={selectedCategory} onValueChange={handleCategorySelect}>
                      <SelectTrigger className="w-full mt-2">
                        <SelectValue placeholder="Choose a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(promptCategories).map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={handleRefreshPrompts}
                      disabled={!selectedCategory}
                      variant="outline"
                      className="w-full sm:w-auto"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </div>

                {/* Prompts Grid */}
                {currentPrompts.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 max-h-[600px] overflow-y-auto p-2">
                    {currentPrompts.map((prompt, idx) => (
                      <Card 
                        key={idx} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedPrompt === prompt ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => handleSelectPrompt(prompt)}
                      >
                        <CardContent className="p-3 md:p-4">
                          <p className="text-xs md:text-sm line-clamp-4">{prompt}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Selected Prompt Editor */}
                {selectedPrompt && (
                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <Label>Edit & Customize Prompt</Label>
                      <Button
                        onClick={() => handleCopyPrompt(editablePrompt)}
                        variant="outline"
                        size="sm"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={editablePrompt}
                      onChange={(e) => setEditablePrompt(e.target.value)}
                      className="min-h-[150px] text-sm md:text-base"
                      placeholder="Edit the prompt as you like..."
                    />
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Consistent Character */}
          <TabsContent value="character" className="mt-0">
            <div className="max-w-6xl mx-auto space-y-6">
              
              {/* Saved Characters */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl md:text-2xl">Saved Characters ({characters.length}/3)</CardTitle>
                  <CardDescription>Create up to 3 characters for your stories</CardDescription>
                </CardHeader>
                <CardContent>
                  {characters.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No characters saved yet. Create your first character below!</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {characters.map((char) => (
                        <Card key={char.id} className="relative">
                          <CardContent className="p-4">
                            <Button
                              onClick={() => handleDeleteCharacter(char.id)}
                              variant="destructive"
                              size="sm"
                              className="absolute top-2 right-2 h-8 w-8 p-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <h4 className="font-bold text-lg mb-2 pr-8">{char.name}</h4>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p><strong>Age:</strong> {char.age || 'N/A'}</p>
                              <p><strong>Gender:</strong> {char.gender || 'N/A'}</p>
                              <p><strong>Hair:</strong> {char.hair || 'N/A'}</p>
                              <p><strong>Eyes:</strong> {char.eyes || 'N/A'}</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Create New Character */}
              {characters.length < 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">Create New Character</CardTitle>
                    <CardDescription>Fill in character details (name auto-generated if left empty)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Character Name (Optional)</Label>
                        <Input
                          value={characterForm.name}
                          onChange={(e) => setCharacterForm({...characterForm, name: e.target.value})}
                          placeholder="Auto-generated if empty"
                        />
                      </div>
                      <div>
                        <Label>Age</Label>
                        <Input
                          value={characterForm.age}
                          onChange={(e) => setCharacterForm({...characterForm, age: e.target.value})}
                          placeholder="e.g., 25 years old"
                        />
                      </div>
                      <div>
                        <Label>Gender</Label>
                        <Input
                          value={characterForm.gender}
                          onChange={(e) => setCharacterForm({...characterForm, gender: e.target.value})}
                          placeholder="e.g., male, female"
                        />
                      </div>
                      <div>
                        <Label>Hair Description</Label>
                        <Input
                          value={characterForm.hair}
                          onChange={(e) => setCharacterForm({...characterForm, hair: e.target.value})}
                          placeholder="e.g., long black curly"
                        />
                      </div>
                      <div>
                        <Label>Eye Color</Label>
                        <Input
                          value={characterForm.eyes}
                          onChange={(e) => setCharacterForm({...characterForm, eyes: e.target.value})}
                          placeholder="e.g., brown"
                        />
                      </div>
                      <div>
                        <Label>Facial Features</Label>
                        <Input
                          value={characterForm.face}
                          onChange={(e) => setCharacterForm({...characterForm, face: e.target.value})}
                          placeholder="e.g., strong jawline"
                        />
                      </div>
                      <div>
                        <Label>Clothing Style</Label>
                        <Input
                          value={characterForm.clothing}
                          onChange={(e) => setCharacterForm({...characterForm, clothing: e.target.value})}
                          placeholder="e.g., casual t-shirt"
                        />
                      </div>
                      <div>
                        <Label>Unique Features (Optional)</Label>
                        <Input
                          value={characterForm.uniqueFeatures}
                          onChange={(e) => setCharacterForm({...characterForm, uniqueFeatures: e.target.value})}
                          placeholder="e.g., scar on cheek"
                        />
                      </div>
                    </div>
                    <Button onClick={handleSaveCharacter} className="w-full" size="lg">
                      <Plus className="mr-2 h-4 w-4" />
                      Save Character
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Generate Scene with Character */}
              {characters.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl md:text-2xl">Generate Scene with Character</CardTitle>
                    <CardDescription>Select character and scene details to generate consistent prompt</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Select Character</Label>
                        <Select value={selectedCharacter} onValueChange={setSelectedCharacter}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Choose character" />
                          </SelectTrigger>
                          <SelectContent>
                            {characters.map((char) => (
                              <SelectItem key={char.id} value={char.id}>
                                {char.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Action/Pose</Label>
                        <Select value={selectedAction} onValueChange={setSelectedAction}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Choose action" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {actions.map((action) => (
                              <SelectItem key={action} value={action}>
                                {action}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Expression/Mood</Label>
                        <Select value={selectedExpression} onValueChange={setSelectedExpression}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Choose expression" />
                          </SelectTrigger>
                          <SelectContent>
                            {expressions.map((exp) => (
                              <SelectItem key={exp} value={exp}>
                                {exp}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Background/Setting</Label>
                        <Select value={selectedBackground} onValueChange={setSelectedBackground}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Choose background" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {backgrounds.map((bg) => (
                              <SelectItem key={bg} value={bg}>
                                {bg}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button 
                      onClick={handleGenerateCharacterPrompt} 
                      className="w-full" 
                      size="lg"
                      disabled={!selectedCharacter || !selectedAction || !selectedExpression || !selectedBackground}
                    >
                      Generate Character Prompt
                    </Button>

                    {characterPrompt && (
                      <div className="space-y-4 mt-6">
                        <div className="flex items-center justify-between">
                          <Label>Generated Character Prompt</Label>
                          <Button
                            onClick={() => handleCopyPrompt(characterPrompt)}
                            variant="outline"
                            size="sm"
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Copy
                          </Button>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 rounded-lg border-2 border-dashed border-primary/30 p-4">
                          <Textarea
                            value={characterPrompt}
                            readOnly
                            className="min-h-[150px] text-sm md:text-base border-0 bg-transparent resize-none focus:ring-0"
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 md:mb-12">Why Use Our Generator</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { title: "P.R.O C.A.M.E.R.A Framework", desc: "9-point formula for perfect prompts" },
            { title: "Ready-Made Library", desc: "Hundreds of professional prompts" },
            { title: "Consistent Characters", desc: "Create and maintain character consistency" },
            { title: "Easy to Use", desc: "No technical knowledge needed" },
          ].map((feature, idx) => (
            <div key={idx} className="bg-card rounded-xl border p-4 md:p-6 hover:shadow-lg transition-shadow">
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3 text-primary">{feature.title}</h3>
              <p className="text-sm md:text-base text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-12 md:mt-20">
        <div className="container mx-auto px-4 py-6 md:py-8 text-center text-sm md:text-base text-muted-foreground">
          <p>Â© 2025 AI Image Prompt Generator. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
