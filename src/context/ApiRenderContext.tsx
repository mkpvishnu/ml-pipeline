import React, { createContext, useContext, useState } from "react";

// Define the context type
interface ApiRenderContextType {
  shouldRerender: boolean;
  setShouldRerender: (value: boolean) => void;
}

// Create the context with a default value
const ApiRenderContext = createContext<ApiRenderContextType | undefined>(undefined);

// Provider Component
export const ApiRenderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shouldRerender, setShouldRerender] = useState(false);

  return (
    <ApiRenderContext.Provider value={{ shouldRerender, setShouldRerender }}>
      {children}
    </ApiRenderContext.Provider>
  );
};

// Custom Hook to use the context
export const useApiRender = (): ApiRenderContextType => {
  const context = useContext(ApiRenderContext);
  if (!context) {
    throw new Error("useApiRender must be used within an ApiRenderProvider");
  }
  return context;
};