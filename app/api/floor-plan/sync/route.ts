import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ALLOWED_TABLES = ['rooms', 'pins', 'checklist_items'] as const;
type TableName = (typeof ALLOWED_TABLES)[number];

type SyncAction = 'create' | 'update' | 'delete';

interface SyncRequestBody {
  table: string;
  action: SyncAction;
  record_id: string;
  data?: object;
}

export async function POST(request: NextRequest) {
  let body: SyncRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const { table, action, record_id, data } = body;

  // Validate table
  if (!ALLOWED_TABLES.includes(table as TableName)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid table '${table}'. Must be one of: ${ALLOWED_TABLES.join(', ')}`,
      },
      { status: 400 },
    );
  }

  // Validate action
  if (!['create', 'update', 'delete'].includes(action)) {
    return NextResponse.json(
      {
        success: false,
        error: `Invalid action '${action}'. Must be: create, update, or delete`,
      },
      { status: 400 },
    );
  }

  // Validate record_id
  if (!record_id || typeof record_id !== 'string') {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid record_id' },
      { status: 400 },
    );
  }

  try {
    const supabase = await createClient();

    let dbResult;
    const typedTable = table as TableName;

    switch (action) {
      case 'create':
        if (!data || typeof data !== 'object') {
          return NextResponse.json(
            { success: false, error: 'Missing data for create action' },
            { status: 400 },
          );
        }
        dbResult = await supabase
          .from(typedTable)
          .insert({ id: record_id, ...data })
          .select()
          .single();
        break;

      case 'update':
        if (!data || typeof data !== 'object') {
          return NextResponse.json(
            { success: false, error: 'Missing data for update action' },
            { status: 400 },
          );
        }
        dbResult = await supabase
          .from(typedTable)
          .update(data)
          .eq('id', record_id)
          .select()
          .single();
        break;

      case 'delete':
        dbResult = await supabase
          .from(typedTable)
          .delete()
          .eq('id', record_id)
          .select()
          .single();
        break;
    }

    if (dbResult?.error) {
      return NextResponse.json(
        { success: false, error: dbResult.error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, data: dbResult?.data ?? null });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export const dynamic = 'force-dynamic';
