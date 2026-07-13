/**
 * Parses a block of pasted text into an array of question objects.
 *
 * Expected format (one blank-line-separated block per question):
 *
 *   Q: What is the capital of France?
 *   A: Berlin
 *   B: Madrid
 *   C: Paris
 *   D: Rome
 *   Answer: C
 *   Marks: 10
 *
 * - Labels are case-insensitive: "Q:", "A:", "B:", "C:", "D:", "Answer:" (or "Correct:"), "Marks:"
 * - "Marks:" is optional and defaults to 10 if omitted.
 * - Blocks are separated by one or more blank lines.
 *
 * Returns { questions: [...], errors: [...] } — errors are human-readable strings
 * describing which block (by number) had a problem, so they can be shown to the admin.
 */
export function parseBulkQuestions(rawText) {
  const questions = []
  const errors = []

  if (!rawText || !rawText.trim()) {
    return { questions, errors: ['Nothing to parse — paste some questions first.'] }
  }

  // Split into blocks on one or more blank lines.
  const blocks = rawText
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0)

  blocks.forEach((block, idx) => {
    const blockNum = idx + 1
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean)

    const data = { questionText: '', optionA: '', optionB: '', optionC: '', optionD: '', correctAnswer: '', marks: 10 }
    let hasQ = false

    for (const line of lines) {
      const match = line.match(/^(Q|A|B|C|D|Answer|Correct|Marks)\s*:\s*(.+)$/i)
      if (!match) continue

      const label = match[1].toUpperCase()
      const value = match[2].trim()

      if (label === 'Q') { data.questionText = value; hasQ = true }
      else if (label === 'A') data.optionA = value
      else if (label === 'B') data.optionB = value
      else if (label === 'C') data.optionC = value
      else if (label === 'D') data.optionD = value
      else if (label === 'ANSWER' || label === 'CORRECT') data.correctAnswer = value.toUpperCase().replace(/[^A-D]/g, '')
      else if (label === 'MARKS') {
        const n = parseInt(value, 10)
        if (!isNaN(n)) data.marks = n
      }
    }

    if (!hasQ) {
      errors.push(`Question ${blockNum}: couldn't find a line starting with "Q:" — skipped.`)
      return
    }
    if (!data.optionA || !data.optionB || !data.optionC || !data.optionD) {
      errors.push(`Question ${blockNum}: missing one or more options (A–D).`)
      return
    }
    if (!['A', 'B', 'C', 'D'].includes(data.correctAnswer)) {
      errors.push(`Question ${blockNum}: "Answer:" must be one of A, B, C, D.`)
      return
    }

    questions.push(data)
  })

  return { questions, errors }
}

export const BULK_FORMAT_EXAMPLE = `Q: What is the capital of France?
A: Berlin
B: Madrid
C: Paris
D: Rome
Answer: C
Marks: 10

Q: Which planet is known as the Red Planet?
A: Venus
B: Mars
C: Jupiter
D: Saturn
Answer: B
Marks: 10`
