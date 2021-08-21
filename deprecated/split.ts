
/**
 * Splits text based on search into stylable spans
 * @param target 
 * @param textContent 
 * @param search 
 */export function split(
  target: HTMLElement,
  textContent: string,
  search: string | null | undefined
) {
  if (typeof search === "string") {
    const split = textContent.split(new RegExp(search, "i"));
    const tcL = textContent.length; //token content length;
    const tc = split.length;
    const len = search.length;
    let iP = 0;
    let text = "";
    split.forEach((t, i) => {
      iP += t.length;
      text += t;
      if (i < tc && iP < tcL)
        text +=
          "<span class='match'>" + textContent.substr(iP, len) + "</span>";
      iP += len;
    });
    target.innerHTML = text;
  } else {
    target.textContent = textContent;
  }
}
