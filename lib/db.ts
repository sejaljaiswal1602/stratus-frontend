import { Pool } from "pg";

let pool: Pool | null = null;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      ssl: { rejectUnauthorized: false },
      max: 3,
    });
  }
  return pool;
}

export async function sql(strings: TemplateStringsArray, ...values: any[]) {
  // Tagged template literal for safe parameterized queries
  let text = "";
  const params: any[] = [];
  strings.forEach((s, i) => {
    text += s;
    if (i < values.length) {
      params.push(values[i]);
      text += `$${params.length}`;
    }
  });
  const client = getPool();
  const res = await client.query(text, params);
  return { rows: res.rows };
}

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS investors (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      mobile TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      reference_no TEXT UNIQUE NOT NULL,
      investor_id TEXT NOT NULL REFERENCES investors(id),
      status TEXT DEFAULT 'DRAFT',
      step_index INT DEFAULT 0,
      investor_type TEXT, full_name TEXT, pan TEXT, dob DATE,
      email TEXT, addr1 TEXT, addr2 TEXT, city TEXT, pincode TEXT,
      occupation TEXT, income TEXT,
      acct_name TEXT, acct_no_enc TEXT,
      ifsc TEXT, acct_type TEXT, fatca BOOLEAN DEFAULT FALSE, pep BOOLEAN DEFAULT FALSE,
      submitted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
      application_id TEXT NOT NULL REFERENCES applications(id),
      doc_key TEXT NOT NULL,
      file_name TEXT NOT NULL,
      status TEXT DEFAULT 'UPLOADED',
      uploaded_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(application_id, doc_key)
    )
  `;
}
