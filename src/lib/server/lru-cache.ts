/**
 * @file LRUCache.ts
 * @date 11/8/25
 *
 * Last recently used cache with lazy cleanup - expired entries stay in the cache until accessed via get().
 * This means they temporarily count toward capacity.
 *
 *  O(1) operations - Hash map + doubly-linked list
 *
 * Alternative approaches you could discuss:
 *
 *  - Active cleanup: Background process to remove expired entries
 *  - Cleanup on eviction: Check if LRU is expired before evicting
 *  - Hybrid: Clean up on set() if space needed
 *
 */

class Entry<K, T> {
  public prev: Entry<K, T> | null = null
  public next: Entry<K, T> | null = null
  public expiresAt: number
  public isDeleted: boolean = false
  constructor(
    public key: K,
    public value: T,
    ttl: number
  ) {
    this.expiresAt = Date.now() + ttl
  }

  get isExpired(): boolean {
    return this.expiresAt < Date.now()
  }

  public markAsDeleted() {
    this.isDeleted = true
  }
}

class LRUCache<K, T> {
  private readonly cache = new Map<K, Entry<K, T>>()
  private LRU: Entry<K, T> | null = null // first to be evicted
  private MRU: Entry<K, T> | null = null

  public describe() {
    const items: T[] = []
    let current = this.LRU
    while (current) {
      items.push(current.value)
      current = current.next
    }
    console.log(items)
  }

  constructor(public maxCapacity: number) {}

  get isAtMaxCapacity() {
    return this.cache.size >= this.maxCapacity
  }

  private evictIfNeeded() {
    if (!this.isAtMaxCapacity) return
    if (!this.LRU) return
    this.describe()
    const item = this.LRU
    this.LRU = item.next
    if (this.LRU?.prev) {
      this.LRU.prev = null
    }
    console.log('evicting:', item?.key)
    this.cache.delete(item?.key)
  }

  public set(key: K, value: T, ttl: number) {
    let entry = this.cache.get(key)
    // Only evict if adding a NEW key
    if (!entry) {
      this.evictIfNeeded()
      entry = new Entry(key, value, ttl)
    } else {
      entry.value = value
      entry.expiresAt = Date.now() + ttl
    }
    this.cache.set(key, entry)
    this.setMostRecent(entry)
  }

  public get(key: K): T | null {
    if (!this.cache.has(key)) return null
    const entry = this.cache.get(key)!
    // check if entry is expired
    if (entry.isExpired) {
      this.delete(entry.key)
      return null
    }
    this.setMostRecent(entry)
    // output value
    return entry.value
  }

  public setMostRecent(entry: Entry<K, T>) {
    // Already MRU? Done.
    if (this.MRU === entry) return

    // First node ever
    if (!this.LRU) {
      this.LRU = this.MRU = entry
      return
    }

    // Remove from current position
    if (entry.prev) entry.prev.next = entry.next
    if (entry.next) entry.next.prev = entry.prev

    // Update LRU if we're moving it
    if (this.LRU === entry) this.LRU = entry.next

    // Append to end
    entry.prev = this.MRU
    entry.next = null
    if (this.MRU) this.MRU.next = entry
    this.MRU = entry
  }

  public delete(key: K) {
    if (!this.cache.has(key)) return
    const entry = this.cache.get(key)!

    // Remove from list
    if (entry.prev) entry.prev.next = entry.next
    if (entry.next) entry.next.prev = entry.prev

    if (this.LRU === entry) this.LRU = entry.next
    if (this.MRU === entry) this.MRU = entry.prev

    this.cache.delete(key)
  }
}
