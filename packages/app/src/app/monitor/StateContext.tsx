
"use client";

import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { AppState, Ecosystem, RefactoringPlan, NodeData } from './types';
import { PROMETHEA_DATA, REFACTORING_PLAN } from './constants';

type Action =
    | { type: 'SET_ECOSYSTEM'; payload: Ecosystem }
    | { type: 'SET_PLAN'; payload: RefactoringPlan }
    | { type: 'PATCH_NODE'; payload: { id: string; data: Partial<NodeData> } }
    | { type: 'SET_SYNCING'; payload: boolean }
    | { type: 'IMPORT_FULL_STATE'; payload: { ecosystem: Ecosystem; plan: RefactoringPlan } };

const initialState: AppState = {
    ecosystem: PROMETHEA_DATA,
    plan: REFACTORING_PLAN,
    isSyncing: false,
};

const StateContext = createContext<{
    state: AppState;
    dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function stateReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'SET_ECOSYSTEM':
            return { ...state, ecosystem: action.payload, isSyncing: true };
        case 'SET_PLAN':
            return { ...state, plan: action.payload, isSyncing: true };
        case 'PATCH_NODE':
            return {
                ...state,
                ecosystem: {
                    ...state.ecosystem,
                    nodes: state.ecosystem.nodes.map((n) =>
                        n.id === action.payload.id ? { ...n, ...action.payload.data } : n
                    ),
                },
                isSyncing: true,
            };
        case 'SET_SYNCING':
            return { ...state, isSyncing: action.payload };
        case 'IMPORT_FULL_STATE':
            // @ts-ignore
            return { ...state, ecosystem: action.payload.ecosystem, plan: action.payload.plan, isSyncing: true };
        default:
            return state;
    }
}

export const StateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(stateReducer, initialState);

    // Auto-reset sync indicator after 2s
    useEffect(() => {
        if (state.isSyncing) {
            const timer = setTimeout(() => dispatch({ type: 'SET_SYNCING', payload: false }), 2000);
            return () => clearTimeout(timer);
        }
    }, [state.isSyncing]);

    // Attach Bridge to Window
    useEffect(() => {
        (window as any).promethea = {
            version: "2.3.1-bridge",
            getState: () => state,
            setEcosystem: (eco: Ecosystem) => dispatch({ type: 'SET_ECOSYSTEM', payload: eco }),
            setPlan: (plan: RefactoringPlan) => dispatch({ type: 'SET_PLAN', payload: plan }),
            patchNode: (id: string, data: Partial<NodeData>) => dispatch({ type: 'PATCH_NODE', payload: { id, data } }),
            importState: (data: { ecosystem: Ecosystem; plan: RefactoringPlan }) => dispatch({ type: 'IMPORT_FULL_STATE', payload: data }),
            pulse: () => dispatch({ type: 'SET_SYNCING', payload: true })
        };
    }, [state]);

    return (
        <StateContext.Provider value={{ state, dispatch }}>
            {children}
        </StateContext.Provider>
    );
};

export const useAppState = () => {
    const context = useContext(StateContext);
    if (!context) throw new Error('useAppState must be used within StateProvider');
    return context;
};
