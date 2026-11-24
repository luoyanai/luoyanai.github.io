(() => {
  const dialog = document.querySelector("#film-player");
  if (!dialog || typeof dialog.showModal !== "function") return;

  const video = dialog.querySelector("video");
  const title = document.querySelector("#player-title");
  const file = document.querySelector("#film-file");
  const status = document.querySelector("#film-status");
  let trigger;

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[data-film]");
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    trigger = link;
    title.textContent = link.dataset.film;
    status.textContent = "";
    file.href = link.href;
    const cover = link.closest(".entry").querySelector(".media img");
    video.poster = link.dataset.poster || cover.currentSrc || cover.src;
    video.setAttribute("aria-label", title.textContent);
    video.src = link.href;
    dialog.showModal();
    video.play().catch(() => {
      // Native controls remain available when the browser requires a second tap.
    });
  });

  video.addEventListener("error", () => {
    if (dialog.open && video.hasAttribute("src")) {
      status.textContent = "Playback unavailable. Open the MP4 file to use your video player.";
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right ||
        event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener("close", () => {
    video.pause();
    video.removeAttribute("src");
    video.removeAttribute("poster");
    video.load();
    status.textContent = "";
    trigger?.focus({ preventScroll: true });
  });
})();
