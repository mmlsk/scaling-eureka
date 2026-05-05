export type Room = {
  id: string;
  user_id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  image_url: string | null;
  order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type Pin = {
  id: string;
  user_id: string;
  room_id: string;
  title: string;
  x: number;
  y: number;
  status: 'active' | 'done';
  due_date: string | null;
  priority: 'low' | 'medium' | 'high' | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
  items?: ChecklistItem[];
};

export type ChecklistItem = {
  id: string;
  user_id: string;
  pin_id: string;
  text: string;
  completed: boolean;
  order: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PartialRoom = Partial<Omit<Room, 'id' | 'user_id'>> & { id: string };
export type PartialPin = Partial<Omit<Pin, 'id' | 'user_id'>> & { id: string };
