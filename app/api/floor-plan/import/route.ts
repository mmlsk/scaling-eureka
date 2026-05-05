import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface ImportRequestBody {
  version: string;
  exported_at: string;
  rooms: Array<Record<string, unknown>>;
  pins: Array<Record<string, unknown>>;
  checklist_items: Array<Record<string, unknown>>;
}

export async function POST(request: NextRequest) {
  let body: ImportRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  // Validate structure
  if (!body || typeof body !== 'object') {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 },
    );
  }

  if (!body.rooms || !Array.isArray(body.rooms)) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid rooms array' },
      { status: 400 },
    );
  }

  if (!body.pins || !Array.isArray(body.pins)) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid pins array' },
      { status: 400 },
    );
  }

  if (!body.checklist_items || !Array.isArray(body.checklist_items)) {
    return NextResponse.json(
      { success: false, error: 'Missing or invalid checklist_items array' },
      { status: 400 },
    );
  }

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

    // Create ID mapping: old ID -> new ID
    const roomIdMap = new Map<string, string>();
    const pinIdMap = new Map<string, string>();

    let roomsImported = 0;
    let pinsImported = 0;
    let checklistItemsImported = 0;

    // Step 1: Import rooms with new IDs
    if (body.rooms.length > 0) {
      const roomsToInsert = body.rooms.map((room) => {
        const newId = crypto.randomUUID();
        roomIdMap.set(String(room.id), newId);

        // Create new room object with new ID and user_id
        const { id: _id, user_id: _user_id, created_at: _created_at, updated_at: _updated_at, deleted_at: _deleted_at, ...roomData } =
          room;
        return {
          id: newId,
          user_id: user.id,
          ...roomData,
        };
      });

      const { error: roomsError } = await supabase
        .from('rooms')
        .insert(roomsToInsert);

      if (roomsError) {
        return NextResponse.json(
          { success: false, error: `Failed to import rooms: ${roomsError.message}` },
          { status: 500 },
        );
      }

      roomsImported = roomsToInsert.length;
    }

    // Step 2: Import pins with new IDs, mapping room_id to new room IDs
    if (body.pins.length > 0) {
      const pinsToInsert = body.pins.map((pin) => {
        const newId = crypto.randomUUID();
        pinIdMap.set(String(pin.id), newId);

        // Get the new room_id
        const oldRoomId = String(pin.room_id);
        const newRoomId = roomIdMap.get(oldRoomId);

        if (!newRoomId) {
          throw new Error(`Room not found for pin: ${pin.id}`);
        }

        // Create new pin object with new ID and user_id
        const {
          id: _id,
          user_id: _user_id,
          room_id: _room_id,
          created_at: _created_at,
          updated_at: _updated_at,
          deleted_at: _deleted_at,
          ...pinData
        } = pin;
        return {
          id: newId,
          user_id: user.id,
          room_id: newRoomId,
          ...pinData,
        };
      });

      const { error: pinsError } = await supabase
        .from('pins')
        .insert(pinsToInsert);

      if (pinsError) {
        return NextResponse.json(
          { success: false, error: `Failed to import pins: ${pinsError.message}` },
          { status: 500 },
        );
      }

      pinsImported = pinsToInsert.length;
    }

    // Step 3: Import checklist items with new IDs, mapping pin_id to new pin IDs
    if (body.checklist_items.length > 0) {
      const checklistToInsert = body.checklist_items.map((item) => {
        const newId = crypto.randomUUID();

        // Get the new pin_id
        const oldPinId = String(item.pin_id);
        const newPinId = pinIdMap.get(oldPinId);

        if (!newPinId) {
          throw new Error(`Pin not found for checklist item: ${item.id}`);
        }

        // Create new checklist item with new ID and user_id
        const {
          id: _id,
          user_id: _user_id,
          pin_id: _pin_id,
          created_at: _created_at,
          updated_at: _updated_at,
          deleted_at: _deleted_at,
          ...itemData
        } = item;
        return {
          id: newId,
          user_id: user.id,
          pin_id: newPinId,
          ...itemData,
        };
      });

      const { error: checklistError } = await supabase
        .from('checklist_items')
        .insert(checklistToInsert);

      if (checklistError) {
        return NextResponse.json(
          {
            success: false,
            error: `Failed to import checklist items: ${checklistError.message}`,
          },
          { status: 500 },
        );
      }

      checklistItemsImported = checklistToInsert.length;
    }

    return NextResponse.json({
      success: true,
      imported: {
        rooms: roomsImported,
        pins: pinsImported,
        checklist_items: checklistItemsImported,
      },
    });
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
