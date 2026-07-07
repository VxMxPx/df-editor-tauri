import { createSubscriber } from "svelte/reactivity"
import { log } from "./"

export interface BusEvents {}

type callback = (value: unknown) => void
type listener = { callback: callback; once: boolean }
type event_name = keyof BusEvents & string
type event_value<K extends event_name> = BusEvents[K] extends void
  ? number
  : BusEvents[K]

const state: {
  listeners: Map<string, Set<listener>>
  values: Map<string, unknown>
} = import.meta.hot?.data.state ?? {
  listeners: new Map<string, Set<listener>>(),
  values: new Map<string, unknown>(),
}
if (import.meta.hot) import.meta.hot.data.state = state

const { listeners, values } = state

function signal<K extends event_name>(
  event: K,
  ...args: BusEvents[K] extends void ? [] : [value: BusEvents[K]]
) {
  const value = args.length ? args[0] : Date.now()
  values.set(event, value)
  log.inf("app", "bus", `(${event}::${value})`)
  for (const listener of [...(listeners.get(event) ?? [])]) {
    if (listener.once) listeners.get(event)?.delete(listener)
    listener.callback(value)
  }
}

function on<K extends event_name>(
  event: K,
  callback: (value: event_value<K>) => void,
  options: { once?: boolean } = {},
) {
  const listener = { callback: callback as callback, once: !!options.once }
  const event_listeners = listeners.get(event) ?? new Set()
  event_listeners.add(listener)
  listeners.set(event, event_listeners)
  return () => event_listeners.delete(listener)
}

function bind<K extends event_name>(event: K) {
  const subscribe = createSubscriber((update) => on(event, update))

  return {
    get current() {
      subscribe()
      return values.get(event) as event_value<K> | undefined
    },
  }
}

export { signal, on, bind }
