import { useParams, Link, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Clock,
  ChevronRight,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  List,
} from "lucide-react";
import { getArticleBySlug, articles, categories, ArticleSection } from "@/data/knowledgeBaseArticles";

const ArticlePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const article = slug ? getArticleBySlug(slug) : undefined;

  if (!article) {
    return (
      <DashboardLayout>
        <PageTransition>
          <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            <div className="glass rounded-2xl p-12 text-center">
              <h1 className="text-2xl font-bold text-foreground mb-4">Article Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The article you're looking for doesn't exist or has been moved.
              </p>
              <Button onClick={() => navigate("/help/knowledge-base")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Knowledge Base
              </Button>
            </div>
          </div>
        </PageTransition>
      </DashboardLayout>
    );
  }

  const IconComponent = article.categoryIcon;
  const category = categories.find(c => c.id === article.category);
  
  // Get related articles from the same category
  const relatedArticles = articles
    .filter(a => a.category === article.category && a.id !== article.id)
    .slice(0, 3);

  const renderSection = (section: ArticleSection, index: number) => {
    switch (section.type) {
      case "heading":
        return (
          <h2 key={index} className="text-xl font-semibold text-foreground mt-8 mb-4">
            {section.content as string}
          </h2>
        );
      
      case "paragraph":
        return (
          <p key={index} className="text-muted-foreground leading-relaxed mb-4">
            {section.content as string}
          </p>
        );
      
      case "list":
        return (
          <ul key={index} className="space-y-2 mb-6">
            {(section.content as string[]).map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-muted-foreground">
                <div className="shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        );
      
      case "steps":
        return (
          <ol key={index} className="space-y-4 mb-6">
            {(section.content as string[]).map((item, i) => (
              <li key={i} className="flex items-start gap-4">
                <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 text-primary font-semibold flex items-center justify-center text-sm">
                  {i + 1}
                </div>
                <p className="text-muted-foreground pt-1">{item}</p>
              </li>
            ))}
          </ol>
        );
      
      case "tip":
        return (
          <div key={index} className="flex gap-4 p-4 rounded-xl bg-cyan/10 border border-cyan/20 mb-6">
            <Lightbulb className="shrink-0 h-5 w-5 text-cyan mt-0.5" />
            <p className="text-foreground/80 text-sm">{section.content as string}</p>
          </div>
        );
      
      case "warning":
        return (
          <div key={index} className="flex gap-4 p-4 rounded-xl bg-orange/10 border border-orange/20 mb-6">
            <AlertTriangle className="shrink-0 h-5 w-5 text-orange mt-0.5" />
            <p className="text-foreground/80 text-sm">{section.content as string}</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <PageTransition>
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <Link to="/help/knowledge-base" className="hover:text-foreground transition-colors">
              Knowledge Base
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link 
              to={`/help/knowledge-base?category=${article.category}`} 
              className="hover:text-foreground transition-colors"
            >
              {category?.label}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Article Header */}
          <div className="glass rounded-2xl p-6 sm:p-8 mb-8 animate-fade-in">
            <div className="flex items-start gap-4 mb-4">
              <div className={`shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ${article.categoryColor}`}>
                <IconComponent className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span className={article.categoryColor}>{category?.label}</span>
                  <span>•</span>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{article.readTime}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {article.title}
                </h1>
              </div>
            </div>
            <p className="text-lg text-muted-foreground">
              {article.description}
            </p>
          </div>

          {/* Article Content */}
          <article className="glass rounded-2xl p-6 sm:p-8 mb-8 animate-fade-in">
            {article.content.map((section, index) => renderSection(section, index))}
          </article>

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <div className="glass rounded-2xl p-6 animate-fade-in">
              <h3 className="font-semibold text-foreground mb-4">Related Articles</h3>
              <div className="space-y-3">
                {relatedArticles.map((related) => {
                  const RelatedIcon = related.categoryIcon;
                  return (
                    <Link
                      key={related.id}
                      to={`/help/articles/${related.slug}`}
                      className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${related.categoryColor}`}>
                        <RelatedIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
                          {related.title}
                        </h4>
                        <p className="text-sm text-muted-foreground truncate">
                          {related.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Back to Knowledge Base */}
          <div className="mt-8 text-center">
            <Button variant="outline" onClick={() => navigate("/help/knowledge-base")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Knowledge Base
            </Button>
          </div>
        </div>
      </PageTransition>
    </DashboardLayout>
  );
};

export default ArticlePage;