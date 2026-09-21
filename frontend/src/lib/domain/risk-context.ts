export interface TermContext {
  negated: boolean
  reported: boolean
  past: boolean
  selfMarker: boolean
}

const NEGATION = /(不|没|无|别|免|非|难道|何必|舍得|怕)/
const REPORTED = /(他说|她说|对方|别人|新闻|电视|电视剧|小说|电影|案例|文章|朋友|同事|妈妈|爸爸|孩子|如果|假如|要是|万一|会不会|怎样|如何|预防|劝阻|帮助)/
const PAST = /(以前|曾经|当时|那时|去年|前年|上半年|小时候|高中|毕业前)/
const SELF = /(我|自己|俺|咱|现在|此刻|眼下|感觉|真的|每天|已经|越来越)/

const BEFORE = 6
const AFTER = 4

/**
 * 中文没有词形变化，只能靠邻接窗口判断否定/转述/时态。
 * 关键细节：否定只看命中位置**之前**的窗口——`不想活` 这个词本身含 `不`，
 * 若把词内字符算进去，`我不想活了` 会被误判为否定而漏报。
 */
export function analyzeTermContext(message: string, index: number, length: number): TermContext {
  const from = Math.max(0, index - BEFORE)
  const before = message.slice(from, index)
  const after = message.slice(index + length, index + length + AFTER)
  const window = before + after

  return {
    negated: NEGATION.test(before),
    reported: REPORTED.test(message.slice(Math.max(0, index - 12), index)) || REPORTED.test(after),
    past: PAST.test(window),
    selfMarker: SELF.test(message),
  }
}
