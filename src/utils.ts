import type React from "react";
import { LayerType, Side, type Camera, type Color, type Layer, type PathLayer, type Point, type XYWH } from "./types";

export function colorToCSS(color: Color) {
    return `#${color.r.toString(16).padStart(2, "0")}${color.g.toString(16).padStart(2, "0")}${color.b.toString(16).padStart(2, "0")}`;
}

export function hexToRGB(hex: string): Color{
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);

  return {r, g, b};
}

export const pointerEventToCanvasPoint = (
    e: React.PointerEvent, camera: Camera
) : Point => {
  return {
    x: Math.round(e.clientX) - camera.x,
    y: Math.round(e.clientY) - camera.y,
 };
};

export function pencilPointsToPathLayer(
  points: number[][],
  color: Color
) : PathLayer {
  let left = Number.POSITIVE_INFINITY;
  let top = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;

  for (const point of points) {
    const [x, y] = point;
    if(x === undefined || y === undefined) continue;

    if(left > x) {
      left = x;
    } 
    if(top > y) {
      top = y;
    }
    if(right < x) {
      right = x;
    }
    if(bottom < y) {
      bottom = y;
    }
  }

  return {
    type: LayerType.Path,
    x: left,
    y: top,
    height: bottom - top,
    width: right - left,
    fill: color,
    stroke: color,
    opacity: 100,
    points: points
     .filter(
      (point): point is [number, number, number] => 
        point[0] !== undefined &&
        point[1] !== undefined &&
        point[2] !== undefined,
      )
     .map(([x, y, pressure]) => [x - left, y - top, pressure]),
  };
}

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return ""

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const nextPoint = arr[(i + 1) % arr.length]

      if(!nextPoint) return acc;
      const [x1, y1] = nextPoint;
      acc.push(x0!, y0!, (x0! + x1!) / 2, (y0! + y1!) / 2)
      return acc
    },
    ["M", ...stroke[0] ?? [], "Q"]
  )

  d.push("Z")
  return d.join(" ")
}

export function resizeBounds(bounds: XYWH, corner: Side, point: Point) : XYWH {
  const result = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
  }
  
  if(corner === Side.Left || (corner & Side.Left) !== 0) {
    result.x = Math.min(point.x , bounds.x + bounds.width);
    result.width = Math.abs(bounds.x + bounds.width - point.x);
  }

  if(corner === Side.Right || (corner & Side.Right) !== 0) {
    result.x = Math.min(point.x , bounds.x);
    result.width = Math.abs(point.x - bounds.x);
  }

  if(corner === Side.Top || (corner & Side.Top) !== 0) {
    result.y = Math.min(point.y , bounds.y + bounds.height);
    result.height = Math.abs(bounds.y + bounds.height - point.y);
  }

  if(corner === Side.Bottom || (corner & Side.Bottom) !== 0) {
    result.y = Math.min(point.y , bounds.y);
    result.width = Math.abs(point.y - bounds.y);
  }

  return result;
}

export function findIntersectingLayersWithRectangle(
  layerIds: readonly string[], layers: ReadonlyMap<string, Layer>, a: Point, b: Point,
) {
 const rect = {
  x: Math.min(a.x, b.x),
  y: Math.min(a.y, b.y),
  width: Math.abs(a.x - b.x),
  height: Math.abs(a.y - b.y),
 }
 const ids = [];
 for(const layerId of layerIds){
  const layer = layers.get(layerId);
  if(layer == null) continue;

  const {x, y, width, height} = layer;
  if(rect.x + rect.width > x && rect.x < rect.width 
    && rect.y + rect.height > y && rect.y < y + height) {
    ids.push(layerId);
  }
 }

 return ids;
}

const COLORS = ["#F67280", "#355C7D", "#C06C84", "#6C5B7B", "#F8B195", "#2A363B"]

export function connectionIdToColor(connectionId: number): string{
  return COLORS[connectionId % COLORS.length]!;
}

export function getContrastingColor(col: string): string {
  if (typeof window === "undefined") {
    return "#000000"; // Default to black if window is undefined
  }
  const useBlack = getColor(hexToRgb(standardizeColor(col)));
  return useBlack ? "#000000" : "#ffffff";
}

type RGB = {
  r: number;
  g: number;
  b: number;
} | null;

function getColor(rgb: RGB): boolean {
  if (!rgb) {
    return false;
  }

  const { r, g, b } = rgb;
  if (r && g && b) {
    const isLight = 1 - (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return isLight < 0.5;
  }
  return false;
}

function standardizeColor(str: string): string {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) {
    return "";
  }

  ctx.fillStyle = str;
  return ctx.fillStyle;
}

function hexToRgb(hex: string): RGB {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function ( r, g, b) {
    return r + r + g + g + b + b;
  });

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1]!, 16),
        g: parseInt(result[2]!, 16),
        b: parseInt(result[3]!, 16),
      }
    : null;
}