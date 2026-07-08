export function focusFirstErrorField(fieldOrder: string[]) {
  for (const fieldName of fieldOrder) {
    const element = document.querySelector<HTMLElement>(`[name="${fieldName}"]`)

    if (element) {
      element.focus()
      break
    }
  }
}
