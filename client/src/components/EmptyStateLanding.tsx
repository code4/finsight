// EmptyStateLanding.tsx
// Modern, comprehensive empty state with enhanced UX/UI and user journey optimization
// Built for financial professionals with institutional-quality design

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowRight, BarChart3, BookOpen, Brain, Calculator, ChevronRight, 
  Keyboard, PieChart, Search, Sparkles, TrendingUp, Zap, 
  LineChart, DollarSign, Target, Shield, Clock, Users
} from "lucide-react";

/* ---------------------------
   Layout constants optimized for better UX
----------------------------*/
const SECTION_Y = "py-16 md:py-20";
const HERO_HEIGHT = "min-h-[85vh] flex flex-col justify-center";
const CONTENT_MAX = "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";

/* ---------------------------
   Types
----------------------------*/
export type CatalogQuestion = { id: string; text: string; tags?: string[] };
export type CatalogCategory = {
  id: string;
  title: string;
  description?: string;
  icon?: string;
  questions: CatalogQuestion[];
};

interface Props {
  isSearchTransitioning: boolean;
  displayedText: string;
  getAnalysisDisplayText: string;
  timeframeLabel: string;
  questionCatalog: CatalogCategory[];
  onOpenSearch: () => void;
  onAsk: (q: string) => void;
  onBrowseCategory?: (categoryId: string) => void;
  onOpenAccountSelector?: () => void;
  onOpenTimeframeSelector?: () => void;
}

/* ---------------------------
   Enhanced animated background with depth
----------------------------*/
function AnimatedBackdrop() {
  const prefersReduced = useReducedMotion();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (prefersReduced) return;
    
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prefersReduced]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base gradient with financial theme */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/5 via-blue-900/10 to-slate-800/5 dark:from-slate-900/20 dark:via-blue-900/30 dark:to-slate-800/20" />
      
      {/* Dynamic floating elements */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: prefersReduced ? 0.3 : 0.6, 
          scale: 1,
          y: prefersReduced ? 0 : scrollY * 0.2
        }}
        transition={{ duration: prefersReduced ? 0 : 2, ease: "easeOut" }}
        className="absolute top-[10vh] right-[5%] w-96 h-96 rounded-full blur-3xl bg-gradient-to-br from-blue-500/20 via-cyan-500/15 to-teal-500/10"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ 
          opacity: prefersReduced ? 0.25 : 0.4, 
          scale: 1,
          y: prefersReduced ? 0 : scrollY * -0.15
        }}
        transition={{ duration: prefersReduced ? 0 : 2.2, delay: 0.5 }}
        className="absolute bottom-[20vh] left-[8%] w-80 h-80 rounded-full blur-3xl bg-gradient-to-tr from-purple-500/15 via-indigo-500/10 to-blue-500/8"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ 
          opacity: prefersReduced ? 0.2 : 0.3, 
          scale: 1,
          y: prefersReduced ? 0 : scrollY * 0.1
        }}
        transition={{ duration: prefersReduced ? 0 : 2.4, delay: 1 }}
        className="absolute top-[40vh] left-[15%] w-64 h-64 rounded-full blur-3xl bg-gradient-to-bl from-emerald-500/12 via-green-500/8 to-teal-500/6"
      />
    </div>
  );
}

/* ---------------------------
   Stats section for credibility
----------------------------*/
function StatsSection() {
  const stats = [
    { icon: Users, label: "Active Users", value: "10K+", description: "Financial professionals" },
    { icon: LineChart, label: "Analyses Created", value: "2.5M+", description: "Portfolio insights generated" },
    { icon: Clock, label: "Time Saved", value: "85%", description: "Faster than traditional tools" },
    { icon: Target, label: "Accuracy Rate", value: "99.2%", description: "Data precision guaranteed" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
    >
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="text-center group"
          >
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 mb-3 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-foreground/80 mb-1">{stat.label}</div>
            <div className="text-xs text-muted-foreground">{stat.description}</div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ---------------------------
   Features overview section
----------------------------*/
function FeaturesOverview() {
  const features = [
    {
      icon: Brain,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your portfolio with institutional-grade precision",
      gradient: "from-blue-500/10 to-cyan-500/10"
    },
    {
      icon: Shield,
      title: "Bank-Grade Security", 
      description: "Your financial data is protected with enterprise-level encryption",
      gradient: "from-green-500/10 to-emerald-500/10"
    },
    {
      icon: Zap,
      title: "Real-Time Insights",
      description: "Get instant analysis and alerts on market changes affecting your holdings",
      gradient: "from-purple-500/10 to-indigo-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.15 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className={`relative p-6 rounded-2xl border border-border/50 bg-gradient-to-br ${feature.gradient} backdrop-blur-sm hover:border-primary/30 transition-all duration-300 group`}
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-background/80 dark:bg-background/40 border border-border/50 flex items-center justify-center group-hover:bg-primary/10 dark:group-hover:bg-primary/20 transition-colors">
                <Icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------------------
   Enhanced question grid with categories
----------------------------*/
function EnhancedQuestionGrid({
  catalog,
  onAsk,
}: {
  catalog: CatalogCategory[];
  onAsk: (q: string) => void;
}) {
  const categoryIcons = {
    'Performance': TrendingUp,
    'Holdings': PieChart,  
    'Risk': Shield,
    'Allocation': Calculator,
    'Analysis': Brain,
    'Research': BookOpen,
  };

  // Group questions by category and take top questions
  const featuredByCategory = useMemo(() => {
    return catalog.slice(0, 3).map(category => ({
      ...category,
      questions: category.questions.slice(0, 3)
    }));
  }, [catalog]);

  return (
    <div className="space-y-12">
      {featuredByCategory.map((category, categoryIndex) => {
        const Icon = categoryIcons[category.title as keyof typeof categoryIcons] || Sparkles;
        
        return (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: categoryIndex * 0.2 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-foreground">{category.title}</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.questions.map((question, questionIndex) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: questionIndex * 0.1 }}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="group cursor-pointer h-full border-border/50 hover:border-primary/40 bg-gradient-to-br from-background/80 to-background/60 backdrop-blur-sm hover:shadow-lg transition-all duration-300"
                    onClick={() => onAsk(question.text)}
                  >
                    <CardContent className="p-5">
                      <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors leading-relaxed mb-3">
                        {question.text}
                      </p>
                      
                      {question.tags?.length && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {question.tags.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs px-2 py-0.5 bg-muted/60">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Click to analyze</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ---------------------------
   Main EmptyStateLanding component
----------------------------*/
export default function EmptyStateLanding({
  isSearchTransitioning,
  displayedText,
  getAnalysisDisplayText,
  timeframeLabel,
  questionCatalog,
  onOpenSearch,
  onAsk,
  onOpenAccountSelector,
  onOpenTimeframeSelector,
}: Props) {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative">
      <AnimatedBackdrop />
      
      {/* HERO SECTION */}
      <section className={`${HERO_HEIGHT} scroll-snap-section`}>
        <div className={CONTENT_MAX}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReduced ? 0 : 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Main headline */}
            <motion.h1 
              className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-crisp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.8, delay: 0.2 }}
            >
              <span className="text-foreground">Portfolio</span>
              <br />
              <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
                Intelligence
              </span>
            </motion.h1>

            <motion.p 
              className="text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-12 text-crisp"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.8, delay: 0.4 }}
            >
              Transform complex financial data into clear, actionable insights. 
              Ask questions in natural language and get institutional-quality analysis.
            </motion.p>

            {/* Enhanced search bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.8, delay: 0.6 }}
              className={`max-w-2xl mx-auto mb-8 transition-all duration-700 ${
                isSearchTransitioning ? "-translate-y-[calc(50vh)] scale-95 opacity-0" : ""
              }`}
            >
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
                <Input
                  readOnly
                  role="button"
                  aria-label="Open search"
                  onClick={onOpenSearch}
                  onFocus={onOpenSearch}
                  className="h-16 pl-16 pr-36 text-lg rounded-2xl border-2 border-border hover:border-primary/50 focus-visible:border-primary bg-background/50 shadow-2xl hover:shadow-3xl focus-visible:shadow-3xl transition-all cursor-pointer text-crisp"
                  placeholder={displayedText}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2">
                  <kbd className="flex items-center gap-1 rounded-lg border bg-muted/80 px-3 py-2 text-xs text-muted-foreground font-medium">
                    <Keyboard className="h-3.5 w-3.5" />
                    Ctrl+K
                  </kbd>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>

              {/* Context badges */}
              <div className="flex items-center justify-center gap-4 mt-4">
                <Badge 
                  variant="secondary" 
                  className="px-4 py-1.5 text-sm cursor-pointer hover:bg-secondary/80 transition-colors"
                  onClick={onOpenAccountSelector}
                >
                  📊 {getAnalysisDisplayText}
                </Badge>
                <Badge 
                  variant="outline" 
                  className="px-4 py-1.5 text-sm cursor-pointer hover:bg-accent/20 transition-colors"
                  onClick={onOpenTimeframeSelector}
                >
                  📅 {timeframeLabel}
                </Badge>
              </div>
            </motion.div>

            {/* Quick action suggestions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.8, delay: 0.8 }}
              className="flex flex-wrap items-center justify-center gap-3 mb-16"
            >
              {[
                { text: "Portfolio overview", icon: PieChart },
                { text: "Performance analysis", icon: TrendingUp },
                { text: "Risk assessment", icon: Shield },
                { text: "Holdings breakdown", icon: BarChart3 },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.text}
                    size="sm"
                    variant="secondary"
                    className="rounded-full hover:scale-105 transition-all group/btn border-border/50 hover:border-primary/30"
                    onClick={() => onAsk(item.text)}
                  >
                    <Icon className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" /> 
                    {item.text}
                  </Button>
                );
              })}
            </motion.div>

            {/* Stats section */}
            <StatsSection />
          </motion.div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className={`${SECTION_Y} scroll-snap-section`}>
        <div className={CONTENT_MAX}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Built for Financial Professionals
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Institutional-grade tools designed to streamline your investment analysis workflow
            </p>
          </motion.div>
          
          <FeaturesOverview />
        </div>
      </section>

      {/* QUESTIONS SECTION */}
      <section className={`${SECTION_Y} scroll-snap-section`}>
        <div className={CONTENT_MAX}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Popular Analysis Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with these commonly asked questions, or ask your own
            </p>
          </motion.div>
          
          <EnhancedQuestionGrid catalog={questionCatalog} onAsk={onAsk} />
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center mt-12"
          >
            <Button 
              size="lg"
              variant="outline" 
              onClick={onOpenSearch}
              className="group bg-gradient-to-r from-background to-background/80 border-primary/30 hover:border-primary/50 hover:shadow-lg transition-all duration-300"
            >
              <Search className="h-5 w-5 mr-3 group-hover:scale-110 transition-transform" />
              Ask Your Own Question
              <ArrowRight className="h-5 w-5 ml-3 group-hover:translate-x-1 transition-transform" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className={`${SECTION_Y} scroll-snap-section border-t border-border/50`}>
        <div className={CONTENT_MAX}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ready to Transform Your 
              <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent block">
                Investment Analysis?
              </span>
            </h2>
            
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Join thousands of financial professionals who rely on FinSight 
              for smarter, faster investment decisions.
            </p>
            
            <div className="flex items-center justify-center gap-6 flex-wrap mb-8">
              <Button size="lg" onClick={onOpenSearch} className="group px-8 py-3">
                <Search className="h-5 w-5 mr-2" />
                Start Your Analysis
                <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onAsk("Show me a comprehensive portfolio analysis")}
                className="group px-8 py-3"
              >
                <Sparkles className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform" />
                View Demo Analysis
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Keyboard className="h-4 w-4" /> Press Ctrl+K anytime
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Bank-grade security
              </span>
              <span>•</span>
              <span className="flex items-center gap-2">
                <Zap className="h-4 w-4" /> Instant results
              </span>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}