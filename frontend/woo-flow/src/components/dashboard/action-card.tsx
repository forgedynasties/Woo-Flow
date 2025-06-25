"use client";

export interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  buttonText: string;
  onClick: () => void;
}

export function ActionCard({ title, description, icon, buttonText, onClick }: ActionCardProps) {
  return (
    <div className="bg-muted/30 p-4 rounded-lg border border-border flex flex-col h-full">
      <div className="flex items-start mb-3">
        <div className="bg-primary/10 p-2 rounded-full mr-3">
          <span className="material-icons text-primary">{icon}</span>
        </div>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="mt-auto">
        <button 
          className="w-full mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 text-sm flex items-center justify-center"
          onClick={onClick}
        >
          {buttonText}
          <span className="material-icons text-sm ml-1">arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
