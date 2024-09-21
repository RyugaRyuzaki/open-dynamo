import * as flatbuffers from "flatbuffers";
import {StreamedGeometries} from "./streamed-geometries";
import {StreamedGeometry} from "./streamed-geometry";
/**
 *
 */
export class StreamSerializer {
  import(bytes: Uint8Array): Map<
    number,
    {
      position: Float32Array;
      index: Uint32Array;
    }
  > {
    const buffer = new flatbuffers.ByteBuffer(bytes);

    const fbGeoms = StreamedGeometries.getRootAsStreamedGeometries(buffer);

    const geometries: Map<
      number,
      {
        position: Float32Array;
        index: Uint32Array;
      }
    > = new Map();

    const length = fbGeoms.geometriesLength();
    for (let i = 0; i < length; i++) {
      const fbGeom = fbGeoms.geometries(i);
      if (!fbGeom) continue;

      const id = fbGeom.geometryId();

      if (id === null) {
        throw new Error("Error finding ID!");
      }

      const position = fbGeom.positionArray();
      const index = fbGeom.indexArray();

      if (!position || !index) {
        continue;
      }

      geometries.set(id, {position, index});
    }

    return geometries;
  }
  export(
    geometries: Map<
      number,
      {
        position: Float32Array;
        index: Uint32Array;
      }
    >
  ) {
    const builder = new flatbuffers.Builder(1024);
    const createdGeoms: number[] = [];

    const Gs = StreamedGeometries;
    const G = StreamedGeometry;

    for (const [id, {index, position}] of geometries) {
      const indexVector = G.createIndexVector(builder, index);
      const posVector = G.createPositionVector(builder, position);

      G.startStreamedGeometry(builder);
      G.addGeometryId(builder, id);
      G.addIndex(builder, indexVector);
      G.addPosition(builder, posVector);
      const created = G.endStreamedGeometry(builder);
      createdGeoms.push(created);
    }

    const allGeoms = Gs.createGeometriesVector(builder, createdGeoms);

    Gs.startStreamedGeometries(builder);
    Gs.addGeometries(builder, allGeoms);
    const result = Gs.endStreamedGeometries(builder);
    builder.finish(result);

    return builder.asUint8Array();
  }
}
