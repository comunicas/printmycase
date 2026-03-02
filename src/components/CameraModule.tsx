import type { PhoneModel } from "@/lib/phoneModels";

interface CameraModuleProps {
  model: PhoneModel;
  frameWidth: number;
}

const CameraModule = ({ model, frameWidth }: CameraModuleProps) => {
  const { cameraModule, lenses, flash, hasLidar, lidar } = model;

  // Camera module dimensions in px
  const moduleW = (cameraModule.width / 100) * frameWidth;
  const moduleH = cameraModule.height > 0 ? (cameraModule.height / 100) * frameWidth * model.aspectRatio : moduleW;

  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        top: `${cameraModule.top}%`,
        left: `${cameraModule.left}%`,
        width: moduleW,
        height: moduleH,
        borderRadius: cameraModule.borderRadius,
        background: "rgba(30, 30, 30, 0.85)",
        backdropFilter: "blur(2px)",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Lenses */}
      {lenses.map((lens, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            top: `${lens.top}%`,
            left: `${lens.left}%`,
            width: `${lens.size}%`,
            height: `${lens.size}%`,
            background: "radial-gradient(circle, #0a0a15 30%, #1a1a2e 50%, #2d2d44 70%, #3d3d55 90%)",
            boxShadow: "0 0 0 2px #555, 0 0 0 3px #333, inset 0 1px 3px rgba(0,0,0,0.8)",
          }}
        >
          {/* Inner lens reflection */}
          <div
            className="absolute rounded-full"
            style={{
              top: "20%",
              left: "20%",
              width: "30%",
              height: "30%",
              background: "radial-gradient(circle, rgba(100,120,255,0.15) 0%, transparent 70%)",
            }}
          />
        </div>
      ))}

      {/* Flash */}
      <div
        className="absolute rounded-full"
        style={{
          top: `${flash.top}%`,
          left: `${flash.left}%`,
          width: `${flash.size}%`,
          height: `${flash.size}%`,
          background: "radial-gradient(circle, #f5e6b8 30%, #d4a843 70%)",
          boxShadow: "0 0 2px 1px rgba(245,230,184,0.3)",
        }}
      />

      {/* LiDAR */}
      {hasLidar && lidar && (
        <div
          className="absolute rounded-full"
          style={{
            top: `${lidar.top}%`,
            left: `${lidar.left}%`,
            width: `${lidar.size}%`,
            height: `${lidar.size}%`,
            background: "#1a1a1a",
            boxShadow: "0 0 0 1px #444",
          }}
        />
      )}
    </div>
  );
};

export default CameraModule;
