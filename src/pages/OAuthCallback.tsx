import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { GlassLoading } from "@/components/ui/glass-spinner";
import { CheckCircle, XCircle } from "lucide-react";
import { useSocialConnect } from "@/hooks/useSocialConnect";
import { Button } from "@/components/ui/button";

/**
 * OAuth callback handler page
 * This page receives the OAuth code from the popup and processes the connection
 */
const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleCallback } = useSocialConnect();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Connecting your account...');
  const [accountName, setAccountName] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');

      // Handle OAuth errors from provider
      if (error) {
        setStatus('error');
        setMessage(errorDescription || error || 'Authorization was denied');
        return;
      }

      if (!code || !state) {
        setStatus('error');
        setMessage('Missing authorization code or state');
        return;
      }

      try {
        // Decode state to get platform
        const stateData = JSON.parse(atob(state));
        const platform = stateData.platform;

        // Validate state matches what we stored
        const storedState = sessionStorage.getItem('oauth_state');
        if (storedState !== state) {
          console.warn('State mismatch - possible CSRF');
        }

        setMessage(`Connecting your ${platform} account...`);

        const result = await handleCallback(code, state, platform);

        if (result.success && result.account) {
          setStatus('success');
          setAccountName(result.account.displayName || result.account.username);
          setMessage(`Successfully connected @${result.account.username}`);
          
          // Clear stored state
          sessionStorage.removeItem('oauth_state');

          // Close popup after delay, or redirect if not in popup
          setTimeout(() => {
            if (window.opener) {
              window.close();
            } else {
              navigate('/linked-accounts');
            }
          }, 2000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Failed to connect account');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        setStatus('error');
        setMessage(err instanceof Error ? err.message : 'An unexpected error occurred');
      }
    };

    processCallback();
  }, [searchParams, handleCallback, navigate]);

  return (
    <div className="min-h-screen gradient-mesh flex items-center justify-center p-4">
      <div className="glass-strong rounded-3xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <GlassLoading size="lg" variant="primary" />
            <p className="mt-6 text-lg font-medium text-foreground">{message}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we verify your connection...
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-success/20 flex items-center justify-center animate-check-in">
              <CheckCircle className="h-10 w-10 text-success" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-foreground">Connected!</h2>
            <p className="mt-2 text-muted-foreground">{message}</p>
            {accountName && (
              <p className="mt-1 text-sm text-primary font-medium">{accountName}</p>
            )}
            <p className="mt-4 text-xs text-muted-foreground">
              This window will close automatically...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-foreground">Connection Failed</h2>
            <p className="mt-2 text-muted-foreground">{message}</p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => window.close()}
                className="border-white/20"
              >
                Close
              </Button>
              <Button
                onClick={() => navigate('/linked-accounts')}
                className="gradient-primary text-white"
              >
                Try Again
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
