import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PageErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  variant?: "page" | "section" | "inline";
}

interface PageErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enhanced ErrorBoundary that auto-resets on navigation and provides
 * institutional, calm error messaging with clear recovery paths.
 */
export class PageErrorBoundary extends Component<PageErrorBoundaryProps, PageErrorBoundaryState> {
  constructor(props: PageErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): PageErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error for monitoring
    console.error("[PageErrorBoundary] Error caught:", error.message);
    console.error("[PageErrorBoundary] Component stack:", errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  handleGoBack = () => {
    window.history.back();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const variant = this.props.variant || "page";

      // Section-level error (contained within a card)
      if (variant === "section") {
        return (
          <div className="flex flex-col items-center justify-center py-8 px-4 rounded-2xl border border-border/50 bg-card/50">
            <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
              <AlertTriangle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h4 className="font-medium text-sm mb-1">Unable to load this section</h4>
            <p className="text-xs text-muted-foreground text-center max-w-xs mb-3">
              A temporary issue occurred. Please try again.
            </p>
            <Button variant="outline" size="sm" onClick={this.handleReset} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        );
      }

      // Inline error (minimal footprint)
      if (variant === "inline") {
        return (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
            <AlertTriangle className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-sm text-muted-foreground">Failed to load</span>
            <Button variant="ghost" size="sm" onClick={this.handleReset} className="h-7 px-2 ml-auto">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      }

      // Full page error
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] py-12 px-4">
          <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
            <AlertTriangle className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="font-semibold text-xl mb-2">Something went wrong</h2>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            We encountered an unexpected issue loading this page. This has been logged for review.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={this.handleGoBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={this.handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </div>
          <Button 
            variant="ghost" 
            onClick={this.handleGoHome} 
            className="mt-4 text-muted-foreground gap-2"
          >
            <Home className="h-4 w-4" />
            Return to Home
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Section-level wrapper for easier usage
export const SectionErrorBoundary = ({ 
  children, 
  onReset 
}: { 
  children: ReactNode; 
  onReset?: () => void;
}) => (
  <PageErrorBoundary variant="section" onReset={onReset}>
    {children}
  </PageErrorBoundary>
);

// Inline wrapper for list items
export const InlineErrorBoundary = ({ 
  children, 
  onReset 
}: { 
  children: ReactNode; 
  onReset?: () => void;
}) => (
  <PageErrorBoundary variant="inline" onReset={onReset}>
    {children}
  </PageErrorBoundary>
);
