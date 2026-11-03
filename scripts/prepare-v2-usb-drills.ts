import type { AnyCircuitElement } from "circuit-json"

// Keep the exact imported footprint in imports/supplier. On this board, widen
// its two non-plated locating capsules to JLCPCB's 1.0 mm CNC slot minimum.
// The imported peg centers, tool centerline endpoints, rotation, round locator
// and all four soldered shell stakes are unchanged.
export function prepareV2UsbDrills(records: AnyCircuitElement[]): AnyCircuitElement[] {
  const sources = new Map(records.filter(e => e.type === "source_component").map(e => [e.source_component_id, e.name]))
  const usb = new Set(records.flatMap(e =>
    e.type === "pcb_component" && ["J_PD", "J_DATA"].includes(sources.get(e.source_component_id) ?? "")
      ? [e.pcb_component_id] : []))
  let count = 0
  const result = records.map(e => {
    if (e.type !== "pcb_hole" || !usb.has(e.pcb_component_id ?? "") || !["pill", "rotated_pill"].includes(e.hole_shape)) return e
    if (!("hole_width" in e) || !("hole_height" in e) || Math.abs(e.hole_width - 1.5099792) > 1e-6 || Math.abs(e.hole_height - .7099808) > 1e-6) throw Error("Unexpected supplier USB locating capsule")
    count++
    return { ...e, hole_width: e.hole_width + (1 - e.hole_height), hole_height: 1 }
  })
  if (count !== 2) throw Error("Expected both imported USB locating capsules")
  return result as AnyCircuitElement[]
}
