import * as React from 'react';
import { onSnapshot, type DocumentData, type Query } from 'firebase/firestore';

/** Live query results; `query` must be memoised by the caller (null = no query). */
export function useSnapshot<T>(query: Query<DocumentData> | null): { data: (T & { id: string })[]; loading: boolean } {
  const [state, setState] = React.useState<{ data: (T & { id: string })[]; loading: boolean }>({ data: [], loading: !!query });

  React.useEffect(() => {
    if (!query) {
      setState({ data: [], loading: false });
      return;
    }
    setState((s) => ({ ...s, loading: true }));
    return onSnapshot(
      query,
      (snap) => setState({ data: snap.docs.map((d) => ({ ...(d.data() as T), id: d.id })), loading: false }),
      () => setState({ data: [], loading: false }),
    );
  }, [query]);

  return state;
}
