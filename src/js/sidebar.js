fetch('sidebar.html')
    .then(response => response.text())
    .then(data => {
        // โหลด sidebar เข้าไปใน div
        document.getElementById('sidebar-container').innerHTML = data;

        // หาไฟล์หน้าปัจจุบัน
        let currentPage = window.location.pathname.split('/').pop();

        // กรณีเปิดเว็บที่ root เช่น domain.com/
        if (currentPage === '') {
            currentPage = 'index.html';
        }

        // ใส่ active menu
        document.querySelectorAll('.menu-item').forEach(item => {
            const href = item.getAttribute('href');

            if (href === currentPage) {
                item.classList.add('active');
            }
        });
    })
    .catch(error => {
        console.error('Sidebar load error:', error);
    });