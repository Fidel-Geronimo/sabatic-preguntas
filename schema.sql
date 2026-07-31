-- ============================================================
-- Ejecutar en: Supabase Dashboard > SQL Editor
-- ============================================================

-- Tabla de salas de preguntas
CREATE TABLE IF NOT EXISTS rooms (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          text        NOT NULL,
  code          text        UNIQUE NOT NULL,
  message_count integer     NOT NULL DEFAULT 0,
  is_active     boolean     NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- Tabla de preguntas/comentarios anónimos
CREATE TABLE IF NOT EXISTS messages (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id    uuid        NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  content    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Función: incrementar contador al insertar mensaje
CREATE OR REPLACE FUNCTION increment_room_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE rooms SET message_count = message_count + 1 WHERE id = NEW.room_id;
  RETURN NEW;
END;
$$;

-- Función: decrementar contador al eliminar mensaje
CREATE OR REPLACE FUNCTION decrement_room_count()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE rooms SET message_count = GREATEST(message_count - 1, 0) WHERE id = OLD.room_id;
  RETURN OLD;
END;
$$;

-- Trigger: al insertar
DROP TRIGGER IF EXISTS on_message_insert ON messages;
CREATE TRIGGER on_message_insert
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION increment_room_count();

-- Trigger: al eliminar
DROP TRIGGER IF EXISTS on_message_delete ON messages;
CREATE TRIGGER on_message_delete
  AFTER DELETE ON messages
  FOR EACH ROW EXECUTE FUNCTION decrement_room_count();

-- Row Level Security (todas las operaciones van por el backend con service_role, que bypassea RLS)
ALTER TABLE rooms    ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
