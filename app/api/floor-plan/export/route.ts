import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    // Fetch rooms (where deleted_at is null)
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (roomsError) {
      return NextResponse.json(
        { success: false, error: roomsError.message },
        { status: 500 },
      );
    }

    // Fetch pins for user's rooms (where deleted_at is null)
    const { data: pins, error: pinsError } = await supabase
      .from('pins')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (pinsError) {
      return NextResponse.json(
        { success: false, error: pinsError.message },
        { status: 500 },
      );
    }

    // Fetch checklist items for user's pins (where deleted_at is null)
    const { data: checklist_items, error: checklistError } = await supabase
      .from('checklist_items')
      .select('*')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (checklistError) {
      return NextResponse.json(
        { success: false, error: checklistError.message },
        { status: 500 },
      );
    }

    // Build export payload
    const exportData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      rooms: rooms || [],
      pins: pins || [],
      checklist_items: checklist_items || [],
    };

    return NextResponse.json(exportData);
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
