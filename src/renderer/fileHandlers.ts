// src/fileHandlers.ts
export const handleReadFile = async (): Promise<string> => {
    try {
      const content = await window.electronAPI.readFile();
      return content;
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Failed to read file. Please check the console for more details.');
    }
  };
  
  export const handleSaveFile = async (fileContent: string): Promise<void> => {
    try {
      await window.electronAPI.saveFile(fileContent);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error saving file:', error);
        throw new Error(`Failed to save file: ${error.message}`);
      } else {
        console.error('Unknown error:', error);
        throw new Error(`Failed to save file: ${String(error)}`);
      }
    }
  };


