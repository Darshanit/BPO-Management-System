import { Component } from 'react';
import Button from './ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // In a real deployment this would report to a logging service.
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-brutal-orange p-4 text-center">
          <h1 className="font-display font-bold text-4xl mb-4">Something broke 🛠️</h1>
          <p className="font-semibold mb-6">Try reloading the page. If it keeps happening, let us know.</p>
          <Button variant="white" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
