async function loadWorks() {
  try {
    const response = await fetch("/js/works-data.json");
    const works = await response.json();
    renderWorks(works);
  } catch (error) {
    console.error("Failed to load works data:", error);
  }
}

function renderWorks(works) {
  const worksList = document.getElementById("works-list");
  if (!worksList) return;

  works.forEach((work) => {
    const link = document.createElement("a");
    link.href = work.href;
    link.className = "sector-link";

    const article = document.createElement("article");
    article.className = "sector-item";

    const title = document.createElement("h2");
    title.className = "work-title";
    title.textContent = work.title;

    const content = document.createElement("div");
    content.className = "content";

    const img = document.createElement("img");
    img.className = "img";
    img.src = work.img;
    img.alt = work.alt;
    img.loading = "lazy"; // 懒加载

    content.appendChild(img);
    article.appendChild(title);
    article.appendChild(content);
    link.appendChild(article);
    worksList.appendChild(link);
  });
}

document.addEventListener("DOMContentLoaded", loadWorks);
