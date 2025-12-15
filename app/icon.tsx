import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export const runtime = "edge";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#162032",
          color: "#ffffff",
          fontSize: 20,
          fontWeight: 700,
        }}
      >
        CS
      </div>
    ),
    {
      ...size,
    }
  );
}
