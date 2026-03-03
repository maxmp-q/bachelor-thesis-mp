interface ValueMap<T> {
  value: T;
  count: number;
}

/** This interface contains the values of different languages. */
interface SciFields<T> {
  isSci?: ValueMap<T>;
  nonSci?: ValueMap<T>;
}
