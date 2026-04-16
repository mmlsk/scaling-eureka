CREATE OR REPLACE FUNCTION public.get_dashboard_data(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'habits', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', h.id, 'name', h.name,
        'entries', (
          SELECT jsonb_agg(jsonb_build_object('date', he.date, 'completed', he.completed))
          FROM public.habit_entries he
          WHERE he.habit_id = h.id AND he.date >= p_date - INTERVAL '14 days'
        )
      ))
      FROM public.habits h
      WHERE h.user_id = p_user_id AND h.archived = false
    ),
    'todos', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', t.id, 'text', t.text, 'done', t.done, 'priority', t.priority, 'created_at', t.created_at
      ) ORDER BY t.priority DESC, t.created_at DESC)
      FROM public.todos t
      WHERE t.user_id = p_user_id AND t.archived = false
      LIMIT 50
    ),
    'nootropics', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', ns.id, 'name', ns.name, 'dose', ns.dose,
        'status', COALESCE(
          (SELECT nl.status FROM public.nootropic_log nl WHERE nl.nootropic_id = ns.id AND nl.date = p_date),
          'pending'
        )
      ) ORDER BY ns."order")
      FROM public.nootropic_stack ns
      WHERE ns.user_id = p_user_id AND ns.active = true
    ),
    'sleep', (
      SELECT jsonb_build_object(
        'sleep_start', sl.sleep_start, 'sleep_stop', sl.sleep_stop,
        'total_minutes', sl.total_minutes, 'quality', sl.quality
      )
      FROM public.sleep_log sl
      WHERE sl.user_id = p_user_id AND sl.date = p_date
    ),
    'mood', (
      SELECT jsonb_build_object('feelings', me.feelings)
      FROM public.mood_entries me
      WHERE me.user_id = p_user_id AND me.date = p_date
    ),
    'timer_sessions', (
      SELECT COALESCE(SUM(ts.work_minutes), 0)
      FROM public.timer_sessions ts
      WHERE ts.user_id = p_user_id AND ts.date = p_date
    ),
    'calendar_events', (
      SELECT jsonb_agg(jsonb_build_object(
        'id', ce.id, 'title', ce.title, 'date', ce.date,
        'time', ce.time, 'description', ce.description
      ))
      FROM public.calendar_events ce
      WHERE ce.user_id = p_user_id AND ce.date >= p_date AND ce.date <= p_date + INTERVAL '30 days'
    ),
    'notes', (
      SELECT n.content FROM public.notes n WHERE n.user_id = p_user_id LIMIT 1
    )
  ) INTO result;

  RETURN COALESCE(result, '{}'::jsonb);
END;
$$;
