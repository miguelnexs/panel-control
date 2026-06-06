import React, { createContext, useContext, useState, useEffect } from 'react';

interface ContentContextType {
  content: Record<string, string>;
  editMode: boolean;
  updateContent: (key: string, value: string) => void;
}

const ContentContext = createContext<ContentContextType>({
  content: {},
  editMode: false,
  updateContent: () => {},
});

export const useContent = () => useContext(ContentContext);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    // Fetch initial settings
    const fetchSettings = async () => {
        try {
            const response = await fetch('/api/v1/webconfig/settings/'); 
            if (response.ok) {
                const data = await response.json();
                if (data.page_content) {
                    setContent(data.page_content);
                }
            }
        } catch (error) {
            console.error("Error fetching page content:", error);
        }
    };
    
    fetchSettings();

    // Listen for messages from SiteEditor
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'ENABLE_EDIT_MODE') {
        setEditMode(true);
      } else if (event.data?.type === 'DISABLE_EDIT_MODE') {
        setEditMode(false);
      } else if (event.data?.type === 'SET_EDIT_MODE') {
        setEditMode(!!event.data.payload);
      } else if (event.data?.type === 'INITIAL_CONTENT') {
        setContent(event.data.payload || {});
      } else if (event.data?.type === 'UPDATE_CONTENT') {
        setContent(prev => ({ ...prev, ...event.data.payload }));
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const updateContent = (key: string, value: string) => {
    setContent(prev => {
      const newContent = { ...prev, [key]: value };
      window.parent.postMessage({ type: 'CONTENT_CHANGED', payload: { [key]: value } }, '*');
      return newContent;
    });
  };

  return (
    <ContentContext.Provider value={{ content, editMode, updateContent }}>
      {children}
    </ContentContext.Provider>
  );
};
