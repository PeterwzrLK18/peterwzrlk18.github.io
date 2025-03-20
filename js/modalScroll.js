document.addEventListener('DOMContentLoaded', function() {
    const modalContentContainer = document.querySelector('.modal-content-container');
    const scrollbarContainer = document.querySelector('.scrollbar-container');
    const threshold = 20; // 右侧边缘的敏感度，单位为px

    modalContentContainer.addEventListener('mousemove', function(event) {
        const rect = modalContentContainer.getBoundingClientRect();
        if (event.clientX >= rect.right - threshold && event.clientX <= rect.right) {
            modalContentContainer.closest('.modal').classList.add('show-scrollbar');
        } else {
            modalContentContainer.closest('.modal').classList.remove('show-scrollbar');
        }
    });
});