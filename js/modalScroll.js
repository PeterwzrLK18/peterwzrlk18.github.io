document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const modal = document.getElementById('modal');
    const openModalBtns = document.querySelectorAll('.enlarge-btn'); // 所有触发模态框的按钮
    const closeModalBtns = document.querySelectorAll('.close');
    const modalContentContainer = document.querySelector('.modal-content-container');
    const threshold = 20; // 右侧边缘的敏感度，单位为px

    // 打开模态框函数
    function openModal(imgSrc, captionText) {
        const img = document.getElementById('img01');
        img.src = imgSrc;
        document.getElementById('caption').textContent = captionText;
        modal.style.display = 'flex';
        document.body.classList.add('no-scroll'); // 添加no-scroll类到body以禁用滚动
    }

    // 关闭模态框函数
    function closeModal() {
        modal.style.display = 'none';
        document.body.classList.remove('no-scroll'); // 移除no-scroll类从body以恢复滚动
    }

    // 绑定所有打开模态框的点击事件
    openModalBtns.forEach(function(btn) {
        btn.addEventListener('click', function(event) {
            const imgElement = event.target.previousElementSibling;
            const imgSrc = imgElement.src;
            const captionText = imgElement.alt;
            openModal(imgSrc, captionText);
        });
    });

    // 绑定关闭模态框的点击事件
    closeModalBtns.forEach(function(closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    });

    // 点击模态框外部关闭模态框
    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    }

    // 鼠标悬停显示滚动条（如果需要）
    if (modalContentContainer) {
        modalContentContainer.addEventListener('mousemove', function(event) {
            const rect = modalContentContainer.getBoundingClientRect();
            if (event.clientX >= rect.right - threshold && event.clientX <= rect.right) {
                modalContentContainer.closest('.modal').classList.add('show-scrollbar');
            } else {
                modalContentContainer.closest('.modal').classList.remove('show-scrollbar');
            }
        });
    }
});