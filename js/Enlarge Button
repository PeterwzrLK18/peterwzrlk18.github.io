document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded and parsed");

    // 获取所有带有'enlarge-btn'类的按钮以及对应的图片，并为每个元素添加点击事件监听器
    const enlargeButtons = document.querySelectorAll('.enlarge-btn');
    if (enlargeButtons.length === 0) {
        console.warn("No elements with class 'enlarge-btn' found.");
    }
    enlargeButtons.forEach(button => {
        const img = button.previousElementSibling; // 假设图片是按钮前一个兄弟元素
        if (!img || img.tagName.toLowerCase() !== 'img') {
            console.error("Expected an image element before the enlarge button.");
            return;
        }

        button.addEventListener('click', function(event) {
            console.log(`Button clicked, opening modal for image src: ${img.src}`);
            openModal(img.src, img.alt);
        });
    });

    function openModal(src, alt) {
        console.log(`Opening modal with src: ${src}, alt: ${alt}`);
        // 获取模态框及其内部元素
        const modal = document.getElementById("modal");
        if (!modal) {
            console.error("Modal element not found.");
            return;
        }
        const modalImg = document.getElementById("img01");
        const captionText = document.getElementById("caption");

        if (!modalImg || !captionText) {
            console.error("Modal content or caption element not found.");
            return;
        }

        // 更新模态框内容
        modal.style.display = "flex"; // 使用flex来保证内容居中
        modalImg.src = src;
        captionText.innerHTML = alt;

        // 点击关闭按钮时隐藏模态框
        modal.querySelector('.close').onclick = function() {
            console.log("Close button clicked");
            closeModal(modal);
        };

        // 点击模态框外部区域也可以关闭模态框
        modal.onclick = function(event) {
            if (event.target === modal) {  // 检查点击是否发生在模态框背景上
                console.log("Background click detected, closing modal");
                closeModal(modal);
            }
        }
    }

    function closeModal(modal) {
        console.log("Closing modal");
        modal.style.display = "none";
    }
});