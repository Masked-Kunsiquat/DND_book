import { Component, ReactNode, ErrorInfo } from "react";
import { ErrorMessage } from "./ErrorMessage";

// Optional: Replace with a real error tracking service (e.g., Sentry, LogRocket)
const logErrorToService = (error: Error, info: ErrorInfo) => {
  if (import.meta.env.PROD) {
    // Send error details to an external monitoring service in production
    console.error("📡 Logging error to external service:", error, info);
    // Example: Sentry.captureException(error);
  } else {
    console.error("🚨 Error in component:", error, info);
  }
};

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMessage: error.message || "An unexpected error occurred." };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logErrorToService(error, info); // ✅ Improved logging
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage message={this.state.errorMessage || "Something went wrong."} />;
    }
    return this.props.children;
  }
}
