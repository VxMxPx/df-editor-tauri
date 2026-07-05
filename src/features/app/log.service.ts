type LogType = "inf" | "war" | "err"
type LogData = { type: LogType; msg: string; time: number }

const log_data: LogData[] = []

function add(type: LogType, msg: string) {
  console[type === "inf" ? "log" : type === "war" ? "warn" : "error"](msg)
  log_data.push({
    type,
    msg,
    time: Date.now(),
  })
}

export const inf = (...msg: unknown[]) => add("inf", msg.join("::"))
export const war = (...msg: unknown[]) => add("war", msg.join("::"))
export const err = (...msg: unknown[]) => add("err", msg.join("::"))
