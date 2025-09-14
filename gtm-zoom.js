// GTM Page Image Zoom Functionality

document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.screenshot-image');
    
    if (images.length > 0) {
        // Create the modal structure
        const modal = document.createElement('div');
        modal.id = 'image-modal';
        modal.style.display = 'none';
        modal.style.position = 'fixed';
        modal.style.zIndex = '1000';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        modal.style.display = 'flex';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        modal.style.opacity = '0';
        modal.style.transition = 'opacity 0.3s ease';

        const modalImg = document.createElement('img');
        modalImg.id = 'modal-image';
        modalImg.style.maxWidth = '90%';
        modalImg.style.maxHeight = '90%';
        modalImg.style.transform = 'scale(0.8)';
        modalImg.style.transition = 'transform 0.3s ease';

        const closeBtn = document.createElement('span');
        closeBtn.id = 'modal-close';
        closeBtn.innerHTML = '&times;';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '35px';
        closeBtn.style.color = '#fff';
        closeBtn.style.fontSize = '40px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';

        modal.appendChild(modalImg);
        modal.appendChild(closeBtn);
        document.body.appendChild(modal);

        // Add click listeners to images
        images.forEach(image => {
            image.style.cursor = 'zoom-in';
            image.addEventListener('click', () => {
                modal.style.display = 'flex';
                setTimeout(() => {
                    modal.style.opacity = '1';
                    modalImg.style.transform = 'scale(1)';
                }, 10);
                modalImg.src = image.src;
            });
        });

        // Close functionality
        const closeModal = () => {
            modal.style.opacity = '0';
            modalImg.style.transform = 'scale(0.8)';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }
});