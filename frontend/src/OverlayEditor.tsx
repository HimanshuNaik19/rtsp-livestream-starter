import React from "react";
import { Rnd } from "react-rnd";

type Element = {
  id: string;
  type: "text" | "image";
  content: string;
  x: number; y: number; width: number; height: number;
  opacity?: number;
  style?: any;
};

type Props = {
  elements: Element[];
  setElements: (els: Element[]) => void;
  editable?: boolean;
};

export default function OverlayEditor({ elements, setElements, editable = true }: Props) {
  const onChange = (id: string, data: Partial<Element>) => {
    setElements(elements.map(e => e.id === id ? { ...e, ...data } : e));
  };

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: editable ? "auto" : "none" }}>
      {elements.map(el => (
        <Rnd
          key={el.id}
          size={{ width: el.width, height: el.height }}
          position={{ x: el.x, y: el.y }}
          onDragStop={(_, d) => onChange(el.id, { x: d.x, y: d.y })}
          onResizeStop={(_, __, ref, ___, pos) =>
            onChange(el.id, { width: ref.offsetWidth, height: ref.offsetHeight, x: pos.x, y: pos.y })
          }
          bounds="parent"
          enableResizing={editable}
          disableDragging={!editable}
          style={{ pointerEvents: "auto" }}
        >
          {el.type === "text" ? (
            <div style={{ width: "100%", height: "100%", opacity: el.opacity ?? 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", background: "rgba(0,0,0,0.15)", ...(el.style || {}) }}>
              {el.content}
            </div>
          ) : (
            <img src={el.content} alt="" style={{ width: "100%", height: "100%", objectFit: "contain", opacity: el.opacity ?? 1 }} />
          )}
        </Rnd>
      ))}
    </div>
  );
}
