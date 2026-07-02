import { supabase } from '../supabase';

// Minimal persistence surface shared by every user-owned collection
// (accounts, trades, setups, goals). Writes are full-row upserts: the app
// always holds the complete object after an optimistic update, so no
// per-field patch mapping is needed.
export interface EntityRepo<T extends { id: string }> {
  list(): Promise<T[]>;
  upsert(item: T): Promise<void>;
  upsertMany(items: T[]): Promise<void>;
  remove(id: string): Promise<void>;
}

interface RepoOptions {
  orderBy?: string;
  ascending?: boolean;
}

export function createRepo<T extends { id: string }, Row extends { id: string }>(
  table: string,
  fromRow: (row: Row) => T,
  toRow: (item: T) => Row,
  options: RepoOptions = {}
): EntityRepo<T> {
  const { orderBy = 'created_at', ascending = true } = options;

  return {
    async list() {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .order(orderBy, { ascending })
        .order('id', { ascending: true });
      if (error) throw error;
      return (data as Row[]).map(fromRow);
    },

    async upsert(item) {
      const { error } = await supabase.from(table).upsert(toRow(item));
      if (error) throw error;
    },

    async upsertMany(items) {
      if (items.length === 0) return;
      const { error } = await supabase.from(table).upsert(items.map(toRow));
      if (error) throw error;
    },

    async remove(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
    },
  };
}
