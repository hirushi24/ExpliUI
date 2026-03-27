interface Props {
  heatmapUrl: string;
  zoom: number;
}

export function HeatmapOverlay({ heatmapUrl, zoom }: Props) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <img
        src={heatmapUrl}
        alt="Difference Heatmap"
        className="w-full h-auto"
        style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
      />
    </div>
  );
}
