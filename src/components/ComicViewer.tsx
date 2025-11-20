import { useState } from "react";
import { ComicPanel } from "@/types/comic";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

interface ComicViewerProps {
  panels: ComicPanel[];
  panelsPerPage: number;
}

export const ComicViewer = ({ panels, panelsPerPage }: ComicViewerProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = Math.ceil(panels.length / panelsPerPage);

  const currentPanels = panels.slice(
    currentPage * panelsPerPage,
    (currentPage + 1) * panelsPerPage
  );

  const handleExport = () => {
    const dataStr = JSON.stringify(panels, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    const exportFileDefaultName = 'comic-story.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Your Comic Story</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-br from-background to-secondary/10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentPanels.map((panel) => (
            <Card key={panel.panel} className="overflow-hidden border-4 border-primary/20">
              <div className="relative aspect-[3/4] bg-muted">
                {panel.imageUrl ? (
                  <img
                    src={panel.imageUrl}
                    alt={`Panel ${panel.panel}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-muted-foreground">Generating image...</p>
                  </div>
                )}
                <div className="absolute top-2 left-2 bg-background/90 px-2 py-1 rounded-md text-xs font-bold">
                  Panel {panel.panel}
                </div>
              </div>
              <div className="p-3 space-y-2 bg-background">
                <div className="text-xs text-muted-foreground line-clamp-3">
                  {panel.scene_description}
                </div>
                {panel.textBlocks.map((block, idx) => (
                  <div key={idx} className="text-sm p-2 rounded-md bg-muted/50">
                    {block.character && (
                      <span className="font-bold">{block.character}: </span>
                    )}
                    <span className="italic">{block.content}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Page
        </Button>
        <span className="text-sm text-muted-foreground">
          Page {currentPage + 1} of {totalPages}
        </span>
        <Button
          variant="outline"
          onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
          disabled={currentPage === totalPages - 1}
        >
          Next Page
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};