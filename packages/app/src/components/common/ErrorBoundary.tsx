'use client';

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button } from "@promethea/ui";
import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
    moduleName?: string;
}

interface State {
    hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(_: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in " + (this.props.moduleName || "Module") + ":", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <Card className="border-red-500/20 bg-red-500/5 my-4">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-headline">Substrate Failure</CardTitle>
                                <CardDescription>
                                    The {this.props.moduleName || 'component'} encountered a reconciliation error.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <p className="text-sm text-muted-foreground mb-4 italic">
                            A localized crash was intercepted by the Immune System. The rest of the state substrate remains operational.
                        </p>
                        <Button
                            size="sm"
                            variant="outline"
                            className="w-full justify-between"
                            onClick={() => this.setState({ hasError: false })}
                        >
                            Attempt Restoration
                            <RefreshCw className="w-4 h-4 ml-2" />
                        </Button>
                    </CardContent>
                </Card>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
