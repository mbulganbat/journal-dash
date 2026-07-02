import { useState, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { EntityRepo } from '../../lib/db/repo';

// Optimistic local state backed by a Supabase repo: state updates apply
// immediately, the network write follows, and a failure surfaces as a toast
// (the local change stays — a reload shows the server's truth). A ref mirrors
// the state so handlers read the latest items without updater side effects.
export function useSyncedCollection<T extends { id: string }>(
  repo: EntityRepo<T>,
  entityLabel: string,
  options?: { prepend?: boolean }
) {
  const [items, setItems] = useState<T[]>([]);
  const itemsRef = useRef<T[]>([]);
  const prepend = options?.prepend ?? false;

  const setAll = (next: T[]) => {
    itemsRef.current = next;
    setItems(next);
  };

  const persist = (op: Promise<void>) => {
    op.catch(err => {
      console.error(`[db] ${entityLabel} write failed`, err);
      toast.error(`Could not sync ${entityLabel} to the cloud.`);
    });
  };

  const load = useCallback((data: T[]) => setAll(data), []);

  const add = useCallback(
    (item: T) => {
      setAll(prepend ? [item, ...itemsRef.current] : [...itemsRef.current, item]);
      persist(repo.upsert(item));
    },
    [repo, prepend]
  );

  const update = useCallback(
    (id: string, updates: Partial<T>) => {
      let changed: T | undefined;
      const next = itemsRef.current.map(it => {
        if (it.id !== id) return it;
        changed = { ...it, ...updates };
        return changed;
      });
      setAll(next);
      if (changed) persist(repo.upsert(changed));
    },
    [repo]
  );

  const remove = useCallback(
    (id: string) => {
      setAll(itemsRef.current.filter(it => it.id !== id));
      persist(repo.remove(id));
    },
    [repo]
  );

  // Local-only mutation for mirroring server-side cascades (e.g. deleting an
  // account cascades its trades in the DB; the app state must follow suit).
  const mutateLocal = useCallback((fn: (items: T[]) => T[]) => {
    setAll(fn(itemsRef.current));
  }, []);

  return { items, load, add, update, remove, mutateLocal };
}
