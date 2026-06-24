// Builds a Postgres `tsquery`-compatible string from free-text user input,
// per the contract in docs/REBUILD.md §4:
//   - split on whitespace
//   - strip ! & | ( ) ' " : \ < > *
//   - suffix each surviving token with :* for prefix matching
//   - drop tokens that are <=2 chars after sanitizing
//   - AND (&) the tokens together
// Returns null if nothing usable survives, so callers can skip the
// `.textSearch()` clause entirely rather than sending an empty tsquery.
export function buildTsQuery(raw: string): string | null {
  const tokens = raw
    .trim()
    .split(/\s+/)
    .map((token) => token.replace(/[!&|()'":\\<>*]/g, ""))
    .filter((token) => token.length > 2);

  if (tokens.length === 0) return null;

  return tokens.map((token) => `${token}:*`).join(" & ");
}
