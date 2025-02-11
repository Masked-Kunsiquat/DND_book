import { Component, ReactNode } from "react";
import { ErrorMessage } from "./ErrorMessage";

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

  componentDidCatch(error: Error, info: any) {
    console.error("🚨 Error in component:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage message={this.state.errorMessage || "Something went wrong."} />;
    }
    return this.props.children;
  }
}
