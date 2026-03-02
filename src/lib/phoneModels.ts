export interface PhoneLens {
  top: number;   // % within camera module
  left: number;
  size: number;  // % of module width
}

export interface PhoneModel {
  id: string;
  name: string;
  year: number;
  aspectRatio: number; // height / width from real mm dimensions
  borderRadius: string; // CSS value relative to frame
  cameraModule: {
    top: number;    // % of frame height
    left: number;   // % of frame width
    width: number;  // % of frame width
    height: number; // % of frame height (will be computed from width if square)
    borderRadius: number; // px
  };
  lenses: PhoneLens[];
  flash: { top: number; left: number; size: number };
  hasLidar: boolean;
  lidar?: { top: number; left: number; size: number };
}

export const phoneModels: PhoneModel[] = [
  {
    id: "iphone-11",
    name: "iPhone 11",
    year: 2019,
    aspectRatio: 150.9 / 75.7, // ~1.993
    borderRadius: "2.4rem",
    cameraModule: {
      top: 3,
      left: 3,
      width: 28,
      height: 0, // computed as square based on width
      borderRadius: 14,
    },
    lenses: [
      { top: 18, left: 18, size: 38 },
      { top: 48, left: 48, size: 38 },
    ],
    flash: { top: 18, left: 50, size: 14 },
    hasLidar: false,
  },
  {
    id: "iphone-12",
    name: "iPhone 12",
    year: 2020,
    aspectRatio: 146.7 / 71.5, // ~2.051
    borderRadius: "2.2rem",
    cameraModule: {
      top: 3,
      left: 3,
      width: 28,
      height: 0,
      borderRadius: 14,
    },
    lenses: [
      { top: 18, left: 18, size: 36 },
      { top: 48, left: 48, size: 36 },
    ],
    flash: { top: 18, left: 50, size: 13 },
    hasLidar: false,
  },
  {
    id: "iphone-13",
    name: "iPhone 13",
    year: 2021,
    aspectRatio: 146.7 / 71.5,
    borderRadius: "2.4rem",
    cameraModule: {
      top: 3,
      left: 3,
      width: 28,
      height: 0,
      borderRadius: 14,
    },
    lenses: [
      { top: 15, left: 45, size: 36 },
      { top: 48, left: 15, size: 36 },
    ],
    flash: { top: 48, left: 48, size: 13 },
    hasLidar: false,
  },
  {
    id: "iphone-14",
    name: "iPhone 14",
    year: 2022,
    aspectRatio: 146.7 / 71.5,
    borderRadius: "2.6rem",
    cameraModule: {
      top: 3,
      left: 3,
      width: 28,
      height: 0,
      borderRadius: 14,
    },
    lenses: [
      { top: 15, left: 45, size: 36 },
      { top: 48, left: 15, size: 36 },
    ],
    flash: { top: 48, left: 48, size: 13 },
    hasLidar: false,
  },
  {
    id: "iphone-14-pro",
    name: "iPhone 14 Pro",
    year: 2022,
    aspectRatio: 147.5 / 71.5, // ~2.063
    borderRadius: "2.6rem",
    cameraModule: {
      top: 2.5,
      left: 3,
      width: 33,
      height: 0,
      borderRadius: 16,
    },
    lenses: [
      { top: 10, left: 33, size: 30 },  // top center
      { top: 45, left: 10, size: 30 },  // bottom left
      { top: 45, left: 52, size: 30 },  // bottom right
    ],
    flash: { top: 12, left: 65, size: 10 },
    hasLidar: true,
    lidar: { top: 72, left: 38, size: 10 },
  },
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    year: 2023,
    aspectRatio: 159.9 / 76.7, // ~2.085
    borderRadius: "2.8rem",
    cameraModule: {
      top: 2.5,
      left: 3,
      width: 33,
      height: 0,
      borderRadius: 18,
    },
    lenses: [
      { top: 10, left: 33, size: 30 },
      { top: 45, left: 10, size: 30 },
      { top: 45, left: 52, size: 30 },
    ],
    flash: { top: 12, left: 65, size: 10 },
    hasLidar: true,
    lidar: { top: 72, left: 38, size: 10 },
  },
  {
    id: "iphone-16-pro-max",
    name: "iPhone 16 Pro Max",
    year: 2024,
    aspectRatio: 163.0 / 77.6, // ~2.100
    borderRadius: "2.8rem",
    cameraModule: {
      top: 2.5,
      left: 2.5,
      width: 35,
      height: 0,
      borderRadius: 20,
    },
    lenses: [
      { top: 10, left: 33, size: 30 },
      { top: 44, left: 10, size: 30 },
      { top: 44, left: 52, size: 30 },
    ],
    flash: { top: 12, left: 66, size: 9 },
    hasLidar: true,
    lidar: { top: 72, left: 38, size: 9 },
  },
];

export const getDefaultModel = () =>
  phoneModels.find((m) => m.id === "iphone-15-pro-max")!;
