import { NextResponse } from "next/server";
import { readDeals } from "@/lib/store";
import path from "path";

export async function GET() {
  const all = await readDeals();
  const dataFile = path.join(process.cwd(), "data", "deals.json");
  const mockFile = path.join(process.cwd(), "lib", "mockData.ts");

  const dataFileExists = require("fs").existsSync(dataFile);
  const mockFileExists = require("fs").existsSync(mockFile);

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    dataSource: dataFileExists ? "live_data" : "mock_data",
    totalDeals: all.length,
    dataFile: {
      path: dataFile,
      exists: dataFileExists,
      size: dataFileExists ? require("fs").statSync(dataFile).size : 0,
      modified: dataFileExists ? require("fs").statSync(dataFile).mtime : null
    },
    mockData: {
      path: mockFile,
      exists: mockFileExists
    },
    sampleDeals: all.slice(0, 3).map(d => ({
      title: d.title,
      provider: d.provider,
      category: d.category,
      price: d.price,
      url: d.url?.substring(0, 50) + "..."
    }))
  });
}
