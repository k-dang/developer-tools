import { describe, expect, it } from "vitest";
import {
  DEFAULT_COMPOSER_CONTROLS,
  calculateComposition,
  getBackgroundPreset,
} from "./screenshot-composer";

const image = { width: 800, height: 600 };

describe("calculateComposition", () => {
  it("returns predictable dimensions for aspect ratio presets", () => {
    expect(
      calculateComposition(image, { ...DEFAULT_COMPOSER_CONTROLS, canvasPreset: "wide" }).canvas,
    ).toMatchObject({ width: 1600, height: 900 });

    expect(
      calculateComposition(image, { ...DEFAULT_COMPOSER_CONTROLS, canvasPreset: "square" }).canvas,
    ).toMatchObject({ width: 1080, height: 1080 });

    expect(
      calculateComposition(image, { ...DEFAULT_COMPOSER_CONTROLS, canvasPreset: "portrait" })
        .canvas,
    ).toMatchObject({ width: 1080, height: 1350 });
  });

  it("sizes auto canvas from image dimensions, padding, and scale", () => {
    const composition = calculateComposition(image, {
      ...DEFAULT_COMPOSER_CONTROLS,
      canvasPreset: "auto",
      padding: 80,
      scale: 1.25,
    });

    expect(composition.canvas.width).toBe(1160);
    expect(composition.canvas.height).toBe(910);
    expect(composition.image.rect).toEqual({ x: 80, y: 80, width: 1000, height: 750 });
  });

  it("reduces the image rectangle as padding increases", () => {
    const loose = calculateComposition(image, { ...DEFAULT_COMPOSER_CONTROLS, padding: 48 });
    const tight = calculateComposition(image, { ...DEFAULT_COMPOSER_CONTROLS, padding: 160 });

    expect(tight.image.rect.width).toBeLessThan(loose.image.rect.width);
    expect(tight.image.rect.height).toBeLessThan(loose.image.rect.height);
  });

  it("scales the fitted image rectangle predictably", () => {
    const normal = calculateComposition(image, { ...DEFAULT_COMPOSER_CONTROLS, scale: 1 });
    const larger = calculateComposition(image, { ...DEFAULT_COMPOSER_CONTROLS, scale: 1.2 });

    expect(larger.image.rect.width).toBeCloseTo(normal.image.rect.width * 1.2);
    expect(larger.image.rect.height).toBeCloseTo(normal.image.rect.height * 1.2);
  });

  it("moves the image horizontally within available space", () => {
    const left = calculateComposition(image, { ...DEFAULT_COMPOSER_CONTROLS, xOffset: -1 });
    const center = calculateComposition(image, { ...DEFAULT_COMPOSER_CONTROLS, xOffset: 0 });
    const right = calculateComposition(image, { ...DEFAULT_COMPOSER_CONTROLS, xOffset: 1 });

    expect(left.image.rect.x).toBeLessThan(center.image.rect.x);
    expect(right.image.rect.x).toBeGreaterThan(center.image.rect.x);
    expect(left.image.rect.y).toBe(center.image.rect.y);
  });

  it("moves the image vertically within available space", () => {
    const top = calculateComposition(
      { width: 1200, height: 500 },
      { ...DEFAULT_COMPOSER_CONTROLS, yOffset: -1 },
    );
    const center = calculateComposition(
      { width: 1200, height: 500 },
      { ...DEFAULT_COMPOSER_CONTROLS, yOffset: 0 },
    );
    const bottom = calculateComposition(
      { width: 1200, height: 500 },
      { ...DEFAULT_COMPOSER_CONTROLS, yOffset: 1 },
    );

    expect(top.image.rect.y).toBeLessThan(center.image.rect.y);
    expect(bottom.image.rect.y).toBeGreaterThan(center.image.rect.y);
    expect(top.image.rect.x).toBe(center.image.rect.x);
  });

  it("keeps geometry finite and valid for reasonable controls", () => {
    const composition = calculateComposition(
      { width: 3840, height: 2160 },
      {
        canvasPreset: "open-graph",
        padding: 120,
        scale: 1.35,
        xOffset: 0.75,
        yOffset: -0.5,
      },
    );

    const values = [
      composition.canvas.width,
      composition.canvas.height,
      composition.image.rect.x,
      composition.image.rect.y,
      composition.image.rect.width,
      composition.image.rect.height,
    ];

    expect(values.every(Number.isFinite)).toBe(true);
    expect(composition.canvas.width).toBeGreaterThan(0);
    expect(composition.canvas.height).toBeGreaterThan(0);
    expect(composition.image.rect.width).toBeGreaterThan(0);
    expect(composition.image.rect.height).toBeGreaterThan(0);
  });
});

describe("getBackgroundPreset", () => {
  it("returns stable rendering data for a known preset", () => {
    expect(getBackgroundPreset("lagoon")).toEqual({
      id: "lagoon",
      name: "Lagoon",
      angle: 140,
      stops: ["#064e3b", "#0f766e", "#67e8f9"],
    });
  });
});
