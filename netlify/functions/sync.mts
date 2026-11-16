import type { Context, Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, _context: Context) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  try {
    const store = getStore("cloud-sync");

    if (req.method === "GET") {
      const url = new URL(req.url);
      const key = url.searchParams.get("key");

      if (!key || key.trim().length < 3) {
        return new Response(
          JSON.stringify({ error: "Mã đồng bộ không hợp lệ (tối thiểu 3 ký tự)", success: false }),
          { status: 400, headers }
        );
      }

      const normalizedKey = key.trim().toLowerCase();
      const entry = await store.get(normalizedKey, { type: "json" });

      if (entry === null) {
        return new Response(
          JSON.stringify({ error: "Chưa có dữ liệu nào trên đám mây với mã này", found: false, success: false }),
          { status: 404, headers }
        );
      }

      return new Response(
        JSON.stringify({ success: true, data: entry, found: true }),
        { status: 200, headers }
      );
    }

    if (req.method === "POST") {
      const body = await req.json();
      const { key, payload } = body;

      if (!key || key.trim().length < 3) {
        return new Response(
          JSON.stringify({ error: "Mã đồng bộ không hợp lệ (tối thiểu 3 ký tự)", success: false }),
          { status: 400, headers }
        );
      }

      if (!payload || typeof payload !== "object") {
        return new Response(
          JSON.stringify({ error: "Dữ liệu tải lên không hợp lệ", success: false }),
          { status: 400, headers }
        );
      }

      const normalizedKey = key.trim().toLowerCase();
      const toSave = {
        ...payload,
        updatedAt: new Date().toISOString(),
      };

      await store.setJSON(normalizedKey, toSave);

      return new Response(
        JSON.stringify({
          success: true,
          message: "Đã lưu dữ liệu lên đám mây thành công",
          updatedAt: toSave.updatedAt,
        }),
        { status: 200, headers }
      );
    }

    return new Response(JSON.stringify({ error: "Method not allowed", success: false }), {
      status: 405,
      headers,
    });
  } catch (error: any) {
    console.error("Cloud sync function error:", error);
    return new Response(
      JSON.stringify({ error: error?.message || "Lỗi xử lý đồng bộ đám mây", success: false }),
      { status: 500, headers }
    );
  }
};

export const config: Config = {
  path: ["/api/sync", "/.netlify/functions/sync"],
};
