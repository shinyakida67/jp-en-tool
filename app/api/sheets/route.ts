import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";

const ID = process.env.GOOGLE_SHEETS_ID!;

function getSheets() {
  let email: string;
  let key: string;

  if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
    const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
    email = creds.client_email;
    key = creds.private_key;
  } else {
    email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
    key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  }

  const auth = new google.auth.JWT({ email, key, scopes: ["https://www.googleapis.com/auth/spreadsheets"] });
  return google.sheets({ version: "v4", auth });
}

async function getValues(range: string): Promise<string[][]> {
  const res = await getSheets().spreadsheets.values.get({ spreadsheetId: ID, range });
  return (res.data.values as string[][]) || [];
}

async function appendRow(range: string, values: string[]): Promise<void> {
  await getSheets().spreadsheets.values.append({
    spreadsheetId: ID,
    range,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

async function deleteRow(sheetName: string, rowIndex: number): Promise<void> {
  const spreadsheet = await getSheets().spreadsheets.get({ spreadsheetId: ID });
  const sheetId = spreadsheet.data.sheets?.find(s => s.properties?.title === sheetName)?.properties?.sheetId ?? 0;
  await getSheets().spreadsheets.batchUpdate({
    spreadsheetId: ID,
    requestBody: {
      requests: [{ deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: rowIndex, endIndex: rowIndex + 1 } } }],
    },
  });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const user = searchParams.get("user");

  try {
    if (action === "users") {
      const rows = await getValues("Users!A2:A");
      return NextResponse.json({ users: rows.map(r => r[0]).filter(Boolean) });
    }

    if (action === "phrases" && user) {
      const rows = await getValues("Custom Phrases!A2:G");
      const phrases = rows
        .filter(r => r[0] === user)
        .map(r => ({ user_name: r[0], jp: r[1], reading: r[2], en: r[3], tone: r[4], category: r[5], id: r[6] }));
      return NextResponse.json({ phrases });
    }

    if (action === "favourites" && user) {
      const rows = await getValues("Favourites!A2:B");
      const favourites = rows.filter(r => r[0] === user).map(r => r[1]).filter(Boolean);
      return NextResponse.json({ favourites });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sheets error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const body = await req.json();

  try {
    if (action === "add-user") {
      const rows = await getValues("Users!A2:A");
      const exists = rows.some(r => r[0] === body.name);
      if (!exists) await appendRow("Users!A:A", [body.name]);
      return NextResponse.json({ success: true });
    }

    if (action === "add-phrase") {
      const { user_name, jp, reading, en, tone, category, id } = body;
      await appendRow("Custom Phrases!A:G", [user_name, jp, reading, en, tone, category, id]);
      return NextResponse.json({ success: true });
    }

    if (action === "add-favourite") {
      await appendRow("Favourites!A:B", [body.user_name, body.jp]);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sheets error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");
  const body = await req.json();

  try {
    if (action === "delete-phrase") {
      const rows = await getValues("Custom Phrases!A2:G");
      const idx = rows.findIndex(r => r[0] === body.user_name && r[6] === body.id);
      if (idx !== -1) await deleteRow("Custom Phrases", idx + 1);
      return NextResponse.json({ success: true });
    }

    if (action === "delete-favourite") {
      const rows = await getValues("Favourites!A2:B");
      const idx = rows.findIndex(r => r[0] === body.user_name && r[1] === body.jp);
      if (idx !== -1) await deleteRow("Favourites", idx + 1);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Sheets error" }, { status: 500 });
  }
}