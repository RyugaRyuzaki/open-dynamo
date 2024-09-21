// __mocks__/three.ts
import {vi} from "vitest";

vi.mock("three", () => ({
  WebGLRenderer: vi.fn().mockImplementation(() => ({
    domElement: document.createElement("canvas"),
    setSize: vi.fn(),
    render: vi.fn(),
  })),
}));
