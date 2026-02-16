import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { PageHeader } from "@/components/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Book,
  Search,
  ArrowRight,
  Clock,
  ChevronRight,
  Star,
} from "lucide-react";
import { articles, categories, searchArticles } from "@/data/knowledgeBaseArticles";

const KnowledgeBase = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const featuredArticles = articles.filter(a => a.featured);
  
  const filteredArticles = searchQuery 
    ? searchArticles(searchQuery)
    : selectedCategory 
      ? articles.filter(a => a.category === selectedCategory)
      : articles;

  const handleArticleClick = (slug: string) => {
    navigate(`/help/articles/${slug}`);
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header */}
          <PageHeader
            title="Knowledge Base"
            subtitle="Tutorials, guides, and everything you need to succeed"
            icon={Book}
          />

          {/* Search */}
          <div className="glass rounded-2xl p-8 mb-8 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                What would you like to learn?
              </h2>
              <p className="text-muted-foreground mb-6">
                Search our library of guides and tutorials
              </p>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedCategory(null);
                  }}
                  className="pl-12 h-14 bg-white/5 border-white/10 rounded-xl text-lg"
                />
              </div>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button
              variant={selectedCategory === null && !searchQuery ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedCategory(null);
                setSearchQuery("");
              }}
              className="rounded-full"
            >
              All Topics
            </Button>
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedCategory(category.id);
                    setSearchQuery("");
                  }}
                  className="rounded-full gap-2"
                >
                  <IconComponent className="h-4 w-4" />
                  {category.label}
                </Button>
              );
            })}
          </div>

          {/* Featured Articles (only when no search/filter) */}
          {!searchQuery && !selectedCategory && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-foreground">Featured Guides</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredArticles.map((article) => {
                  const IconComponent = article.categoryIcon;
                  return (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article.slug)}
                      className="group text-left glass rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 animate-fade-in"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ${article.categoryColor}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-1">
                            {article.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {article.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-end mt-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-sm font-medium">Read guide</span>
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Articles */}
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {searchQuery 
                ? `Search Results (${filteredArticles.length})`
                : selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.label
                  : "All Articles"
              }
            </h2>

            {filteredArticles.length > 0 ? (
              <div className="space-y-3">
                {filteredArticles.map((article) => {
                  const IconComponent = article.categoryIcon;
                  const category = categories.find(c => c.id === article.category);
                  
                  return (
                    <button
                      key={article.id}
                      onClick={() => handleArticleClick(article.slug)}
                      className="group w-full text-left glass rounded-xl p-4 hover:bg-white/10 transition-all duration-200 animate-fade-in flex items-center gap-4"
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${article.categoryColor}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {article.title}
                          </h3>
                          {article.featured && (
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {article.description}
                        </p>
                      </div>
                      <div className="shrink-0 flex items-center gap-3 text-muted-foreground">
                        <span className="text-xs hidden sm:block">{article.readTime}</span>
                        <ChevronRight className="h-5 w-5 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="glass rounded-2xl p-12 text-center animate-fade-in">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No articles found</h3>
                <p className="text-muted-foreground mb-4">
                  Try a different search term or browse by category
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory(null);
                  }}
                >
                  View all articles
                </Button>
              </div>
            )}
          </div>

          {/* Help Link */}
          <div className="mt-10 text-center">
            <p className="text-muted-foreground mb-2">
              Can't find what you're looking for?
            </p>
            <Link 
              to="/help" 
              className="text-primary hover:underline font-medium inline-flex items-center gap-1"
            >
              Contact our support team
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default KnowledgeBase;