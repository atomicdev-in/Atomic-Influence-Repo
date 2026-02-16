import { AdminDashboardLayout } from "@/components/AdminDashboardLayout";
import { PageHeader } from "@/components/PageHeader";
import { PageTransition } from "@/components/PageTransition";
import { PageErrorBoundary } from "@/components/PageErrorBoundary";
import { useAdminSurveys } from "@/hooks/useAdminData";
import { CardListSkeleton } from "@/components/ui/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { ClipboardList } from "lucide-react";

export default function AdminSurveys() {
  const { data: surveys, isLoading, refetch } = useAdminSurveys();

  if (isLoading) {
    return <AdminDashboardLayout><CardListSkeleton count={4} /></AdminDashboardLayout>;
  }

  return (
    <AdminDashboardLayout title="Surveys" onRefresh={async () => { await refetch(); }}>
      <PageErrorBoundary>
        <PageTransition>
          <div className="space-y-6">
            <PageHeader 
              title="Surveys" 
              subtitle="Survey management and response analytics"
            />

            {!surveys?.length ? (
              <EmptyState
                icon={ClipboardList}
                title="No surveys yet"
                description="Surveys will appear here once created."
              />
            ) : (
              <div className="space-y-4">
                {surveys.map((survey) => (
                  <Card key={survey.id} className="bg-card/50 backdrop-blur-sm border-white/10">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{survey.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">{survey.description || "No description"}</p>
                        </div>
                        <Badge variant={survey.is_active ? "default" : "secondary"}>
                          {survey.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Category:</span>{" "}
                          <span className="font-medium">{survey.category}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>{" "}
                          <span className="font-medium">{new Date(survey.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </PageTransition>
      </PageErrorBoundary>
    </AdminDashboardLayout>
  );
}
